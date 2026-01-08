export default function Sidebar({ open, close }: any) {
  const Item = ({ label }: { label: string }) => (
    <button
      onClick={close}
      className="text-left hover:text-dye-yellow"
    >
      {label}
    </button>
  )

  return (
    <aside
      className={`fixed top-0 left-0 h-full w-64 bg-zinc-900 p-6 z-50 transition-transform
      ${open ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <h2 className="text-dye-yellow text-xl font-bold mb-6">Menu</h2>

      <nav className="flex flex-col gap-3">
        <Item label="🏠 Home" />
        <Item label="🛒 Carrinho" />
        <Item label="📦 Histórico" />
        <Item label="🔍 Buscas" />
        <Item label="❓ Ajuda" />
        <Item label="⚙️ Configurações" />

        <hr className="my-4 opacity-20" />

        <Item label="🛠 Admin" />
      </nav>
    </aside>
  )
}
