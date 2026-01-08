import Head from 'next/head'

export default function Home() {
  return (
    <>
      <Head>
        <title>DyeShop — Loja Online</title>
      </Head>
      <main className="min-h-screen px-6 py-12 bg-dye-gray-50">
        <section className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h1 className="text-4xl font-bold text-dye-black">DyeShop</h1>
            <div className="flex gap-4">
              <button className="bg-dye-yellow px-4 py-2 rounded text-black font-semibold">Promoções</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded shadow">Produto 1</div>
            <div className="bg-white p-6 rounded shadow">Produto 2</div>
            <div className="bg-white p-6 rounded shadow">Produto 3</div>
          </div>
        </section>
      </main>
    </>
  )
}
