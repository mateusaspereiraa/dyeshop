import prisma from './prisma'
import Stripe from 'stripe'

// Exported to make unit testing easy
export async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session, stripe?: any) {
  const stripeApi = stripe || new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2022-11-15' })
  const sessionId = session.id

  // Idempotency: ignore if order already exists for this session
  const existing = await prisma.order.findUnique({ where: { stripeSessionId: sessionId } })
  if (existing) {
    return { id: existing.id, existing: true }
  }

  // Prefer metadata.order (JSON of { productId, quantity }) set at checkout creation
  let orderItems: Array<{ productId: string; quantity: number; price: number }> = []

  if (session.metadata && session.metadata.order) {
    try {
      const parsed = JSON.parse(session.metadata.order as string)
      const mapped = await Promise.all(parsed.map(async (it: any) => {
        const product = await prisma.product.findUnique({ where: { id: it.productId } })
        if (!product) return null
        return { productId: product.id, quantity: Number(it.quantity) || 1, price: product.price }
      }))
      orderItems = mapped.filter(Boolean) as any
    } catch (err) {
      console.error('Error parsing order metadata', err)
    }
  }

  // Fallback: try to map by line item names
  if (!orderItems.length) {
    try {
      const list = await stripeApi.checkout.sessions.listLineItems(sessionId, { limit: 100 })
      const mapped = await Promise.all(list.data.map(async (li: any) => {
        const name = li.description || (li.price as any)?.product?.name || (li.price as any)?.nickname
        if (!name) return null
        const product = await prisma.product.findFirst({ where: { name } })
        if (!product) return null
        return { productId: product.id, quantity: li.quantity || 1, price: product.price }
      }))
      orderItems = mapped.filter(Boolean) as any
    } catch (err) {
      console.error('Error fetching line items', err)
    }
  }

  const total = ((session.amount_total as number) || 0) / 100

  const order = await prisma.order.create({
    data: {
      userId: session.metadata?.userId || undefined,
      total,
      currency: 'BRL',
      status: 'paid',
      stripeSessionId: sessionId,
      stripePaymentIntentId: (session.payment_intent as string) || undefined,
      customerEmail: session.customer_details?.email || session.customer_email || undefined,
      items: {
        create: orderItems.map((it) => ({ productId: it.productId, quantity: it.quantity, price: it.price }))
      }
    },
    include: { items: { include: { product: true } }, user: true }
  })

  // Fire notifications (email/slack/sms) but don't fail the flow if they error
  try {
    const { sendOrderConfirmation, sendAdminNotification } = await import('./email')
    const { sendAdminSlack, sendAdminSms } = await import('./notifiers')
    await Promise.all([sendOrderConfirmation(order), sendAdminNotification(order), sendAdminSlack(order), sendAdminSms(order)])
  } catch (err) {
    console.error('Failed to send order notifications', err)
  }

  return { id: order.id, created: true }
}
