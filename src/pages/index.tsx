import Head from 'next/head'
import Layout from '@/components/Layout'
import ProductCard from '@/components/ProductCard'
import Sidebar from '@/components/Sidebar'
import Image from 'next/image'

export default function Home() {
  const products = [
    {
      id: 'fone',
      name: 'Fone Bluetooth',
      price: 'R$ 39,90',
      image: '/products/fone.jpg'
    },
    {
      id: 'relogio',
      name: 'Relógio Digital',
      price: 'R$ 49,90',
      image: '/products/relogio.jpg'
    },
    {
      id: 'cabo',
      name: 'Cabo USB Reforçado',
      price: 'R$ 14,90',
      image: '/products/cabo.jpg'
    }
  ]

  return (
    <>
      <Head>
        <title>DYeshop — Loja Online</title>
      </Head>

      <Layout>
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map(p => (
            <ProductCard key={p.id} {...p} />
          ))}
        </section>
      </Layout>
    </>
  )
}
