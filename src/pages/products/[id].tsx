import { useRouter } from 'next/router'
import Layout from '@/components/Layout'

export default function ProductPage() {
  const { query } = useRouter()

  return (
    <Layout>
      <h2 className="text-2xl text-dye-yellow mb-4">
        Produto: {query.id}
      </h2>

      <p>Descrição do produto.</p>
      <button className="mt-6 bg-dye-yellow text-black px-6 py-3 rounded font-bold">
        Comprar Agora
      </button>
    </Layout>
  )
}
