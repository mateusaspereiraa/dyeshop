import { test, expect } from '@playwright/test'
import crypto from 'crypto'

// Playwright E2E: seed, add to cart, simulate Stripe webhook, assert order exists

test.describe('E2E checkout flow (automated)', () => {
  test('checkout flow: add product, simulate webhook, order recorded', async ({ page, request, baseURL }) => {
    const base = baseURL || 'http://localhost:3000'

    // reset DB and seed with a known product
    await request.post(`${base}/api/test/reset`)
    const seedRes = await request.post(`${base}/api/test/seed`)
    expect(seedRes.status()).toBe(200)
    const product = await seedRes.json()

    // load homepage and add the seeded product to the cart
    // visit product listing and add the seeded product to the cart
    await page.goto(`${base}/products`)
    // accept alerts from add-to-cart
    page.on('dialog', (dialog) => dialog.accept())

    // find the product card and click Adicionar
    await page.getByText(product.name).first().scrollIntoViewIfNeeded()
    const card = page.locator(`text=${product.name}`).locator('..').locator('..')
    await card.getByRole('button', { name: 'Adicionar' }).click()

    // go to cart and finalize checkout
    await page.goto(`${base}/cart`)
    await page.getByRole('button', { name: 'Finalizar compra' }).click()

    // Create a fake checkout.session.completed event and POST to webhook
    // Fetch current cart items to build metadata
    const cartRes = await request.get(`${base}/api/cart`)
    const cart = await cartRes.json()

    const orderMetadata = cart.map((it: any) => ({ productId: it.product.id, quantity: it.quantity }))
    const amountTotal = Math.round(cart.reduce((s: number, it: any) => s + it.product.price * it.quantity, 0) * 100)

    const session = {
      id: `sess_test_${Date.now()}`,
      metadata: { order: JSON.stringify(orderMetadata) },
      amount_total: amountTotal,
      payment_intent: `pi_test_${Date.now()}`,
      customer_details: { email: 'tester@example.com' }
    }

    const eventPayload = JSON.stringify({ id: `evt_test_${Date.now()}`, object: 'event', type: 'checkout.session.completed', data: { object: session } })

    // Generate Stripe-like signature header using STRIPE_WEBHOOK_SECRET
    const secret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_testsecret'
    const t = Math.floor(Date.now() / 1000)
    const signedPayload = `${t}.${eventPayload}`
    const hmac = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex')
    const sigHeader = `t=${t},v1=${hmac}`

    const webhookRes = await request.post(`${base}/api/webhooks/stripe`, { data: eventPayload, headers: { 'stripe-signature': sigHeader, 'content-type': 'application/json' } })
    expect(webhookRes.status()).toBe(200)

    // wait briefly for order to be created, then fetch via test endpoint
    await new Promise((r) => setTimeout(r, 200))
    const ordersRes = await request.get(`${base}/api/test/orders`)
    expect(ordersRes.status()).toBe(200)
    const orders = await ordersRes.json()
    expect(Array.isArray(orders)).toBe(true)
    expect(orders.length).toBeGreaterThanOrEqual(1)
    const created = orders.find((o: any) => o.stripePaymentIntentId && o.items && o.items.length > 0)
    expect(created).toBeTruthy()
  })
})