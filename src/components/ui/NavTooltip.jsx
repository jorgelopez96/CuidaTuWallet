// src/components/ui/NavTooltip.jsx

import { useState, useEffect } from 'react'

const TOOLTIP_KEY = 'ctw-nav-tooltips-done'

const TOOLTIPS = {
  '/dashboard': {
    text: 'Tu resumen financiero: balance, gastos por categoría y gráfico del mes.',
    delay: 600,
  },
  '/incomes': {
    text: 'Cargá tu sueldo y otros ingresos para saber cuánto dinero tenés disponible.',
    delay: 900,
  },
  '/expenses': {
    text: 'Registrá tus gastos del súper, servicios y suscripciones por categoría.',
    delay: 1200,
  },
  '/credit-cards': {
    text: 'Seguí tus compras en cuotas y sabé cuánto pagás por mes en tarjetas.',
    delay: 1500,
  },
}

const NavTooltip = ({ route, children }) => {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const done = localStorage.getItem(TOOLTIP_KEY)
    if (done) return

    const tooltip = TOOLTIPS[route]
    if (!tooltip) return

    const timer = setTimeout(() => setVisible(true), tooltip.delay)
    return () => clearTimeout(timer)
  }, [route])

  const dismiss = (e) => {
    e.stopPropagation()
    e.preventDefault()
    setVisible(false)
    setDismissed(true)
    // Marcar todos como vistos cuando cierra cualquiera
    localStorage.setItem(TOOLTIP_KEY, 'true')
  }

  if (!TOOLTIPS[route]) return children

  return (
    <div className="relative">
      {children}

      {visible && !dismissed && (
        <div
          className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 w-56"
          style={{ animation: 'tooltipIn 0.25s ease-out' }}
        >
          <style>{`
            @keyframes tooltipIn {
              from { opacity: 0; transform: translateY(-50%) translateX(-6px); }
              to   { opacity: 1; transform: translateY(-50%) translateX(0); }
            }
          `}</style>

          {/* Arrow */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2">
            <div className="w-0 h-0"
              style={{
                borderTop: '6px solid transparent',
                borderBottom: '6px solid transparent',
                borderRight: '8px solid #312e81',
              }}
            />
          </div>

          {/* Bubble */}
          <div className="bg-indigo-900 border border-indigo-700/60 rounded-xl p-3 shadow-xl shadow-black/30">
            <p className="text-xs text-indigo-100 leading-relaxed">{TOOLTIPS[route].text}</p>
            <button
              onClick={dismiss}
              className="mt-2 text-xs text-indigo-400 hover:text-white transition-colors font-medium"
            >
              Entendido ✓
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default NavTooltip
