import { supabase } from './supabase'

export interface CertificateVerificationResult {
  isAuthentic: boolean
  confidence: number
  details: string
  hash?: string
  certificateInfo?: {
    issuer: string
    holder: string
    issueDate: string
    type: string
  }
}

export interface CertificateInfo {
  issuer: string
  holderName: string
  issueDate: string
  type: string
}

export const verifyCertificate = async (
  file: File
): Promise<CertificateVerificationResult> => {
  try {
    // Convert file to base64
    const fileData = await fileToBase64(file)
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      throw new Error('Authentication required')
    }

    const response = await supabase.functions.invoke('verify-certificate', {
      body: {
        fileData,
        filename: file.name,
        metadata: {
          size: file.size,
          type: file.type
        }
      }
    })

    if (response.error) {
      throw response.error
    }

    return response.data
  } catch (error) {
    console.error('Certificate verification failed:', error)
    return {
      isAuthentic: false,
      confidence: 0,
      details: `Verification failed: ${error.message}`
    }
  }
}

export const registerCertificate = async (
  file: File,
  certificateInfo: CertificateInfo
): Promise<{ success: boolean; message: string; hash?: string }> => {
  try {
    const fileData = await fileToBase64(file)
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      throw new Error('Authentication required')
    }

    const response = await supabase.functions.invoke('register-certificate', {
      body: {
        fileData,
        filename: file.name,
        metadata: {
          size: file.size,
          type: file.type
        },
        certificateInfo
      }
    })

    if (response.error) {
      throw response.error
    }

    return response.data
  } catch (error) {
    console.error('Certificate registration failed:', error)
    return {
      success: false,
      message: `Registration failed: ${error.message}`
    }
  }
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const result = reader.result as string
      // Remove the data URL prefix to get just the base64 data
      const base64Data = result.split(',')[1]
      resolve(base64Data)
    }
    reader.onerror = error => reject(error)
  })
}

export const getCertificateHistory = async () => {
  try {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Failed to fetch certificate history:', error)
    return []
  }
}