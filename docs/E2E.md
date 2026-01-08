# E2E testing with Playwright

This document explains how to run Playwright E2E tests for the checkout flow.

Prerequisites
- Node 18+
- App running at http://localhost:3000
- Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

Running Playwright tests
1. Install Playwright browsers: `npx playwright install`.
2. Start your app: `npm run dev`.
3. Run tests: `npx playwright test`.

Notes
- The provided E2E test is a skeleton verifying the app loads and gives instructions for manual checkout automation.
- For full automated checkout, you can programmatically create a Stripe Checkout session and then trigger a `checkout.session.completed` event via Stripe CLI or the API, but this requires careful test isolation.
