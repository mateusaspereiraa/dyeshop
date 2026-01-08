# Running tests locally

Prerequisites:
- Node.js >= 16.13 (recommended 18+)
- npm (or yarn/pnpm)

Steps:
1. Upgrade Node if needed (e.g., use nvm: `nvm install 18 && nvm use 18`).
2. Install deps: `npm install`.
3. Run Prisma migrations and seed (if using DB-backed tests):
   - `npx prisma migrate dev --name init`
   - `npm run seed`
4. Run tests: `npm test`

Notes:
- We use `ts-jest` so tests are written in TypeScript under `tests/`.
- For webhook integration tests, we mock external services (Stripe, SendGrid, Twilio) and use unit tests for `handleCheckoutSessionCompleted` (see `tests/webhookHandlers.test.ts`).
- If you want to run an end-to-end webhook test, follow `docs/STRIPE_TESTING.md` to use the Stripe CLI and forward webhooks locally.
