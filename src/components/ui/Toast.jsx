// src/components/ui/Toast.jsx

import { useToast } from '../../hooks/useToast'

const ICONS = {
  success: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  info: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

const STYLES = {
  success: 'bg-emerald-500 text-white shadow-emerald-500/25',
  error:   'bg-red-500 text-white shadow-red-500/25',
  info:    'bg-indigo-500 text-white shadow-indigo-500/25',
}

const ToastItem = ({ toast, onRemove }) => (
  <div
    className={`
      inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-lg
      text-sm font-medium animate-slide-in
      ${STYLES[toast.type] || STYLES.info}
    `}
    role="alert"
  >
    {ICONS[toast.type]}
    <span className="flex-1">{toast.message}</span>
    <button
      onClick={() => onRemove(toast.id)}
      className="ml-1 opacity-60 hover:opacity-100 transition-opacity text-xs leading-none"
      aria-label="Cerrar notificación"
    >
      ✕
    </button>
  </div>
)

const Toast = () => {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed bottom-5 right-4 left-4 sm:left-auto sm:right-5 sm:w-auto z-50 flex flex-col items-end gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto w-full sm:w-auto sm:max-w-xs">
          <ToastItem toast={toast} onRemove={removeToast} />
        </div>
      ))}
    </div>
  )
}

export default Toast
