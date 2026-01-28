-- Execute este comando no SQL Editor do seu projeto Supabase para corrigir o erro de salvamento da data de sessão.

ALTER TABLE tenders 
ADD COLUMN IF NOT EXISTS next_session_date TIMESTAMP WITH TIME ZONE;

-- Garante que o usuário autenticado possa ver e editar essa coluna (caso tenha RLS policies restritivas)
-- (Geralmente as policies são por linha, então só adicionar a coluna já deve bastar)
