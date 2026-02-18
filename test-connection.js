
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Erro: Variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY não encontradas.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log('🔄 Testando conexão com Supabase...');
    console.log(`URL: ${supabaseUrl}`);

    const start = Date.now();

    try {
        const { data, error } = await supabase.from('tenders').select('count', { count: 'exact', head: true });

        if (error) {
            console.error('❌ Erro ao conectar com o banco:', error.message);
            console.error('Detalhes:', error);
        } else {
            const duration = Date.now() - start;
            console.log(`✅ Conexão BEM SUCEDIDA!`);
            console.log(`⏱️ Tempo de resposta: ${duration}ms`);
            console.log(`📊 Tabela 'tenders' está acessível. (Count: ${data})`); // data is null for head:true but status is ok
        }
    } catch (err) {
        console.error('❌ Erro inesperado:', err);
    }
}

testConnection();
