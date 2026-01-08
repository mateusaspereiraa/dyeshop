import React from 'react'
import Link from 'next/link'
import prisma from '../../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../api/auth/[...nextauth]'

export default function AdminOrders({ orders }: { orders: any[] }) {
  const [q, setQ] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState('')
  const [selected, setSelected] = React.useState<string[]>([])

  const filtered = orders.filter((o: any) => {
    const matchesQ = o.id.includes(q) || (o.customerEmail || (o.user && o.user.email) || '').toLowerCase().includes(q.toLowerCase())
    const matchesStatus = statusFilter ? o.status === statusFilter : true
    return matchesQ && matchesStatus
  })

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  const toggleAll = () => setSelected(filtered.map((o: any) => o.id))

  const bulkUpdateStatus = async (status: string) => {
    if (!selected.length) return alert('Nenhum pedido selecionado')
    if (!confirm(`Atualizar ${selected.length} pedidos para status ${status}?`)) return
    await fetch('/api/admin/orders/bulk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'updateStatus', ids: selected, status }) })
    window.location.reload()
  }

  const exportCsv = async () => {
    const res = await fetch('/api/admin/orders/export')
    const txt = await res.text()
    const blob = new Blob([txt], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'orders.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Pedidos</h1>
          <div className="flex gap-2">
            <input placeholder="Buscar por id ou email" value={q} onChange={(e) => setQ(e.target.value)} className="border px-3 py-2 rounded" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border px-3 py-2 rounded">
              <option value="">Todos</option>
              <option value="pending">pending</option>
              <option value="paid">paid</option>
              <option value="fulfilled">fulfilled</option>
              <option value="cancelled">cancelled</option>
              <option value="refunded">refunded</option>
            </select>
            <button className="px-3 py-2 rounded border" onClick={exportCsv}>Exportar CSV</button>
            <div className="dropdown">
              <button className="px-3 py-2 rounded border">Ações em massa</button>
              <div className="absolute bg-white rounded shadow mt-2 p-2 hidden">
                {/* placeholder */}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-2">
            <label className="inline-flex items-center gap-2"><input type="checkbox" onChange={toggleAll} /> Selecionar todos ({filtered.length})</label>
            <button className="px-3 py-2 rounded border" onClick={() => bulkUpdateStatus('fulfilled')}>Marcar fulfilled</button>
            <button className="px-3 py-2 rounded border" onClick={() => bulkUpdateStatus('cancelled')}>Marcar cancelled</button>
          </div>
          {filtered.map((o) => (
            <div key={o.id} className="p-4 bg-white rounded flex justify-between items-center">
              <div className="flex items-center gap-4">
                <input type="checkbox" checked={selected.includes(o.id)} onChange={() => toggle(o.id)} />
                <div>
                  <div className="font-semibold">Pedido {o.id}</div>
                  <div className="text-sm text-dye-gray-500">{o.customerEmail || (o.user && o.user.email) || '—'}</div>
                  <div className="text-sm text-dye-gray-500">{new Date(o.createdAt).toLocaleString()}</div>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <div className="font-semibold">R$ {o.total.toFixed(2)}</div>
                <div className="px-3 py-1 rounded border text-sm">{o.status}</div>
                <Link href={`/admin/orders/${o.id}`} className="px-3 py-2 rounded border">Ver</Link>
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

  const orders = await prisma.order.findMany({ include: { user: true }, orderBy: { createdAt: 'desc' } })
  return { props: { orders: JSON.parse(JSON.stringify(orders)) } }
}
