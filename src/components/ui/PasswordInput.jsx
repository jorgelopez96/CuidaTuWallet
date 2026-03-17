// src/components/ui/PasswordInput.jsx

import { useState } from 'react'

const getStrength = (password) => {
  if (!password) return { score: 0, label: '', color: '' }
  let score = 0
  if (password.length >= 6) score++
  if (password.length >= 10) score++
  if (/[A-Z]/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++

  const levels = [
    { label: '', color: '' },
    { label: 'Muy débil', color: 'bg-red-500' },
    { label: 'Débil', color: 'bg-orange-500' },
    { label: 'Aceptable', color: 'bg-yellow-500' },
    { label: 'Fuerte', color: 'bg-emerald-500' },
  ]
  return { score, ...levels[score] }
}

const EyeIcon = ({ open }) =>
  open ? (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  )

const PasswordInput = ({ label, id, error, showStrength = false, className = '', ...props }) => {
  const [visible, setVisible] = useState(false)
  const strength = showStrength ? getStrength(props.value || '') : null

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium dark:text-slate-300 text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          className={`
            w-full dark:bg-white/5 bg-white border rounded-xl px-4 py-2.5 pr-11 text-sm
            dark:text-white text-slate-900 placeholder:text-slate-400
            outline-none transition-all duration-200
            focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
            ${error ? 'border-red-400' : 'dark:border-white/10 border-slate-300'}
            ${className}
          `}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 dark:text-slate-400 text-slate-500 dark:hover:text-white hover:text-slate-900 transition-colors"
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          <EyeIcon open={visible} />
        </button>
      </div>

      {/* Strength bar — solo en Register */}
      {showStrength && props.value && (
        <div className="flex flex-col gap-1 mt-0.5">
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  i <= strength.score ? strength.color : 'dark:bg-white/10 bg-slate-200'
                }`}
              />
            ))}
          </div>
          {strength.label && (
            <div className="flex items-center gap-3 text-xs">
              <span className={`font-medium ${
                strength.score <= 1 ? 'text-red-500' :
                strength.score === 2 ? 'text-orange-500' :
                strength.score === 3 ? 'text-yellow-500' : 'text-emerald-500'
              }`}>
                {strength.label}
              </span>
              <div className="flex gap-2 dark:text-slate-500 text-slate-400">
                <span className={/[A-Z]/.test(props.value) ? 'text-emerald-500' : ''}>
                  {/[A-Z]/.test(props.value) ? '✓' : '○'} Mayúscula
                </span>
                <span className={/[^a-zA-Z0-9]/.test(props.value) ? 'text-emerald-500' : ''}>
                  {/[^a-zA-Z0-9]/.test(props.value) ? '✓' : '○'} Carácter especial
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  )
}

export default PasswordInput
