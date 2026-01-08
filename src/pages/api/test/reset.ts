import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.ENABLE_TEST_ENDPOINTS !== '1') return res.status(404).end('Not found')
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed')

  // Wipe test data (order matters for FK constraints)
  await prisma.orderItem.deleteMany().catch(() => {})
  await prisma.order.deleteMany().catch(() => {})
  await prisma.cartItem.deleteMany().catch(() => {})
  await prisma.product.deleteMany().catch(() => {})
  await prisma.category.deleteMany().catch(() => {})
  await prisma.user.deleteMany().catch(() => {})

  res.status(200).json({ reset: true })
}
