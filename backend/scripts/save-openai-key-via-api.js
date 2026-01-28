/**
 * Script para salvar chave da OpenAI via API do backend
 * 
 * Este script faz login e depois atualiza a chave via API
 * 
 * Uso: node scripts/save-openai-key-via-api.js <email> <senha> <chave_openai>
 * Exemplo: node scripts/save-openai-key-via-api.js kesiawnandi@email.com senha123 sk-proj-...
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'https://api.sdrjuridico.com.br';

async function saveOpenAIKeyViaAPI(email, password, openaiKey) {
  try {
    console.log('🔐 Fazendo login...');
    
    // 1. Fazer login para obter token
    const loginResponse = await axios.post(`${API_URL}/api/login`, {
      email,
      password,
    });

    if (!loginResponse.data.token) {
      throw new Error('Token não recebido no login');
    }

    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');

    // 2. Atualizar chave da OpenAI via API
    console.log('💾 Salvando chave da OpenAI...');
    
    const updateResponse = await axios.patch(
      `${API_URL}/api/integrations`,
      {
        openaiApiKey: openaiKey,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Chave da OpenAI salva com sucesso!');
    console.log('   Resposta:', JSON.stringify(updateResponse.data, null, 2));

    return updateResponse.data;
  } catch (error) {
    if (error.response) {
      console.error('❌ Erro da API:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('❌ Erro de conexão:', error.message);
    } else {
      console.error('❌ Erro:', error.message);
    }
    throw error;
  }
}

// Executar script
const args = process.argv.slice(2);

if (args.length < 3) {
  console.error('❌ Uso: node scripts/save-openai-key-via-api.js <email> <senha> <chave_openai>');
  console.error('   Exemplo: node scripts/save-openai-key-via-api.js kesiawnandi@email.com senha123 sk-proj-...');
  console.error('');
  console.error('   Alternativa: defina API_URL se necessário');
  console.error('   Exemplo: API_URL=https://api.sdrjuridico.com.br node scripts/save-openai-key-via-api.js ...');
  process.exit(1);
}

const [email, password, openaiKey] = args;

if (!openaiKey.startsWith('sk-')) {
  console.warn('⚠️ Aviso: A chave não parece ser uma chave válida da OpenAI (deve começar com "sk-")');
}

saveOpenAIKeyViaAPI(email, password, openaiKey)
  .then(() => {
    console.log('✅ Script concluído com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error.message);
    process.exit(1);
  });
