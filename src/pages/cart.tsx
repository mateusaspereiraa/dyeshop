import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import Button from '../components/ui/Button'

export default function CartPage() {
  const [items, setItems] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/cart').then((res) => res.json()).then(setItems).catch(() => setItems([]))
  }, [])

  const checkout = async () => {
    const res = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items }) })
    const data = await res.json()
    // redirect to Stripe
    const stripeModule = await import('@stripe/stripe-js')
    const s = await stripeModule.loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')
    if (!s) throw new Error('Stripe failed to load')
    await s.redirectToCheckout({ sessionId: data.id })
  }

  return (
    <>
      <Head>
        <title>Carrinho — DyeShop</title>
      </Head>
      <main className="min-h-screen px-6 py-12">
        <section className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Seu carrinho</h2>
          <div className="space-y-4">
            {items.map((it) => (
              <div key={it.id} className="p-4 bg-white rounded flex justify-between items-center">
                <div>
                  <div className="font-semibold">{it.product.name}</div>
                  <div className="text-sm text-dye-gray-500">Quantidade: {it.quantity}</div>
                </div>
                <div>R$ {(it.product.price * it.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={checkout}>Finalizar compra</Button>
          </div>
        </section>
      </main>
    </>
  )
}
