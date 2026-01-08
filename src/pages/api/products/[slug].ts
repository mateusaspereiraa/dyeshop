import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query
  if (req.method === 'GET') {
    const product = await prisma.product.findUnique({ where: { slug: String(slug) }, include: { category: true } })
    if (!product) return res.status(404).json({ error: 'Not found' })
    return res.status(200).json(product)
  }
  res.setHeader('Allow', ['GET'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
