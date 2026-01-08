import React from 'react'
import Image from 'next/image'
import Button from './ui/Button'
import { Product } from '@prisma/client'

const ProductCard: React.FC<{ product: Partial<Product> }> = ({ product }) => {
  const priceFormatted = (product.price || 0).toFixed(2)

  const addToCart = async () => {
    await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: product.id, quantity: 1 })
    })
    // naive UI feedback
    alert('Adicionado ao carrinho')
  }

  return (
    <div className="border rounded overflow-hidden bg-white text-dye-black">
      <div className="h-48 bg-gray-100 flex items-center justify-center relative">
        {product.image ? (
          <Image src={product.image as string} alt={product.name ?? ''} fill style={{ objectFit: 'contain' }} sizes="200px" />
        ) : (
          <div className="text-sm">Sem imagem</div>
        )}
      </div>
      <div className="p-4">
        <h4 className="font-semibold">{product.name}</h4>
        <div className="mt-2 text-dye-wood font-bold">R$ {priceFormatted}</div>
        <div className="mt-4 flex gap-2">
          <Button onClick={addToCart}>Adicionar</Button>
          <a href={`/products/${product.slug}`} className="inline-flex items-center px-4 py-2 rounded border border-dye-gray-300">Ver</a>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
