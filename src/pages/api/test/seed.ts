import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.ENABLE_TEST_ENDPOINTS !== '1') return res.status(404).end('Not found')
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed')

  const category = await prisma.category.upsert({
    where: { slug: 'test-cat' },
    update: {},
    create: { name: 'Test Category', slug: 'test-cat' }
  })

  const product = await prisma.product.upsert({
    where: { slug: 'test-product' },
    update: { price: 49.9, name: 'DyeShop Test Product' },
    create: { name: 'DyeShop Test Product', slug: 'test-product', description: 'Seed product for E2E tests', price: 49.9, categoryId: category.id }
  })

  res.status(200).json({ id: product.id, slug: product.slug, name: product.name, price: product.price })
}
