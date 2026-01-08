// Simple client helper page to trigger product export (optional)
import React from 'react'
export default function ExportProducts() {
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
  return <button onClick={exportCsv} className="px-3 py-2 rounded border">Exportar Produtos CSV</button>
}
