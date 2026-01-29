-- CRIAÇÃO DA TABELA ATAS SE NÃO EXISTIR
CREATE TABLE IF NOT EXISTS public.atas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tender_id UUID REFERENCES public.tenders(id) ON DELETE SET NULL,
    manual_title TEXT,
    manual_agency TEXT,
    manual_city TEXT,
    value NUMERIC DEFAULT 0,
    ata_number TEXT,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    can_extend BOOLEAN DEFAULT FALSE,
    can_adhere BOOLEAN DEFAULT FALSE,
    pdf_url TEXT,
    attachment_url TEXT,
    observations TEXT,
    is_extended BOOLEAN DEFAULT FALSE,
    company TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- HABILITAR RLS SE NECESSÁRIO (OPCIONAL, MAS RECOMENDADO)
ALTER TABLE public.atas ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS DE ACESSO (PERMISSIVA PARA TESTE)
CREATE POLICY "Allow all actions for atas" ON public.atas
    FOR ALL USING (true) WITH CHECK (true);

-- INSERÇÃO DOS DADOS DA IMAGEM
INSERT INTO public.atas (
    manual_city, 
    company, 
    manual_agency, 
    manual_title, 
    start_date, 
    end_date, 
    value, 
    ata_number, 
    observations,
    is_extended
) VALUES
(
    'NOVA ALVORA', 
    'MCP', 
    'SECRETARIAS', 
    'CARNES E PRODUTOS REFRIGERADOS', 
    '2025-12-03', 
    '2026-02-03', 
    0, 
    '3 TERMOS ADITIVO P.E 041/2023 PROC. 125/2025', 
    'ADTIVADO - VIGÊNCIA 02 MESES',
    TRUE
),
(
    'LAGUNA CARAPA', 
    'MCP', 
    'ASSISTENCIA SOCIAL', 
    'CESTA BASICA', 
    '2026-01-20', 
    '2026-04-20', 
    19262.49, 
    'PRIMEIRO TERMO ADITIVO DE 25% ao CONTRATO n. 42/2025', 
    'ADTIVADO - VIGÊNCIA 90 DIAS',
    TRUE
),
(
    'RIBAS DO RIO PARDO', 
    'MCP', 
    'SEC EDUCAÇÃO', 
    'MERENDA', 
    '2026-01-28', 
    '2026-04-28', 
    679286.70, 
    '4 TERMOS ADITIVO ATA DE REG. 033/2024', 
    'ADTIVADO - VIGÊNCIA 03 MESES',
    TRUE
),
(
    'CORUMBA', 
    'MCP', 
    'SE. EDUCAÇÃO', 
    'SECRETARIAS', 
    '2025-04-30', 
    '2026-04-30', 
    482970.13, 
    'CONTRATO ADMINISTRATIVO Nº 14/2025 PROCESSO ADM Nº 12.500/2025', 
    'VIGÊNCIA 1 ANO',
    FALSE
),
(
    'CORUMBA', 
    'MCP', 
    'EDUCAÇÃO', 
    'SECRETARIAS', 
    '2025-07-10', 
    '2026-07-10', 
    179872.00, 
    'CONTRATO ADMINISTRATIVO Nº 29/2025 PROCESSO ADM Nº 17.824/2025', 
    'VIGÊNCIA 1 ANO',
    FALSE
),
(
    'CORUMBA', 
    'MCP', 
    'SEC EDUCAÇÃO', 
    'MERENDA', 
    '2025-07-11', 
    '2026-07-10', 
    1073004.02, 
    'CONTRATO ADMINISTRATIVO Nº 31/2025 PROCESSO ADM Nº 12299/2025', 
    'VIGÊNCIA 1 ANO',
    FALSE
),
(
    'DOIS IRMAOS', 
    'POLARIS', 
    'SECRETARIAS', 
    'GEN SECRETARIAS', 
    '2025-10-30', 
    '2026-10-30', 
    237566.82, 
    'ATA DE REG. 062/2025 PREGAO PRESENCIAL 06/2025 PROCESSO ADM 078/2025', 
    'VIGÊNCIA 1 ANO',
    FALSE
),
(
    'MARACAJU', 
    'PONTUAL', 
    'ASSISTENCIA SOCIAL', 
    'CESTAS BASICAS LOTE 01, 02 E 03', 
    '2025-12-04', 
    '2026-12-04', 
    2430382.24, 
    '2 TERMO ADITIVO ATA R.P 01/2025 PROCESSO 4337/2024', 
    'ADTIVADO - VIGÊNCIA 1 ANO',
    TRUE
),
(
    'PARANAIBA', 
    'PONTUAL', 
    'ASSISTENCIA SOCIAL', 
    'CESTAS BASICAS LOTE 01 E LOTE 02', 
    '2025-12-09', 
    '2026-12-09', 
    1034796.00, 
    '2 TERMO ADITIVO PREGÃO 50/24 - PROCESSO LIC. 136/2024', 
    'ADTIVADO - VIGÊNCIA 1 ANO',
    TRUE
),
(
    'ROCHEDO', 
    'PONTUAL', 
    'SECRETARIAS', 
    'GEN SECRETARIAS', 
    '2025-12-16', 
    '2026-12-16', 
    0, 
    '1 TERMO ADITIVO PREGÃO PRESENCIAL 19/2024 ATA R.P 12/2024', 
    'ADTIVADO - VIGÊNCIA 1 ANO',
    TRUE
),
(
    'RIBAS DO RIO PARDO', 
    'PONTUAL', 
    'ASSISTENCIA SOCIAL', 
    'GEN SECRETARIAS', 
    '2026-03-27', 
    '2027-03-27', 
    684064.00, 
    '1 TERMO ADITIVO', 
    'ADTIVADO - VIGÊNCIA 1 ANO',
    TRUE
),
(
    'DOURADOS', 
    'MCP', 
    'ASSISTENCIA SOCIAL', 
    'CESTA BASICA', 
    '2026-01-01', 
    '2026-09-12', 
    0, 
    '1 TERMO ADITIVO DISPENSA 025/2025 - PROCE 055/2025 CONTRATO 038/2025', 
    'ADTIVADO - VIGÊNCIA 05 MESES',
    TRUE
),
(
    'SIDROLANDIA', 
    'MCP', 
    'ASSISTENCIA SOCIAL', 
    'CESTA BASICA', 
    NULL, 
    NULL, 
    205002.00, 
    'S/N - DADOS INCOMPLETOS', 
    'VIGÊNCIA 1 ANO',
    FALSE
);
