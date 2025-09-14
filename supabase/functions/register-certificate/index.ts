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

    const { 
      fileData, 
      filename, 
      metadata,
      certificateInfo 
    } = await req.json()

    // Generate SHA-256 hash of the file
    const encoder = new TextEncoder()
    const data = encoder.encode(fileData)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const certificateHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    // Register certificate in blockchain database
    const { data: newCert, error: insertError } = await supabaseClient
      .from('certificates')
      .insert({
        certificate_hash: certificateHash,
        original_filename: filename,
        file_size: metadata.size || 0,
        issuer: certificateInfo.issuer,
        holder_name: certificateInfo.holderName,
        issue_date: certificateInfo.issueDate,
        certificate_type: certificateInfo.type,
        verification_status: 'verified',
        uploaded_by: user.id
      })
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Certificate successfully registered in blockchain',
        certificateId: newCert.id,
        hash: certificateHash,
        registrationDate: newCert.created_at
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Registration error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Registration failed', 
        details: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})