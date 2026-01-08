import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'

import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2022-11-15' })

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed')

  const { items, successUrl = `${process.env.NEXTAUTH_URL}/success`, cancelUrl = `${process.env.NEXTAUTH_URL}/cart` } = req.body
  const sessionUser = await getServerSession(req, res, authOptions)
  const userId = (sessionUser?.user as any)?.id

  // Build metadata to make webhook idempotent and reliable
  const orderMeta = items.map((it: any) => ({ productId: it.product.id, quantity: it.quantity }))

  const line_items = items.map((it: any) => ({
    price_data: {
      currency: 'brl',
      product_data: { name: it.product.name },
      unit_amount: Math.round(it.product.price * 100)
    },
    quantity: it.quantity
  }))

  if (process.env.ENABLE_TEST_ENDPOINTS === '1') {
    // In test mode, avoid calling Stripe and return a fake session id
    const fakeId = `sess_test_${Date.now()}`
    return res.status(200).json({ id: fakeId, url: `https://checkout.stripe.test/${fakeId}` })
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      order: JSON.stringify(orderMeta),
      userId: userId || ''
    },
    customer_email: (sessionUser?.user as any)?.email || undefined
  })

  res.status(200).json({ id: checkoutSession.id, url: checkoutSession.url })
}
