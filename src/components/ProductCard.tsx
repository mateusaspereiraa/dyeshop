import Link from 'next/link'
import Image from 'next/image'

type Props = {
  id: string
  name: string
  price: string
  image: string
}

export default function ProductCard({ id, name, price, image }: Props) {
  return (
    <Link href={`/product/${id}`}>
      <div className="bg-zinc-900 p-4 rounded-lg cursor-pointer hover:ring-2 hover:ring-dye-yellow">
        <Image
          src={image}
          alt={name}
          width={300}
          height={300}
          className="rounded mb-3"
        />

        <h3 className="text-dye-gray">{name}</h3>
        <div className="text-dye-yellow text-lg font-bold">{price}</div>

        <button className="mt-3 w-full bg-dye-yellow text-black py-2 rounded font-semibold">
          Ver Produto
        </button>
      </div>
    </Link>
  )
}
