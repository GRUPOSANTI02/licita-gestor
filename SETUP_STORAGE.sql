-- SCRIPT PARA CONFIGURAR O STORAGE (BUCKET 'ATAS') NO SUPABASE

-- 1. Cria o bucket 'ATAS' como público (acessível via URL)
INSERT INTO storage.buckets (id, name, public)
VALUES ('ATAS', 'ATAS', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Permite acesso público para VISUALIZAR arquivos (Download)
CREATE POLICY "Public Access Select"
ON storage.objects FOR SELECT
USING ( bucket_id = 'ATAS' );

-- 3. Permite acesso público para FAZER UPLOAD de arquivos (Insert)
-- Nota: Em produção real, você pode querer restringir isso apenas a usuários autenticados (auth.role() = 'authenticated')
CREATE POLICY "Public Access Insert"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'ATAS' );

-- 4. Permite atualizar/deletar (opcional, útil para gestão)
CREATE POLICY "Public Access Update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'ATAS' );

CREATE POLICY "Public Access Delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'ATAS' );
