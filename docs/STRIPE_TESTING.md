# Stripe CLI & Local Webhook Testing 🔁

This guide helps you test the full checkout -> webhook -> Order creation flow locally.

## 1) Requirements
- Install Stripe CLI: https://stripe.com/docs/stripe-cli
- Configure `.env` with keys from `.env.example` (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, NEXTAUTH_URL, SENDGRID_API_KEY if testing emails)

## 2) Run your app locally
1. npm install
2. npx prisma migrate dev --name init
3. npm run seed
4. npm run dev  # app runs at http://localhost:3000

## 3) Listen for webhooks and forward to local endpoint
Open a terminal and run:

stripe listen --forward-to localhost:3000/api/webhooks/stripe

This will print an endpoint and a Webhook Signing Secret. Copy it to your `.env` as `STRIPE_WEBHOOK_SECRET`.

## 4) Create a Checkout session via the app
- Use the UI: add items to cart, go to /cart and click Finalizar compra (ensure `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set)

OR

- Create a session from the CLI (example):

stripe checkout sessions create \
  --payment_method_types card \
  --line_items price_data[0][currency]=brl price_data[0][unit_amount]=1000 price_data[0][product_data][name]="Teste Item" price_data[0][product_data][description]="Teste" price_data[0][quantity]=1 \
  --mode payment \
  --success_url "http://localhost:3000/success" \
  --cancel_url "http://localhost:3000/cart"

Note: the easiest full flow is via the app UI — the important part is the webhook forwarded by stripe listen.

## 5) Trigger a `checkout.session.completed` event (if needed)
Use the CLI to trigger a test event:

stripe trigger checkout.session.completed

This will cause Stripe to POST the `checkout.session.completed` event to your forwarded local endpoint.

## 6) Verify
- Check server console logs for `Created order from webhook ...`
- Inspect DB (`npx prisma studio`) to see created `Order` and `OrderItem`s
- If SendGrid configured, check that the customer and admin emails were sent/queued

## Tips & Common Issues
- If you get `Webhook Error: No signatures found`, ensure `STRIPE_WEBHOOK_SECRET` matches the value printed by `stripe listen`.
- If orders aren't created, check that `metadata.order` was provided by the checkout session (our checkout endpoint adds it). If testing manually, you can provide `metadata` when creating sessions.

Happy testing! 🎯
