import React from 'react'
import Link from 'next/link'
import prisma from '../../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../api/auth/[...nextauth]'

export default function AdminProducts({ products }: { products: any[] }) {
  const [q, setQ] = React.useState('')
  const [selected, setSelected] = React.useState<string[]>([])

  const filtered = products.filter((p: any) => p.name.toLowerCase().includes(q.toLowerCase()) || p.slug.toLowerCase().includes(q.toLowerCase()))

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  const toggleAll = () => setSelected(filtered.map((p: any) => p.id))

  const bulkDelete = async () => {
    if (!selected.length) return alert('Nenhum produto selecionado')
    if (!confirm(`Excluir ${selected.length} produtos?`)) return
    await fetch('/api/admin/products/bulk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete', ids: selected }) })
    window.location.reload()
  }

  const exportCsv = async () => {
    const res = await fetch('/api/admin/products/export')
    const txt = await res.text()
    const blob = new Blob([txt], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'products.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gerenciar Produtos</h1>
          <div className="flex gap-2">
            <input placeholder="Buscar..." value={q} onChange={(e) => setQ(e.target.value)} className="border px-3 py-2 rounded" />
            <button className="bg-dye-yellow px-3 py-2 rounded text-black font-semibold" onClick={() => window.location.href = '/admin/products/new'}>Novo produto</button>
            <button className="px-3 py-2 rounded border" onClick={exportCsv}>Exportar CSV</button>
            <button className="px-3 py-2 rounded border" onClick={bulkDelete}>Excluir selecionados</button>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-2">
            <label className="inline-flex items-center gap-2"><input type="checkbox" onChange={toggleAll} /> Selecionar todos ({filtered.length})</label>
          </div>
          {filtered.map((p) => (
            <div key={p.id} className="p-4 bg-white rounded flex justify-between items-center">
              <div className="flex items-center gap-4">
                <input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggle(p.id)} />
                <div>
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-sm text-dye-gray-500">{p.slug} · R$ {p.price.toFixed(2)}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/products/${p.id}`} className="px-3 py-2 rounded border">Editar</Link>
                <button className="px-3 py-2 rounded border" onClick={async () => { if (!confirm('Excluir produto?')) return; await fetch(`/api/admin/products/${p.id}`, { method: 'DELETE' }); window.location.reload(); }}>Excluir</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

export async function getServerSideProps(ctx: any) {
  const session = await getServerSession(ctx.req, ctx.res, authOptions)
  if (!session || (session.user as any).role !== 'admin') {
    return { redirect: { destination: '/', permanent: false } }
  }

  const products = await prisma.product.findMany()
  return { props: { products: JSON.parse(JSON.stringify(products)) } }
}
