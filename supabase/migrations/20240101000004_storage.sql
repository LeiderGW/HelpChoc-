-- ============================================
-- STORAGE CONFIGURATION
-- ============================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
    ('avatars', 'avatars', true),
    ('need-images', 'need-images', true),
    ('organization-logos', 'organization-logos', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STORAGE POLICIES FOR AVATARS
-- ============================================
-- Anyone can view avatars
CREATE POLICY "Anyone can view avatars" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

-- Authenticated users can upload avatars
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Users can update their own avatar
CREATE POLICY "Users can update their avatar" ON storage.objects
    FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users can delete their own avatar
CREATE POLICY "Users can delete their avatar" ON storage.objects
    FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================
-- STORAGE POLICIES FOR NEED IMAGES
-- ============================================
-- Anyone can view need images
CREATE POLICY "Anyone can view need images" ON storage.objects
    FOR SELECT USING (bucket_id = 'need-images');

-- Authenticated users can upload need images
CREATE POLICY "Authenticated users can upload need images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'need-images' AND auth.role() = 'authenticated');

-- Users can update their own need images
CREATE POLICY "Users can update their need images" ON storage.objects
    FOR UPDATE USING (bucket_id = 'need-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================
-- STORAGE POLICIES FOR ORGANIZATION LOGOS
-- ============================================
-- Anyone can view organization logos
CREATE POLICY "Anyone can view organization logos" ON storage.objects
    FOR SELECT USING (bucket_id = 'organization-logos');

-- Organizations can upload logos
CREATE POLICY "Organizations can upload logos" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'organization-logos' AND auth.role() IN ('admin', 'organization'));

-- Organizations can update their own logos
CREATE POLICY "Organizations can update their logos" ON storage.objects
    FOR UPDATE USING (bucket_id = 'organization-logos' AND auth.uid()::text = (storage.foldername(name))[1]);