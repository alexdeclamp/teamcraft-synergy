
-- Create a storage bucket for project images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
SELECT 'project_images', 'Project Images', true
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'project_images'
);

-- Set up security policies for the project_images bucket
CREATE POLICY "Everyone can read project images"
ON storage.objects FOR SELECT
USING (bucket_id = 'project_images');

-- Only authenticated users can insert their own images
CREATE POLICY "Authenticated users can upload project images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project_images');

-- Only owners can update their own images
CREATE POLICY "Users can update their own project images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'project_images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Only owners can delete their own images
CREATE POLICY "Users can delete their own project images"
ON storage.objects FOR DELETE
USING (bucket_id = 'project_images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Create a storage bucket for project documents if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
SELECT 'project_documents', 'Project Documents', true
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'project_documents'
);

-- Set up security policies for the project_documents bucket
CREATE POLICY "Everyone can read project documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'project_documents');

-- Only authenticated users can insert their own documents
CREATE POLICY "Authenticated users can upload project documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project_documents');

-- Only owners can update their own documents
CREATE POLICY "Users can update their own project documents"
ON storage.objects FOR UPDATE
USING (bucket_id = 'project_documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Only owners can delete their own documents
CREATE POLICY "Users can delete their own project documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'project_documents' AND (storage.foldername(name))[1] = auth.uid()::text);
