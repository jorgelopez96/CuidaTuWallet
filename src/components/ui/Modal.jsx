// src/components/ui/Modal.jsx

import { useEffect } from 'react'

const Modal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    if (isOpen) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative dark:bg-[#1e1b4b] bg-white border dark:border-white/10 border-slate-200 rounded-2xl shadow-2xl w-full max-w-md p-6 z-10 transition-colors duration-300">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold dark:text-white text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="dark:text-slate-400 text-slate-500 dark:hover:text-white hover:text-slate-900 transition-colors w-8 h-8 flex items-center justify-center rounded-lg dark:hover:bg-white/10 hover:bg-slate-100"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default Modal
