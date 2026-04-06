-- Add new columns to articles
ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS subtitle text DEFAULT '',
  ADD COLUMN IF NOT EXISTS layout text DEFAULT 'top',
  ADD COLUMN IF NOT EXISTS notes jsonb DEFAULT '[]'::jsonb;

-- Create storage bucket for article images
INSERT INTO storage.buckets (id, name, public)
VALUES ('article-images', 'article-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access
CREATE POLICY "article_images_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'article-images');

-- Authenticated users can upload (folder = their user id)
CREATE POLICY "article_images_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'article-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Authenticated users can update their own uploads
CREATE POLICY "article_images_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'article-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Authenticated users can delete their own uploads
CREATE POLICY "article_images_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'article-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );