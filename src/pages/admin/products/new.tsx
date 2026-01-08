import React, { useState } from 'react'
import { useRouter } from 'next/router'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'

export default function NewProduct() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', slug: '', price: '', image: '', description: '', categoryId: '' })
  const [loading, setLoading] = useState(false)

  const submit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/admin/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setLoading(false)
    router.push('/admin/products')
  }

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded">
        <h1 className="text-xl font-bold mb-4">Novo produto</h1>
        <form onSubmit={submit} className="space-y-4">
          <Input label="Nome" value={form.name} onChange={(e: any) => setForm({ ...form, name: e.target.value })} />
          <Input label="Slug" value={form.slug} onChange={(e: any) => setForm({ ...form, slug: e.target.value })} />
          <Input label="Preço" value={form.price} onChange={(e: any) => setForm({ ...form, price: e.target.value })} />
          <Input label="Imagem (URL)" value={form.image} onChange={(e: any) => setForm({ ...form, image: e.target.value })} />
          <Input label="Descrição" value={form.description} onChange={(e: any) => setForm({ ...form, description: e.target.value })} />
          <Input label="Categoria ID (opcional)" value={form.categoryId} onChange={(e: any) => setForm({ ...form, categoryId: e.target.value })} />
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>Criar</Button>
            <Button type="button" variant="ghost" onClick={() => router.push('/admin/products')}>Cancelar</Button>
          </div>
        </form>
      </div>
    </main>
  )
}
