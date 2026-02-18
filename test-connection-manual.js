
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
    // Basic parsing handling lines with '=' and comments
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

console.log('--- Diagnóstico de Conexão ---');
if (!supabaseUrl) console.error('❌ NEXT_PUBLIC_SUPABASE_URL não encontrada.');
else console.log(`✅ URL Encontrada: ${supabaseUrl}`);

if (!supabaseKey) console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY não encontrada.');
else console.log(`✅ KEY Encontrada: ${supabaseKey.substring(0, 5)}...${supabaseKey.substring(supabaseKey.length - 5)}`);

if (!supabaseUrl || !supabaseKey) process.exit(1);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log('\n🔄 Testando query simples (SELECT count)...');
    const start = Date.now();

    try {
        const { count, error } = await supabase.from('tenders').select('*', { count: 'exact', head: true });

        if (error) {
            console.error('\n❌ ERRO NA CONEXÃO OU PERMISSÃO:');
            console.error(`Status: ${error.code}`);
            console.error(`Mensagem: ${error.message}`);
            console.error(`Detalhes: ${JSON.stringify(error, null, 2)}`);
            console.log('\n💡 DICA: Verifique se as Tabelas têm políticas RLS permissivas para leitura pública ou se o usuário precisa estar logado.');
        } else {
            const duration = Date.now() - start;
            console.log(`\n✅ SUCESSO! Conexão estabelecida.`);
            console.log(`⏱️ Tempo: ${duration}ms`);
            console.log(`📊 Total de registros na tabela 'tenders': ${count}`);
        }
    } catch (err) {
        console.error('\n❌ ERRO DE REDE/CÓDIGO:', err);
    }
}

testConnection();
