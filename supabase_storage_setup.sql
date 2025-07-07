-- Script para configurar o storage do Supabase
-- Execute este script no SQL Editor do seu projeto Supabase

-- Criar bucket para imagens de propriedades
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true);

-- Política para permitir upload de imagens
CREATE POLICY "Allow authenticated users to upload images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'property-images' AND auth.role() = 'authenticated');

-- Política para permitir acesso público às imagens
CREATE POLICY "Allow public access to images" ON storage.objects
FOR SELECT USING (bucket_id = 'property-images');

-- Política para permitir que usuários deletem suas próprias imagens
CREATE POLICY "Allow users to delete their own images" ON storage.objects
FOR DELETE USING (bucket_id = 'property-images' AND auth.uid() = owner);
