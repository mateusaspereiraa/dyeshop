import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session || (session.user as any).role !== 'admin') return res.status(403).json({ error: 'Forbidden' })

  const { id } = req.query
  if (req.method === 'GET') {
    const product = await prisma.product.findUnique({ where: { id: String(id) } })
    if (!product) return res.status(404).json({ error: 'Not found' })
    return res.status(200).json(product)
  }

  if (req.method === 'PUT') {
    const { name, slug, price, image, description, categoryId } = req.body
    const product = await prisma.product.update({ where: { id: String(id) }, data: { name, slug, price: parseFloat(price), image, description, categoryId } })
    return res.status(200).json(product)
  }

  if (req.method === 'DELETE') {
    await prisma.product.delete({ where: { id: String(id) } })
    return res.status(204).end()
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
