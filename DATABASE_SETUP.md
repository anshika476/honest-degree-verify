# Blockchain Certificate Verification Database Setup

## Step 1: Create the Certificates Table

Run this SQL in your Supabase SQL Editor:

```sql
-- Create certificates table to store certificate hashes and verification data
CREATE TABLE IF NOT EXISTS certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  certificate_hash TEXT NOT NULL UNIQUE,
  original_filename TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  issuer TEXT NOT NULL,
  holder_name TEXT NOT NULL,
  issue_date DATE NOT NULL,
  certificate_type TEXT NOT NULL,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for fast hash lookups
CREATE INDEX idx_certificates_hash ON certificates(certificate_hash);
CREATE INDEX idx_certificates_status ON certificates(verification_status);

-- Enable RLS
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own certificates" ON certificates
  FOR SELECT USING (auth.uid() = uploaded_by);

CREATE POLICY "Users can insert their own certificates" ON certificates
  FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can update their own certificates" ON certificates
  FOR UPDATE USING (auth.uid() = uploaded_by);
```

## Step 2: Deploy Edge Functions

1. Go to your Supabase Dashboard > Edge Functions
2. Create a new function called `verify-certificate`
3. Copy the code from `supabase/functions/verify-certificate/index.ts`
4. Create another function called `register-certificate`
5. Copy the code from `supabase/functions/register-certificate/index.ts`

## Step 3: Environment Variables

Make sure your Supabase URL and Anon Key are properly configured in your environment variables.

## How It Works

1. **File Upload**: When a user uploads a certificate, the system generates a SHA-256 hash
2. **Blockchain Verification**: The hash is checked against the stored hashes in the database
3. **Result**: If found, the certificate is verified; if not, it's marked as potentially forged
4. **Certificate Registration**: Authentic certificates can be registered in the blockchain database

## Security Features

- Row Level Security (RLS) ensures users can only see their own certificates
- SHA-256 hashing provides cryptographic verification
- Audit trail with timestamps and user tracking