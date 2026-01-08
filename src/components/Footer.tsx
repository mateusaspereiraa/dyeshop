import React from 'react'

const Footer: React.FC = () => {
  return (
    <footer className="bg-dye-black text-white mt-12">
      <div className="max-w-6xl mx-auto px-6 py-6 text-sm flex justify-between">
        <div>© {new Date().getFullYear()} DyeShop</div>
        <div className="flex gap-4">Contato · FAQ · Política</div>
      </div>
    </footer>
  )
}

export default Footer
