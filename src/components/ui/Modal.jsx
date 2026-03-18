// src/components/ui/Modal.jsx

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import CloseButton from './CloseButton'

const ModalContent = ({ onClose, title, children }) => {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative dark:bg-[#1e1b4b] bg-white border dark:border-white/10 border-slate-200 rounded-2xl shadow-2xl w-full max-w-md p-6 z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold dark:text-white text-slate-900">{title}</h2>
          <CloseButton onClick={onClose} label="Cerrar modal" variant="solid" />
        </div>
        {children}
      </div>
    </div>
  )
}

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null
  return createPortal(
    <ModalContent onClose={onClose} title={title}>{children}</ModalContent>,
    document.body
  )
}

export default Modal
