import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session || (session.user as any).role !== 'admin') return res.status(403).json({ error: 'Forbidden' })

  const { id } = req.query

  if (req.method === 'GET') {
    const order = await prisma.order.findUnique({ where: { id: String(id) }, include: { items: { include: { product: true } }, user: true } })
    if (!order) return res.status(404).json({ error: 'Not found' })
    return res.status(200).json(order)
  }

  if (req.method === 'PUT') {
    const { status } = req.body
    const updated = await prisma.order.update({ where: { id: String(id) }, data: { status } })
    return res.status(200).json(updated)
  }

  res.setHeader('Allow', ['GET', 'PUT'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
