import React, { useState } from 'react'
import prisma from '../../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../api/auth/[...nextauth]'
import Button from '../../../components/ui/Button'

export default function OrderDetail({ order }: { order: any }) {
  const [status, setStatus] = useState(order.status)
  const [loading, setLoading] = useState(false)

  const save = async () => {
    setLoading(true)
    await fetch(`/api/admin/orders/${order.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    setLoading(false)
    alert('Status atualizado')
  }

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded">
        <h1 className="text-xl font-bold mb-4">Pedido {order.id}</h1>
        <div className="mb-4">
          <div className="text-sm text-dye-gray-500">Cliente: {order.customerEmail || (order.user && order.user.email) || '—'}</div>
          <div className="text-sm text-dye-gray-500">Total: R$ {order.total.toFixed(2)}</div>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold mb-2">Itens</h3>
          <div className="space-y-2">
            {order.items.map((it: any) => (
              <div key={it.id} className="p-2 border rounded flex justify-between">
                <div>{it.product.name} × {it.quantity}</div>
                <div>R$ {(it.price * it.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="border px-3 py-2 rounded">
            <option value="pending">pending</option>
            <option value="paid">paid</option>
            <option value="fulfilled">fulfilled</option>
            <option value="cancelled">cancelled</option>
            <option value="refunded">refunded</option>
          </select>
          <Button onClick={save} disabled={loading}>Salvar</Button>
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
  const { id } = ctx.params
  const order = await prisma.order.findUnique({ where: { id: String(id) }, include: { items: { include: { product: true } }, user: true } })
  return { props: { order: order ? JSON.parse(JSON.stringify(order)) : null } }
}
