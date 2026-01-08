import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session || (session.user as any).role !== 'admin') return res.status(403).json({ error: 'Forbidden' })
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed')

  const { action, ids, status } = req.body as { action: 'updateStatus'; ids: string[]; status?: string }
  if (!Array.isArray(ids) || !ids.length) return res.status(400).json({ error: 'No ids provided' })

  if (action === 'updateStatus') {
    if (!status) return res.status(400).json({ error: 'No status provided' })
    const updated = await prisma.order.updateMany({ where: { id: { in: ids } }, data: { status } })
    return res.status(200).json({ count: updated.count })
  }

  res.status(400).json({ error: 'Unknown action' })
}
