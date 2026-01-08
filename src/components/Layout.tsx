import React from 'react'
import Header from './Header'
import Footer from './Footer'

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  )
}

export default Layout
