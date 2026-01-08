import Head from 'next/head'
import { useState } from 'react'

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [page, setPage] = useState<'home' | 'cart' | 'history' | 'admin'>('home')

  return (
    <>
      <Head>
        <title>DyeShop — Loja Online</title>
      </Head>

      <div className="min-h-screen bg-black text-white flex">
        {/* MENU LATERAL */}
        <aside
          className={`fixed top-0 left-0 h-full w-64 bg-zinc-900 p-6 transition-transform z-50
          ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <h2 className="text-yellow-400 text-xl font-bold mb-6">DYeshop</h2>

          <nav className="flex flex-col gap-3">
            <button onClick={() => setPage('home')}>🏠 Home</button>
            <button onClick={() => setPage('cart')}>🛒 Carrinho</button>
            <button onClick={() => setPage('history')}>📦 Histórico</button>

            <hr className="my-4 opacity-20" />

            <button onClick={() => setPage('admin')}>🛠 Admin</button>
          </nav>
        </aside>

        {/* CONTEÚDO */}
        <main className="flex-1 px-6 py-8">
          {/* HEADER */}
          <header className="flex items-center justify-between mb-10">
            <button
              className="text-2xl"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              ☰
            </button>

            <h1 className="text-3xl font-bold text-yellow-400">
              DY<span className="text-gray-400">eshop</span>
            </h1>

            <button onClick={() => setPage('cart')}>🛒</button>
          </header>

          {/* PÁGINAS */}
          {page === 'home' && (
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Product name="Fone Bluetooth" price="R$ 39,90" />
              <Product name="Relógio Digital" price="R$ 49,90" />
              <Product name="Cabo Reforçado" price="R$ 14,90" />
            </section>
          )}

          {page === 'cart' && (
            <section>
              <h2 className="text-xl text-yellow-400 mb-4">Carrinho</h2>
              <p>Seu carrinho está vazio.</p>
            </section>
          )}

          {page === 'history' && (
            <section>
              <h2 className="text-xl text-yellow-400 mb-4">Histórico</h2>
              <p>Nenhuma compra registrada.</p>
            </section>
          )}

          {page === 'admin' && (
            <section>
              <h2 className="text-xl text-yellow-400 mb-4">Painel Admin</h2>
              <ul className="list-disc ml-5">
                <li>Gerenciar produtos</li>
                <li>Pedidos</li>
                <li>Relatórios</li>
              </ul>
            </section>
          )}
        </main>
      </div>
    </>
  )
}

function Product({ name, price }: { name: string; price: string }) {
  return (
    <div className="bg-zinc-900 p-6 rounded-lg">
      <div className="h-32 bg-zinc-800 rounded mb-4" />
      <h3 className="text-gray-300">{name}</h3>
      <div className="text-yellow-400 text-lg font-bold">{price}</div>
      <button className="mt-4 w-full bg-yellow-400 text-black py-2 rounded font-semibold">
        Comprar
      </button>
    </div>
  )
}

