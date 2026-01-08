import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.ENABLE_TEST_ENDPOINTS !== '1') return res.status(404).end('Not found')
  if (req.method !== 'GET') return res.status(405).end('Method Not Allowed')

  const orders = await prisma.order.findMany({ include: { items: { include: { product: true } }, user: true } })
  res.status(200).json(orders)
}
