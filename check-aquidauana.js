
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local manually
const envPath = path.resolve(__dirname, '.env.local');
let envContent = '';
try {
    envContent = fs.readFileSync(envPath, 'utf8');
} catch (err) {
    console.error('❌ Erro: Arquivo .env.local não encontrado');
    process.exit(1);
}

const vars = {};
envContent.split('\n').forEach(line => {
    if (!line || line.startsWith('#')) return;
    const parts = line.split('=');
    const key = parts[0].trim();
    if (parts.length > 1) {
        const value = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
        vars[key] = value;
    }
});

const supabaseUrl = vars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = vars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSpecificTender() {
    console.log('🔍 Buscando licitações de AQUIDAUANA...\n');

    // Buscar por Cidade
    const { data: tenders, error } = await supabase
        .from('tenders')
        .select('*')
        .ilike('city', '%AQUIDAUANA%');

    if (error) {
        console.error('❌ Erro na busca:', error.message);
    } else {
        if (tenders.length === 0) {
            console.log('⚠️ Nenhuma licitação encontrada para AQUIDAUANA.');
        } else {
            console.log(`✅ ENCONTRADAS ${tenders.length} LICITAÇÕES EM AQUIDAUANA:`);
            tenders.forEach(t => {
                console.log(`\n📋 ID: ${t.id}`);
                console.log(`   Título: ${t.title}`);
                console.log(`   Cidade: ${t.city}`);
                console.log(`   Status: ${t.status}`);
                console.log(`   Data Sessão: ${t.next_session_date}`);
                console.log(`   Criado em: ${new Date(t.created_at).toLocaleString('pt-BR')}`);
                console.log(`   Atualizado em: ${new Date(t.updated_at).toLocaleString('pt-BR')}`);
            });
            console.log('\n✅ CONCLUSÃO: Os dados ESTÃO salvos no Supabase.');
        }
    }
}

checkSpecificTender();
