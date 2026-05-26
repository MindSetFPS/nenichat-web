-- Add business_logo_url column to business table
ALTER TABLE business ADD COLUMN IF NOT EXISTS business_logo_url TEXT;

-- Create business bucket for storing business logos (5MB limit)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types, created_at, updated_at)
VALUES ('business', 'business', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'], NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist (to fix any issues)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;
DROP POLICY IF EXISTS "Owner Delete" ON storage.objects;

-- Public read access to business bucket
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'business');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated Upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'business' AND auth.role() = 'authenticated');

-- Allow authenticated users to update their own files
CREATE POLICY "Authenticated Update" ON storage.objects
FOR UPDATE USING (bucket_id = 'business' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete their own files
CREATE POLICY "Owner Delete" ON storage.objects
FOR DELETE USING (bucket_id = 'business' AND auth.role() = 'authenticated');
