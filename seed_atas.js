const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 1. Carregar variáveis de ambiente do .env.local manualmente
const envPath = path.resolve(process.cwd(), '.env.local');
let supabaseUrl = '';
let supabaseKey = '';

try {
    const envFile = fs.readFileSync(envPath, 'utf8');
    const lines = envFile.split('\n');
    for (const line of lines) {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim().replace(/"/g, ''); // Remove quotes if present
            if (key === 'NEXT_PUBLIC_SUPABASE_URL') supabaseUrl = value;
            if (key === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') supabaseKey = value;
        }
    }
} catch (error) {
    console.error('Erro ao ler .env.local:', error);
    process.exit(1);
}

if (!supabaseUrl || !supabaseKey) {
    console.error('ERRO: Credenciais do Supabase não encontradas no .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const atasData = [
    {
        manual_city: 'NOVA ALVORA',
        company: 'MCP',
        manual_agency: 'SECRETARIAS',
        manual_title: 'CARNES E PRODUTOS REFRIGERADOS',
        start_date: '2025-12-03',
        end_date: '2026-02-03',
        value: 0,
        ata_number: '3 TERMOS ADITIVO P.E 041/2023 PROC. 125/2025',
        observations: 'ADTIVADO - VIGÊNCIA 02 MESES',
        is_extended: true
    },
    {
        manual_city: 'LAGUNA CARAPA',
        company: 'MCP',
        manual_agency: 'ASSISTENCIA SOCIAL',
        manual_title: 'CESTA BASICA',
        start_date: '2026-01-20',
        end_date: '2026-04-20',
        value: 19262.49,
        ata_number: 'PRIMEIRO TERMO ADITIVO DE 25% ao CONTRATO n. 42/2025',
        observations: 'ADTIVADO - VIGÊNCIA 90 DIAS',
        is_extended: true
    },
    {
        manual_city: 'RIBAS DO RIO PARDO',
        company: 'MCP',
        manual_agency: 'SEC EDUCAÇÃO',
        manual_title: 'MERENDA',
        start_date: '2026-01-28',
        end_date: '2026-04-28',
        value: 679286.70,
        ata_number: '4 TERMOS ADITIVO ATA DE REG. 033/2024',
        observations: 'ADTIVADO - VIGÊNCIA 03 MESES',
        is_extended: true
    },
    {
        manual_city: 'CORUMBA',
        company: 'MCP',
        manual_agency: 'SE. EDUCAÇÃO',
        manual_title: 'SECRETARIAS',
        start_date: '2025-04-30',
        end_date: '2026-04-30',
        value: 482970.13,
        ata_number: 'CONTRATO ADMINISTRATIVO Nº 14/2025 PROCESSO ADM Nº 12.500/2025',
        observations: 'VIGÊNCIA 1 ANO',
        is_extended: false
    },
    {
        manual_city: 'CORUMBA',
        company: 'MCP',
        manual_agency: 'EDUCAÇÃO',
        manual_title: 'SECRETARIAS',
        start_date: '2025-07-10',
        end_date: '2026-07-10',
        value: 179872.00,
        ata_number: 'CONTRATO ADMINISTRATIVO Nº 29/2025 PROCESSO ADM Nº 17.824/2025',
        observations: 'VIGÊNCIA 1 ANO',
        is_extended: false
    },
    {
        manual_city: 'CORUMBA',
        company: 'MCP',
        manual_agency: 'SEC EDUCAÇÃO',
        manual_title: 'MERENDA',
        start_date: '2025-07-11',
        end_date: '2026-07-10',
        value: 1073004.02,
        ata_number: 'CONTRATO ADMINISTRATIVO Nº 31/2025 PROCESSO ADM Nº 12299/2025',
        observations: 'VIGÊNCIA 1 ANO',
        is_extended: false
    },
    {
        manual_city: 'DOIS IRMAOS',
        company: 'POLARIS',
        manual_agency: 'SECRETARIAS',
        manual_title: 'GEN SECRETARIAS',
        start_date: '2025-10-30',
        end_date: '2026-10-30',
        value: 237566.82,
        ata_number: 'ATA DE REG. 062/2025 PREGAO PRESENCIAL 06/2025 PROCESSO ADM 078/2025',
        observations: 'VIGÊNCIA 1 ANO',
        is_extended: false
    },
    {
        manual_city: 'MARACAJU',
        company: 'PONTUAL',
        manual_agency: 'ASSISTENCIA SOCIAL',
        manual_title: 'CESTAS BASICAS LOTE 01, 02 E 03',
        start_date: '2025-12-04',
        end_date: '2026-12-04',
        value: 2430382.24,
        ata_number: '2 TERMO ADITIVO ATA R.P 01/2025 PROCESSO 4337/2024',
        observations: 'ADTIVADO - VIGÊNCIA 1 ANO',
        is_extended: true
    },
    {
        manual_city: 'PARANAIBA',
        company: 'PONTUAL',
        manual_agency: 'ASSISTENCIA SOCIAL',
        manual_title: 'CESTAS BASICAS LOTE 01 E LOTE 02',
        start_date: '2025-12-09',
        end_date: '2026-12-09',
        value: 1034796.00,
        ata_number: '2 TERMO ADITIVO PREGÃO 50/24 - PROCESSO LIC. 136/2024',
        observations: 'ADTIVADO - VIGÊNCIA 1 ANO',
        is_extended: true
    },
    {
        manual_city: 'ROCHEDO',
        company: 'PONTUAL',
        manual_agency: 'SECRETARIAS',
        manual_title: 'GEN SECRETARIAS',
        start_date: '2025-12-16',
        end_date: '2026-12-16',
        value: 0,
        ata_number: '1 TERMO ADITIVO PREGÃO PRESENCIAL 19/2024 ATA R.P 12/2024',
        observations: 'ADTIVADO - VIGÊNCIA 1 ANO',
        is_extended: true
    },
    {
        manual_city: 'RIBAS DO RIO PARDO',
        company: 'PONTUAL',
        manual_agency: 'ASSISTENCIA SOCIAL',
        manual_title: 'GEN SECRETARIAS',
        start_date: '2026-03-27',
        end_date: '2027-03-27',
        value: 684064.00,
        ata_number: '1 TERMO ADITIVO',
        observations: 'ADTIVADO - VIGÊNCIA 1 ANO',
        is_extended: true
    },
    {
        manual_city: 'DOURADOS',
        company: 'MCP',
        manual_agency: 'ASSISTENCIA SOCIAL',
        manual_title: 'CESTA BASICA',
        start_date: '2026-01-01',
        end_date: '2026-09-12',
        value: 0,
        ata_number: '1 TERMO ADITIVO DISPENSA 025/2025 - PROCE 055/2025 CONTRATO 038/2025',
        observations: 'ADTIVADO - VIGÊNCIA 05 MESES',
        is_extended: true
    },
    {
        manual_city: 'SIDROLANDIA',
        company: 'MCP',
        manual_agency: 'ASSISTENCIA SOCIAL',
        manual_title: 'CESTA BASICA',
        start_date: null,
        end_date: null,
        value: 205002.00,
        ata_number: 'S/N - DADOS INCOMPLETOS',
        observations: 'VIGÊNCIA 1 ANO',
        is_extended: false
    }
];

async function seed() {
    console.log('Iniciando inserção de dados...');

    // Inserir um por um para garantir
    for (const ata of atasData) {
        const { error } = await supabase.from('atas').insert([ata]);
        if (error) {
            console.error('Erro ao inserir ata:', ata.manual_city, error.message);
        } else {
            console.log('Ata inserida com sucesso:', ata.manual_city, ata.manual_title);
        }
    }

    console.log('Processo finalizado!');
}

seed();
