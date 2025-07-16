-- Create storage bucket for map media files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'map-media',
  'map-media',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg', 'audio/mpeg', 'audio/wav', 'audio/ogg']
) ON CONFLICT (id) DO NOTHING;

-- Create storage policy to allow authenticated users to upload
CREATE POLICY "Allow authenticated users to upload map media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'map-media' AND 
    auth.role() = 'authenticated'
  );

-- Create storage policy to allow public read access
CREATE POLICY "Allow public read access to map media" ON storage.objects
  FOR SELECT USING (bucket_id = 'map-media');

-- Create storage policy to allow users to delete their own uploads
CREATE POLICY "Allow users to delete their own map media" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'map-media' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  ); 