-- Execute este comando no SQL Editor do seu Dashbord Supabase para corrigir o erro de salvamento
-- O banco de dados está bloqueando o novo status "not_participated". Este comando atualiza a regra.

ALTER TABLE tenders DROP CONSTRAINT IF EXISTS tenders_status_check;

ALTER TABLE tenders 
ADD CONSTRAINT tenders_status_check 
CHECK (status IN (
  'pending', 
  'in_progress', 
  'won', 
  'lost', 
  'running', 
  'not_participated',
  -- Incluindo versões legadas/pt-br por segurança
  'Ganha', 
  'Perdida', 
  'Em Análise', 
  'Em Andamento', 
  'Aguardando', 
  'Não Participou'
));
