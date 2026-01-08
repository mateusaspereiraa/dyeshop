import React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost'
}

const Button: React.FC<Props> = ({ variant = 'primary', className = '', children, ...rest }) => {
  const base = 'inline-flex items-center gap-2 px-4 py-2 rounded font-semibold transition'
  const style =
    variant === 'primary'
      ? 'bg-dye-yellow text-black hover:brightness-95'
      : 'bg-transparent border border-dye-wood text-dye-black hover:bg-dye-gray-100'

  return (
    <button className={`${base} ${style} ${className}`} {...rest}>
      {children}
    </button>
  )
}

export default Button
