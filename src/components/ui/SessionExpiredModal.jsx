// src/components/ui/SessionExpiredModal.jsx

import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Button from './Button'

const SessionExpiredModal = () => {
  const { sessionExpired, dispatch } = useAuth()
  const navigate = useNavigate()

  if (!sessionExpired) return null

  const handleGoToLogin = () => {
    dispatch({ type: 'CLEAR_USER' })
    navigate('/login')
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative dark:bg-[#1e1b4b] bg-white border dark:border-white/10 border-slate-200 rounded-2xl shadow-2xl w-full max-w-sm p-7 z-10 text-center">
        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-amber-500/15 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h2 className="text-xl font-bold dark:text-white text-slate-900 mb-2">
          Tu sesión expiró
        </h2>
        <p className="text-sm dark:text-slate-400 text-slate-500 mb-6">
          Por seguridad, cerramos tu sesión automáticamente después de 30 minutos de inactividad.
        </p>

        <Button onClick={handleGoToLogin} className="w-full" size="lg">
          Volver a iniciar sesión
        </Button>
      </div>
    </div>
  )
}

export default SessionExpiredModal
