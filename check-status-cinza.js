
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

async function checkGrayStatus() {
    console.log('🔍 Buscando licitações com status "Não Participou" (Cinza)...\n');

    // Buscar status 'not_participated' E 'Não Participou' (caso legado)
    const { data: tenders, error } = await supabase
        .from('tenders')
        .select('id, title, city, status, updated_at')
        .in('status', ['not_participated', 'Não Participou', 'nao_participou'])
        .order('updated_at', { ascending: false });

    if (error) {
        console.error('❌ Erro na busca:', error.message);
    } else {
        if (tenders.length === 0) {
            console.log('⚠️ Nenhuma licitação encontrada com status "Não Participou".');
            console.log('   Isso sugere que as alterações do seu amigo NÃO foram salvas na nuvem.');
        } else {
            console.log(`✅ ENCONTRADAS ${tenders.length} LICITAÇÕES "CINZAS" (Não Participou):`);
            tenders.forEach(t => {
                console.log(`   - [${new Date(t.updated_at).toLocaleDateString()}] ${t.title} (${t.city})`);
            });
        }
    }
}

checkGrayStatus();
