import Link from 'next/link'
import React from 'react'

const Header: React.FC = () => {
  return (
    
    <header className="bg-dye-black text-white">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">DyeShop</Link>
        <nav className="flex gap-4 items-center">
          <Link href="/products">Produtos</Link>
          <Link href="/cart">Carrinho</Link>
          <Link href="/admin" className="bg-dye-wood px-3 py-2 rounded">Admin</Link>
        </nav>
      </div>
    </header>
  )
}

export default Header
