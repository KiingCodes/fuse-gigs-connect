
-- Create storage bucket for verification documents
INSERT INTO storage.buckets (id, name, public) VALUES ('verification-docs', 'verification-docs', false);

-- Only the owner can upload their verification docs
CREATE POLICY "Users can upload own verification docs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'verification-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Only the owner can view their verification docs
CREATE POLICY "Users can view own verification docs"
ON storage.objects FOR SELECT
USING (bucket_id = 'verification-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow overwriting (upsert)
CREATE POLICY "Users can update own verification docs"
ON storage.objects FOR UPDATE
USING (bucket_id = 'verification-docs' AND auth.uid()::text = (storage.foldername(name))[1]);
