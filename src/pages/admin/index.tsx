import React from 'react'
import Link from 'next/link'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../api/auth/[...nextauth]'

export default function AdminIndex() {
  return (
    <main className="min-h-screen px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Painel Admin</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/admin/products" className="p-4 bg-white rounded shadow">Produtos</Link>
          <Link href="/admin/orders" className="p-4 bg-white rounded shadow">Pedidos (placeholder)</Link>
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
  return { props: {} }
}
