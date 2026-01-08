import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  let userId: string | undefined

  if (!session) {
    // allow unauthenticated test flows when explicitly enabled
    if (process.env.ENABLE_TEST_ENDPOINTS === '1') {
      const testUser = await prisma.user.upsert({ where: { email: 'test@local' }, create: { email: 'test@local', name: 'Playwright Test' }, update: {} })
      userId = testUser.id
    } else {
      return res.status(401).json({ error: 'Not authenticated' })
    }
  } else {
    userId = (session.user as any).id
  }

  if (req.method === 'POST') {
    const { productId, quantity = 1 } = req.body
    const item = await prisma.cartItem.upsert({
      where: { id: `${userId}-${productId}` },
      create: { id: `${userId}-${productId}`, userId, productId, quantity },
      update: { quantity: { increment: quantity } }
    })
    return res.status(200).json(item)
  }

  if (req.method === 'GET') {
    const items = await prisma.cartItem.findMany({ where: { userId }, include: { product: true } })
    return res.status(200).json(items)
  }

  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
