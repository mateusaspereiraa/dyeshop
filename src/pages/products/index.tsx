import { GetServerSideProps } from 'next'
import prisma from '../../lib/prisma'
import ProductGrid from '../../components/ProductGrid'
import Head from 'next/head'

export default function ProductsPage({ products }: { products: any[] }) {
  return (
    <>
      <Head>
        <title>Produtos — DyeShop</title>
      </Head>
      <main className="bg-dye-gray min-h-screen">
        <section className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Produtos</h2>
          <ProductGrid products={products} />
        </section>
      </main>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  const products = await prisma.product.findMany()
  return { props: { products: JSON.parse(JSON.stringify(products)) } }
}
