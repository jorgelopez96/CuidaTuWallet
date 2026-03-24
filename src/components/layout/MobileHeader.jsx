// src/components/layout/MobileHeader.jsx

import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { NavItems } from './Sidebar'
import logo from '../../assets/logo.png'

const MobileHeader = () => {
  const [isOpen, setIsOpen] = useState(false)
  const drawerRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    const handleClick = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <div className="md:hidden">
      <header className="flex items-center justify-between px-4 py-3 dark:bg-[#13102b] bg-white border-b dark:border-white/10 border-slate-200 sticky top-0 z-40 transition-colors duration-300">
        {/* Logo clickeable */}
        <Link to="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src={logo} alt="CuidaTuWallet" className="w-7 h-7 rounded-lg object-cover" />
          <span className="dark:text-white text-slate-800 font-bold text-base">CuidaTuWallet</span>
        </Link>

        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-xl dark:text-slate-400 text-slate-500 dark:hover:text-white hover:text-slate-900 dark:hover:bg-white/10 hover:bg-slate-100 transition-all"
          aria-label="Abrir menú"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50">
          <div
            ref={drawerRef}
            className="absolute top-0 left-0 w-72 h-full dark:bg-[#13102b] bg-white border-r dark:border-white/10 border-slate-200 px-4 py-6 flex flex-col shadow-2xl overflow-visible"
            style={{ animation: 'slideInLeft 0.25s ease-out' }}
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 dark:text-slate-400 text-slate-500 dark:hover:text-white hover:text-slate-900 p-1.5 rounded-lg dark:hover:bg-white/10 hover:bg-slate-100 transition-all"
              aria-label="Cerrar menú"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <NavItems onItemClick={() => setIsOpen(false)} />
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to   { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default MobileHeader
