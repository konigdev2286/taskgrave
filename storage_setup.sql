-- Setup for J'arrive Logistics Storage Buckets
-- Run this in your Supabase SQL Editor

-- 1. Create the bucket
insert into storage.buckets (id, name, public)
values ('driver-documents', 'driver-documents', true)
on conflict (id) do nothing;

-- 2. Set up Storage Policies
-- Allow anyone to read files (Public Bucket)
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'driver-documents' );

-- Allow authenticated users to upload files
-- We filter by authenticated to prevent random bots, but allow any driver to upload his proofs/docs
create policy "Authenticated Upload"
on storage.objects for insert
with check ( 
  bucket_id = 'driver-documents' 
  AND auth.role() = 'authenticated' 
);

-- Allow users to update their own files (upsert)
create policy "Authenticated Update"
on storage.objects for update
using ( 
  bucket_id = 'driver-documents' 
  AND auth.role() = 'authenticated' 
);

-- Note: In a production app, you would further restrict 'insert' and 'update' 
-- based on the user's ID within the file path (e.g., /documents/{user_id}/...)
