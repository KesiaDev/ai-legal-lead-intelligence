#!/bin/bash
# Script para resolver migration falhada via Prisma CLI
# 
# INSTRUÇÕES:
# 1. Obtenha a DATABASE_URL do Railway:
#    - Railway Dashboard → Data → Postgres → Public Network
#    - Copie a Connection URL completa
# 2. Execute este script substituindo a URL abaixo:

DATABASE_URL="COLE_AQUI_A_DATABASE_URL_DO_RAILWAY" \
npx prisma migrate resolve \
  --applied 20250120000000_add_pipelines_and_deals \
  --schema=prisma/schema.prisma
