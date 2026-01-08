import Image from 'next/image'
import { ReactNode, useState } from 'react'
import Sidebar from './Sidebar'

export default function Layout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-black text-white flex">
      <Sidebar open={open} close={() => setOpen(false)} />

      <div className="flex-1 p-6">
        <header className="flex items-center justify-between mb-10">
          <button
            onClick={() => setOpen(!open)}
            className="text-2xl"
            aria-label="Abrir menu"
          >
            ☰
          </button>

          {/* LOGOTIPO */}
          <Image
            src="/logo.png"
            alt="DYeshop"
            width={140}
            height={40}
            priority
          />

          <span aria-label="Carrinho">🛒</span>
        </header>

        {children}
      </div>
    </div>
  )
}
