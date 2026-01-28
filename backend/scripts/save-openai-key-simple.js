/**
 * Script simples para salvar chave da OpenAI via endpoint do backend
 * 
 * Uso: node scripts/save-openai-key-simple.js
 * 
 * Este script chama o endpoint /api/admin/save-openai-key que criamos no backend
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'https://api.sdrjuridico.com.br';
const USER_IDENTIFIER = 'kesiawnandi';
const OPENAI_KEY = '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';
const SECRET = 'admin-save-key-2026';

async function saveOpenAIKey() {
  try {
    console.log('🚀 Salvando chave da OpenAI...');
    console.log(`   API: ${API_URL}`);
    console.log(`   Usuário: ${USER_IDENTIFIER}`);
    console.log(`   Chave: ...${OPENAI_KEY.slice(-4)}`);
    console.log('');

    const response = await axios.post(
      `${API_URL}/api/admin/save-openai-key`,
      {
        userIdentifier: USER_IDENTIFIER,
        openaiKey: OPENAI_KEY,
        secret: SECRET,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Sucesso!');
    console.log('');
    console.log('Resposta:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao salvar chave:');
    
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Erro:`, JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('   Erro de conexão:', error.message);
      console.error('   Verifique se a API está acessível:', API_URL);
    } else {
      console.error('   Erro:', error.message);
    }
    
    throw error;
  }
}

saveOpenAIKey()
  .then(() => {
    console.log('');
    console.log('✅ Script concluído com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('');
    console.error('❌ Script falhou');
    process.exit(1);
  });
