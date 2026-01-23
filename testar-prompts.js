/**
 * Script de Teste - Prompts Integrados
 * 
 * Execute: node testar-prompts.js
 * 
 * IMPORTANTE: Antes de executar, você precisa:
 * 1. Fazer login na plataforma
 * 2. Abrir o DevTools (F12)
 * 3. No Console, executar: localStorage.getItem('auth_token')
 * 4. Copiar o token e colar aqui na variável TOKEN abaixo
 */

const API_URL = 'https://api.sdrjuridico.com.br';
const TOKEN = 'COLE_SEU_TOKEN_AQUI'; // ⚠️ Cole o token aqui!

// Cores para o terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testarPrompts() {
  log('\n🧪 Iniciando testes de Prompts...\n', 'blue');

  // Verificar se o token foi configurado
  if (TOKEN === 'COLE_SEU_TOKEN_AQUI') {
    log('❌ ERRO: Configure o TOKEN no início do arquivo!', 'red');
    log('   1. Faça login na plataforma', 'yellow');
    log('   2. Abra DevTools (F12)', 'yellow');
    log('   3. No Console, execute: localStorage.getItem("auth_token")', 'yellow');
    log('   4. Cole o token na variável TOKEN\n', 'yellow');
    return;
  }

  const headers = {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  };

  try {
    // Teste 1: Listar prompts
    log('📋 Teste 1: Listar prompts...', 'blue');
    const listResponse = await fetch(`${API_URL}/api/prompts`, {
      method: 'GET',
      headers,
    });

    if (listResponse.ok) {
      const data = await listResponse.json();
      log(`✅ Sucesso! Encontrados ${data.total} prompts`, 'green');
      if (data.prompts.length > 0) {
        log(`   Primeiro prompt: ${data.prompts[0].name}`, 'yellow');
      }
    } else {
      log(`❌ Erro ${listResponse.status}: ${listResponse.statusText}`, 'red');
      const error = await listResponse.text();
      log(`   Detalhes: ${error}`, 'red');
    }

    // Teste 2: Criar prompt
    log('\n📝 Teste 2: Criar prompt de teste...', 'blue');
    const newPrompt = {
      name: 'Prompt de Teste',
      type: 'orquestrador',
      version: 'v1.0',
      status: 'ativo',
      provider: 'OpenAI',
      model: 'gpt-4o-mini',
      content: 'Você é um assistente jurídico de teste. Seja profissional e cordial.',
      temperature: 0.4,
      maxTokens: 500,
    };

    const createResponse = await fetch(`${API_URL}/api/prompts`, {
      method: 'POST',
      headers,
      body: JSON.stringify(newPrompt),
    });

    if (createResponse.ok) {
      const data = await createResponse.json();
      log(`✅ Prompt criado com sucesso!`, 'green');
      log(`   ID: ${data.prompt.id}`, 'yellow');
      log(`   Nome: ${data.prompt.name}`, 'yellow');
      
      const promptId = data.prompt.id;

      // Teste 3: Buscar prompt por tipo
      log('\n🔍 Teste 3: Buscar prompt por tipo "orquestrador"...', 'blue');
      const getResponse = await fetch(`${API_URL}/api/prompts/orquestrador`, {
        method: 'GET',
        headers,
      });

      if (getResponse.ok) {
        const data = await getResponse.json();
        log(`✅ Prompt encontrado!`, 'green');
        log(`   Nome: ${data.prompt.name}`, 'yellow');
        log(`   Tipo: ${data.prompt.type}`, 'yellow');
        log(`   Status: ${data.prompt.status}`, 'yellow');
      } else {
        log(`❌ Erro ${getResponse.status}: ${getResponse.statusText}`, 'red');
      }

      // Teste 4: Deletar prompt de teste
      log('\n🗑️  Teste 4: Deletar prompt de teste...', 'blue');
      const deleteResponse = await fetch(`${API_URL}/api/prompts/${promptId}`, {
        method: 'DELETE',
        headers,
      });

      if (deleteResponse.ok) {
        log(`✅ Prompt deletado com sucesso!`, 'green');
      } else {
        log(`❌ Erro ${deleteResponse.status}: ${deleteResponse.statusText}`, 'red');
      }
    } else {
      log(`❌ Erro ${createResponse.status}: ${createResponse.statusText}`, 'red');
      const error = await createResponse.text();
      log(`   Detalhes: ${error}`, 'red');
    }

    log('\n✅ Testes concluídos!\n', 'green');

  } catch (error) {
    log(`\n❌ Erro inesperado: ${error.message}\n`, 'red');
  }
}

// Executar testes
testarPrompts();
