#!/bin/bash

# Script de Testes Rápidos - SDR Advogados
# Execute: bash testes-rapidos.sh

API_URL="https://sdradvogados.up.railway.app"

echo "🧪 TESTES RÁPIDOS - SDR ADVOGADOS"
echo "=================================="
echo ""

# Teste 1: Health Check
echo "✅ TESTE 1: Health Check"
response=$(curl -s -w "\n%{http_code}" "$API_URL/health")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "200" ]; then
  echo "✅ PASS: Backend está online"
  echo "   Resposta: $body"
else
  echo "❌ FAIL: Backend retornou código $http_code"
fi
echo ""

# Teste 2: Criar Lead
echo "✅ TESTE 2: Criar Lead via Webhook"
LEAD_RESPONSE=$(curl -s -X POST "$API_URL/leads" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Teste Automatizado",
    "telefone": "11999999999",
    "email": "teste@example.com",
    "origem": "site",
    "clienteId": "teste-automatizado-123"
  }')

if echo "$LEAD_RESPONSE" | grep -q "success.*true"; then
  echo "✅ PASS: Lead criado com sucesso"
  LEAD_ID=$(echo "$LEAD_RESPONSE" | grep -o '"leadId":"[^"]*' | cut -d'"' -f4)
  echo "   Lead ID: $LEAD_ID"
  
  # Verificar routing
  if echo "$LEAD_RESPONSE" | grep -q "routing"; then
    echo "✅ PASS: Routing presente na resposta"
  else
    echo "❌ FAIL: Routing não encontrado"
  fi
else
  echo "❌ FAIL: Erro ao criar lead"
  echo "   Resposta: $LEAD_RESPONSE"
fi
echo ""

# Teste 3: Agente IA - Intake
echo "✅ TESTE 3: Agente IA - Intake"
INTAKE_RESPONSE=$(curl -s -X POST "$API_URL/api/agent/intake" \
  -H "Content-Type: application/json" \
  -d '{
    "lead_id": "test-lead-123",
    "mensagem": "Preciso de ajuda com processo trabalhista",
    "canal": "whatsapp",
    "clienteId": "teste-automatizado-123"
  }')

if echo "$INTAKE_RESPONSE" | grep -q "analise"; then
  echo "✅ PASS: Análise retornada"
else
  echo "❌ FAIL: Erro na análise"
  echo "   Resposta: $INTAKE_RESPONSE"
fi
echo ""

# Teste 4: Verificar se routing sempre está presente
echo "✅ TESTE 4: Verificar Routing Obrigatório"
ROUTING_TEST=$(curl -s -X POST "$API_URL/leads" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Teste Routing",
    "telefone": "11988888888",
    "origem": "whatsapp"
  }')

if echo "$ROUTING_TEST" | grep -q '"routing"'; then
  echo "✅ PASS: Routing sempre presente"
else
  echo "❌ FAIL: Routing ausente"
fi
echo ""

echo "=================================="
echo "✅ Testes concluídos!"
echo ""
echo "Para testes completos, veja: GUIA_TESTES_PLATAFORMA.md"
