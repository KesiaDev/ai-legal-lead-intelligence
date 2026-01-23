# Como Reiniciar o Backend no Railway

## Problema
Após aplicar a migration, o Prisma Client ainda não reconhece as novas tabelas porque ele foi gerado ANTES das tabelas serem criadas.

## Solução: Reiniciar o Backend

### Passo a Passo:

1. **Acesse o Railway:**
   - Vá para https://railway.app
   - Faça login na sua conta

2. **Encontre o Serviço do Backend:**
   - Procure pelo serviço que contém o backend (geralmente tem "backend" no nome)
   - Ou procure pelo serviço que está rodando na porta configurada

3. **Reinicie o Serviço:**
   - Clique no serviço do backend
   - Vá na aba "Deployments" ou "Settings"
   - Procure pelo botão "Restart" ou "Redeploy"
   - Clique em "Restart" ou "Redeploy"

4. **Aguarde o Deploy:**
   - O Railway vai:
     - Aplicar migrations (`npm run db:migrate`)
     - Regenerar Prisma Client (`npm run db:generate`)
     - Reiniciar o servidor
   - Isso leva cerca de 2-3 minutos

5. **Teste Novamente:**
   - Volte para a plataforma
   - Tente salvar a chave da OpenAI novamente
   - Deve funcionar agora!

## Alternativa: Forçar Redeploy

Se não encontrar o botão "Restart", você pode forçar um redeploy:

1. Vá para o serviço do backend
2. Vá para "Settings" ou "Variables"
3. Adicione uma variável temporária (ex: `FORCE_REDEPLOY=1`)
4. Salve
5. O Railway vai fazer um redeploy automaticamente
6. Depois pode remover a variável

## Verificar se Funcionou

Após reiniciar, verifique os logs do Railway:
- Vá para "Deployments"
- Clique no deployment mais recente
- Veja os logs
- Procure por: "Prisma Client generated" ou "Migration applied"

Se aparecer "Prisma Client generated", está funcionando!
