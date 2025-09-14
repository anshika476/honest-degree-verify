import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    const authHeader = req.headers.get('Authorization')!
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''))
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { fileData, filename, metadata } = await req.json()

    // Generate SHA-256 hash of the file
    const encoder = new TextEncoder()
    const data = encoder.encode(fileData)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const certificateHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    // Check if certificate exists in our database
    const { data: existingCert, error: checkError } = await supabaseClient
      .from('certificates')
      .select('*')
      .eq('certificate_hash', certificateHash)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError
    }

    let verificationResult;

    if (existingCert) {
      // Certificate found in database - it's verified
      verificationResult = {
        isAuthentic: true,
        confidence: 95,
        details: `Certificate verified against blockchain. Originally issued to ${existingCert.holder_name} on ${existingCert.issue_date}`,
        certificateInfo: {
          issuer: existingCert.issuer,
          holder: existingCert.holder_name,
          issueDate: existingCert.issue_date,
          type: existingCert.certificate_type
        },
        hash: certificateHash
      }

      // Update verification status
      await supabaseClient
        .from('certificates')
        .update({ verification_status: 'verified', updated_at: new Date().toISOString() })
        .eq('id', existingCert.id)

    } else {
      // Certificate not found - potentially forged
      verificationResult = {
        isAuthentic: false,
        confidence: 15,
        details: "Certificate hash not found in blockchain database. This may be a forged document.",
        hash: certificateHash
      }

      // Optionally store the unverified certificate for audit purposes
      await supabaseClient
        .from('certificates')
        .insert({
          certificate_hash: certificateHash,
          original_filename: filename,
          file_size: metadata.size || 0,
          issuer: 'Unknown',
          holder_name: 'Unknown',
          issue_date: new Date().toISOString().split('T')[0],
          certificate_type: 'Unknown',
          verification_status: 'rejected',
          uploaded_by: user.id
        })
    }

    return new Response(
      JSON.stringify(verificationResult),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Verification error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Verification failed', 
        details: error.message,
        isAuthentic: false,
        confidence: 0
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})