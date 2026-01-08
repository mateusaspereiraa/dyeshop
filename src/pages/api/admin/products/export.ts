import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session || (session.user as any).role !== 'admin') return res.status(403).json({ error: 'Forbidden' })

  const products = await prisma.product.findMany({ include: { category: true } })

  const rows = products.map((p: any) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price.toFixed(2),
    category: p.category?.name || '',
    createdAt: p.createdAt.toISOString()
  }))

  const csv = [Object.keys(rows[0] || {}).join(','), ...rows.map((r: any) => Object.values(r).map((v) => `"${String(v).replace(/"/g, '""') }"`).join(','))].join('\n')

  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', 'attachment; filename="products.csv"')
  res.status(200).send(csv)
}
