
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

async function checkActivity() {
    console.log('🔍 Buscando atividades recentes...\n');

    // Buscar últimas LICITAÇÕES (Tenders)
    const { data: tenders, error: tenderError } = await supabase
        .from('tenders')
        .select('id, title, city, status, updated_at, created_at')
        .order('updated_at', { ascending: false })
        .limit(5);

    if (tenderError) console.error('❌ Erro ao buscar licitações:', tenderError.message);
    else {
        console.log('📝 ÚLTIMAS LICITAÇÕES ATUALIZADAS/CRIADAS:');
        if (tenders.length === 0) console.log('   (Nenhuma licitação encontrada)');
        tenders.forEach(t => {
            const date = new Date(t.updated_at).toLocaleString('pt-BR');
            console.log(`   - [${date}] ${t.title} (${t.city}) - Status: ${t.status}`);
        });
    }

    console.log('\n------------------------------------------------\n');

    // Buscar últimas ATAS
    const { data: atas, error: ataError } = await supabase
        .from('atas')
        .select('id, objeto, orgao, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

    if (ataError) {
        // Tabela pode se chamar 'atas' ou 'registros_atas'? Geralmente é 'atas' no código que vi.
        console.error('❌ Erro ao buscar atas (verificando tabela...):', ataError.message);
    } else {
        console.log('📄 ÚLTIMAS ATAS CADASTRADAS:');
        if (atas.length === 0) console.log('   (Nenhuma ata encontrada)');
        atas.forEach(a => {
            const date = new Date(a.created_at).toLocaleString('pt-BR');
            console.log(`   - [${date}] ${a.objeto} (${a.orgao}) - Status: ${a.status}`);
        });
    }
}

checkActivity();
