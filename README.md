# DyeShop — Loja Online (esqueleto)

Projeto inicial com Next.js + TypeScript, Tailwind CSS, Prisma, NextAuth (autenticação) e Stripe (pagamentos).

## Como rodar localmente

1. Copie `.env.example` para `.env` e preencha variáveis.
2. Instale dependências: `npm install` (ou `pnpm`/`yarn`).
3. Rode migrações e seed:
   - `npx prisma migrate dev --name init`
   - `npm run seed`
4. Rode em dev: `npm run dev`

## O que está incluído
- Estrutura básica de páginas e componentes
- Configuração de Tailwind com paleta personalizada (preto, cinza, amarelo, marrom madeira)
- Prisma schema com modelos principais (User, Product, Category, Order)
- Scripts de seed

Próximo passo: implementar sistema de design (componentes, tokens), autenticação (NextAuth) e integração com Stripe (Checkout + webhooks).

## Testando Stripe localmente
Veja `docs/STRIPE_TESTING.md` para instruções passo-a-passo de como usar o Stripe CLI para encaminhar webhooks e testar o fluxo checkout → webhook → criação de pedido.

## Setup rápido do ambiente (nvm + Node)
Se você ainda não tem Node 18 instalado, use o script de setup:

```bash
# Torna o script executável (caso não esteja):
chmod +x ./scripts/setup-node.sh
# Executa o setup (instala nvm, Node 18 e dependências do projeto):
./scripts/setup-node.sh
```

O script também pode instalar os navegadores do Playwright se você desejar rodar os testes E2E.

---

## Testes, E2E e CI 🧪

### Rodando localmente
- Instalar dependências: `npm ci`
- Gerar Prisma Client: `npx prisma generate`
- Preparar DB de teste (SQLite):
  - `DATABASE_URL=file:./test.db npx prisma db push --accept-data-loss`
- Rodar lint: `npm run lint`
- Rodar unit tests: `npm test`
- Instalar navegadores do Playwright: `npx playwright install --with-deps`
- Rodar E2E localmente (usa endpoints de teste):
  - `ENABLE_TEST_ENDPOINTS=1 DATABASE_URL=file:./test.db STRIPE_WEBHOOK_SECRET=whsec_testsecret STRIPE_SECRET_KEY=sk_test_123 npx playwright test --project=chromium`

> Observação: `ENABLE_TEST_ENDPOINTS=1` ativa endpoints de teste (`/api/test/*`) usados pelos testes automatizados. Em ambientes de produção **não** habilite essa variável.

### Testando Stripe localmente (opcional)
- Instale o Stripe CLI: https://stripe.com/docs/stripe-cli
- Rode: 
  - `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
  - Em seguida, abra o checkout no site e conclua (modo de teste do Stripe)

### CI (GitHub Actions)
Criamos um workflow `.github/workflows/ci.yml` que executa:
- `npm ci`, `npx prisma generate`, `npm run build`, `npm run lint`, `npm test`
- Instala navegadores do Playwright, inicia `npm run dev` com envs de teste, prepara DB (SQLite) e roda Playwright E2E

---

Se quiser, posso abrir uma PR com esse README atualizado (já pronto) e o workflow de CI que adicionei. Se aprovar, eu crio a branch e abro o PR com um título e descrição claros.

