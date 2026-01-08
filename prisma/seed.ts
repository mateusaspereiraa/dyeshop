import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main(){
  const cat = await prisma.category.upsert({
    where: { slug: 'intro' },
    update: {},
    create: { name: 'Intro', slug: 'intro' }
  })

  await prisma.product.createMany({ data: [
    { name: 'Camiseta Dye', slug: 'camiseta-dye', price: 49.9, image: '/images/product1.jpg', categoryId: cat.id },
    { name: 'Caneca Dye', slug: 'caneca-dye', price: 19.9, image: '/images/product2.jpg', categoryId: cat.id }
  ]})
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
