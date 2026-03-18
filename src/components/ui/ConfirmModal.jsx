// src/components/ui/ConfirmModal.jsx

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import Button from './Button'

const ConfirmContent = ({ onClose, onConfirm, title, description, confirmLabel, isLoading }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative dark:bg-[#1e1b4b] bg-white border dark:border-white/10 border-slate-200 rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10">
        <div className="w-12 h-12 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold dark:text-white text-slate-900 text-center mb-2">{title}</h2>
        <p className="text-sm dark:text-slate-400 text-slate-500 text-center mb-6">{description}</p>
        <div className="flex gap-3">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1" disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="button" variant="danger" onClick={onConfirm} isLoading={isLoading} className="flex-1">
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = '¿Estás seguro?',
  description = 'Esta acción no se puede deshacer.',
  confirmLabel = 'Eliminar',
  isLoading = false,
}) => {
  if (!isOpen) return null
  return createPortal(
    <ConfirmContent
      onClose={onClose}
      onConfirm={onConfirm}
      title={title}
      description={description}
      confirmLabel={confirmLabel}
      isLoading={isLoading}
    />,
    document.body
  )
}

export default ConfirmModal
