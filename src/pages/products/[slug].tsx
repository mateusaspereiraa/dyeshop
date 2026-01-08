import { GetServerSideProps } from 'next'
import prisma from '../../lib/prisma'
import Head from 'next/head'
import Image from 'next/image'
import Button from '../../components/ui/Button'

export default function ProductPage({ product }: { product: any }) {
  if (!product) return <div>Produto não encontrado</div>

  return (
    <>
      <Head>
        <title>{product.name} — DyeShop</title>
      </Head>
      <main className="min-h-screen px-6 py-12">
        <section className="max-w-4xl mx-auto bg-white p-6 rounded">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-100 flex items-center justify-center relative">{product.image ? <Image src={product.image as string} alt={product.name} fill style={{ objectFit: 'contain' }} sizes="(max-width: 768px) 100vw, 50vw" /> : 'Sem imagem'}</div>
            <div>
              <h1 className="text-2xl font-bold">{product.name}</h1>
              <p className="mt-4 text-dye-gray-500">{product.description}</p>
              <div className="mt-6 text-dye-wood font-bold text-xl">R$ {product.price.toFixed(2)}</div>
              <div className="mt-6">
                <Button onClick={async () => { await fetch('/api/cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: product.id, quantity: 1 }) }); alert('Adicionado') }}>Adicionar ao carrinho</Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { slug } = ctx.query
  const product = await prisma.product.findUnique({ where: { slug: String(slug) } })
  return { props: { product: product ? JSON.parse(JSON.stringify(product)) : null } }
}
