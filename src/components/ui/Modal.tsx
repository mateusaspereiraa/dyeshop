import React from 'react'

const Modal: React.FC<{ open: boolean; onClose: () => void; children?: React.ReactNode; title?: string }> = ({ open, onClose, children, title }) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg max-w-lg w-full p-6 z-10">
        {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
        {children}
        <div className="mt-4 flex justify-end">
          <button className="px-4 py-2 bg-dye-gray text-white rounded" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}

export default Modal
