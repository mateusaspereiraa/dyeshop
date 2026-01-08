import React from 'react'

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
}

const Input: React.FC<Props> = ({ label, className = '', ...rest }) => {
  return (
    <label className="block text-sm text-dye-black">
      {label && <div className="mb-1 font-medium">{label}</div>}
      <input className={`w-full rounded border border-dye-gray-300 px-3 py-2 ${className}`} {...rest} />
    </label>
  )
}

export default Input
