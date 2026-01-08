import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session || (session.user as any).role !== 'admin') return res.status(403).json({ error: 'Forbidden' })

  if (req.method === 'GET') {
    const products = await prisma.product.findMany({ include: { category: true } })
    return res.status(200).json(products)
  }

  if (req.method === 'POST') {
    const { name, slug, price, image, description, categoryId } = req.body
    const product = await prisma.product.create({ data: { name, slug, price: parseFloat(price), image, description, categoryId } })
    return res.status(201).json(product)
  }

  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
