import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session || (session.user as any).role !== 'admin') return res.status(403).json({ error: 'Forbidden' })

  const orders = await prisma.order.findMany({ include: { items: { include: { product: true } }, user: true }, orderBy: { createdAt: 'desc' } })

  // Flatten rows: one row per order item
  const rows: any[] = []
  for (const o of orders) {
    for (const it of o.items) {
      rows.push({ orderId: o.id, customerEmail: o.customerEmail || (o.user && o.user.email) || '', status: o.status, total: o.total.toFixed(2), itemName: it.product.name, itemQty: it.quantity, itemPrice: it.price.toFixed(2), createdAt: o.createdAt.toISOString() })
    }
  }

  const csv = [Object.keys(rows[0] || {}).join(','), ...rows.map((r) => Object.values(r).map((v) => `"${String(v).replace(/"/g, '""') }"`).join(','))].join('\n')

  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', 'attachment; filename="orders.csv"')
  res.status(200).send(csv)
}
