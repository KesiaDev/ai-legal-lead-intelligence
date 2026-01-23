#!/bin/bash

# Script de teste para endpoints do backend
# Uso: ./test-endpoints.sh [TOKEN]

API_URL="https://api.sdrjuridico.com.br"
TOKEN="${1:-}"

echo "🧪 Testando Endpoints do Backend"
echo "=================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para testar endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local expected_status=$3
    local description=$4
    
    echo -n "Testando $description... "
    
    if [ -z "$TOKEN" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$API_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$API_URL$endpoint" \
            -H "Authorization: Bearer $TOKEN")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -eq "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} (Status: $http_code)"
        echo "   Response: $(echo "$body" | head -c 100)..."
    else
        echo -e "${RED}❌ FAIL${NC} (Esperado: $expected_status, Recebido: $http_code)"
        echo "   Response: $body"
    fi
    echo ""
}

# Teste 1: GET /api/integrations sem token (deve retornar 401)
test_endpoint "GET" "/api/integrations" 401 "GET /api/integrations (sem autenticação)"

# Teste 2: GET /api/agent/config sem token (deve retornar 401)
test_endpoint "GET" "/api/agent/config" 401 "GET /api/agent/config (sem autenticação)"

# Teste 3: GET /api/voice/config sem token (deve retornar 401)
test_endpoint "GET" "/api/voice/config" 401 "GET /api/voice/config (sem autenticação)"

# Se token fornecido, testar com autenticação
if [ -n "$TOKEN" ]; then
    echo "🔐 Testando com autenticação..."
    echo ""
    
    # Teste 4: GET /api/integrations com token (deve retornar 200)
    test_endpoint "GET" "/api/integrations" 200 "GET /api/integrations (autenticado)"
    
    # Teste 5: GET /api/agent/config com token (deve retornar 200)
    test_endpoint "GET" "/api/agent/config" 200 "GET /api/agent/config (autenticado)"
    
    # Teste 6: GET /api/voice/config com token (deve retornar 200)
    test_endpoint "GET" "/api/voice/config" 200 "GET /api/voice/config (autenticado)"
    
    # Teste 7: PATCH /api/integrations (deve retornar 200)
    echo -n "Testando PATCH /api/integrations (autenticado)... "
    response=$(curl -s -w "\n%{http_code}" -X "PATCH" "$API_URL/api/integrations" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"openaiApiKey":"test-key"}')
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -eq 200 ]; then
        echo -e "${GREEN}✅ PASS${NC} (Status: $http_code)"
    else
        echo -e "${RED}❌ FAIL${NC} (Esperado: 200, Recebido: $http_code)"
        echo "   Response: $body"
    fi
    echo ""
else
    echo ""
    echo -e "${YELLOW}💡 Dica: Forneça um token para testar endpoints autenticados${NC}"
    echo "   Uso: ./test-endpoints.sh SEU_TOKEN_AQUI"
    echo ""
    echo "   Para obter um token:"
    echo "   curl -X POST $API_URL/api/auth/login \\"
    echo "     -H 'Content-Type: application/json' \\"
    echo "     -d '{\"email\":\"seu@email.com\",\"password\":\"sua_senha\"}'"
    echo ""
fi

echo "=================================="
echo "✅ Testes concluídos!"
