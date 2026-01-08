import { ReactNode, useState } from 'react'
import Sidebar from './Sidebar'

export default function Layout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-black text-white flex">
      <Sidebar open={open} close={() => setOpen(false)} />

      <div className="flex-1 p-6">
        <header className="flex items-center justify-between mb-10">
          <button onClick={() => setOpen(!open)} className="text-2xl">☰</button>

          <h1 className="text-3xl font-bold text-dye-yellow">
            DY<span className="text-dye-gray">eshop</span>
          </h1>

          <span>🛒</span>
        </header>

        {children}
      </div>
    </div>
  )
}


