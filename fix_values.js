const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase (mesma do anterior)
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
            const value = parts.slice(1).join('=').trim().replace(/"/g, '');
            if (key === 'NEXT_PUBLIC_SUPABASE_URL') supabaseUrl = value;
            if (key === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') supabaseKey = value;
        }
    }
} catch (error) {
    console.log('Erro .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixValues() {
    console.log('Ajustando valores para bater 8.9M...');

    // 1. DOURADOS - Cestas Básicas
    // No seed anterior estava como Maracaju ou Dourados Zerado, vamos corrigir/inserir
    await supabase.from('atas').update({
        value: 2430382.24,
        manual_city: 'DOURADOS',
        manual_title: 'CESTAS BASICAS LOTE 01, 02 E 03',
        company: 'MCP' // Garantir empresa
    }).eq('manual_title', 'CESTAS BASICAS LOTE 01, 02 E 03'); // Tenta atualizar pelo título

    // Caso o update acima não tenha pego (ex: se o titulo era diferente), garantimos pelo ID ou cidade
    // Para simplificar, vamos atualizar o registro de MARACAJU que tinha esse valor, movendo para DOURADOS se for o caso,
    // ou atualizando o DOURADOS zerado.

    // 2. ROCHEDO - Gêneros Secretarias (Estava 0)
    await supabase.from('atas').update({
        value: 1018596.00,
        manual_title: 'GENEROS SECRETARIAS'
    }).match({ manual_city: 'ROCHEDO', manual_title: 'GEN SECRETARIAS' }); // O seed usou "GEN SECRETARIAS"

    // 3. ROCHEDO - Limpeza (Novo, não estava no seed)
    // Vamos verificar se existe, se não, inserir.
    const { data: rochedoLimpeza } = await supabase.from('atas').select('*').match({ manual_city: 'ROCHEDO', manual_title: 'LIMPEZA' });

    if (!rochedoLimpeza || rochedoLimpeza.length === 0) {
        await supabase.from('atas').insert([{
            manual_city: 'ROCHEDO',
            manual_title: 'LIMPEZA',
            manual_agency: 'SECRETARIAS',
            value: 496477.50,
            ata_number: '013/2024',
            start_date: '2026-01-28',
            end_date: '2026-10-31',
            company: 'PONTUAL',
            is_extended: true,
            can_extend: false
        }]);
        console.log('Inserido Rochedo Limpeza');
    }

    // 4. Corrigir RIBAS (Arredondamento)
    await supabase.from('atas').update({
        value: 684000.00
    }).match({ manual_city: 'RIBAS DO RIO PARDO', manual_title: 'GEN SECRETARIAS' });

    console.log('Valores corrigidos!');
}

fixValues();
