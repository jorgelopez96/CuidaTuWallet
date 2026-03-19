// src/components/ui/OnboardingTips.jsx

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const ONBOARDING_KEY = 'ctw-onboarding-done'

const TIPS = [
  {
    id: 1,
    icon: '💰',
    title: 'Registrá tus ingresos',
    description: 'Empezá cargando tu sueldo mensual para saber con cuánto contás. Podés indicar el día de cobro y el mes en que vence.',
    action: 'Ir a Ingresos',
    route: '/incomes',
    color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30',
    iconBg: 'bg-emerald-500/20',
  },
  {
    id: 2,
    icon: '📤',
    title: 'Registrá tus gastos',
    description: 'Cargá tus gastos del súper, servicios, suscripciones y más. Filtrá por categoría para ver en qué gastás más.',
    action: 'Ir a Gastos',
    route: '/expenses',
    color: 'from-red-500/20 to-orange-500/10 border-red-500/30',
    iconBg: 'bg-red-500/20',
  },
  {
    id: 3,
    icon: '💳',
    title: 'Seguí tus tarjetas',
    description: 'Agregá tus tarjetas de crédito y registrá cada compra en cuotas. La app te muestra cuánto pagás por mes y cuántas cuotas te quedan.',
    action: 'Ir a Tarjetas',
    route: '/credit-cards',
    color: 'from-violet-500/20 to-purple-500/10 border-violet-500/30',
    iconBg: 'bg-violet-500/20',
  },
  {
    id: 4,
    icon: '📊',
    title: 'Tu balance en el Dashboard',
    description: 'El dashboard te muestra tu balance real: ingresos menos gastos y cuotas. También ves el gráfico de en qué estás gastando más.',
    action: 'Ver Dashboard',
    route: '/dashboard',
    color: 'from-indigo-500/20 to-blue-500/10 border-indigo-500/30',
    iconBg: 'bg-indigo-500/20',
  },
]

const OnboardingTips = () => {
  const [visible, setVisible] = useState(false)
  const [currentTip, setCurrentTip] = useState(0)
  const [isExiting, setIsExiting] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const done = localStorage.getItem(ONBOARDING_KEY)
    if (!done) {
      // Pequeño delay para que no aparezca inmediatamente al cargar
      const timer = setTimeout(() => setVisible(true), 800)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleDismiss = () => {
    setIsExiting(true)
    setTimeout(() => {
      setVisible(false)
      localStorage.setItem(ONBOARDING_KEY, 'true')
    }, 300)
  }

  const handleAction = (route) => {
    if (currentTip < TIPS.length - 1) {
      setCurrentTip((prev) => prev + 1)
    } else {
      handleDismiss()
    }
    navigate(route)
  }

  const handleSkip = () => {
    handleDismiss()
  }

  if (!visible) return null

  const tip = TIPS[currentTip]

  return (
    <div
      className={`fixed bottom-6 right-6 z-40 w-80 transition-all duration-300 ${
        isExiting ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
      }`}
      style={{ animation: !isExiting ? 'slideUpIn 0.35s ease-out' : undefined }}
    >
      <style>{`
        @keyframes slideUpIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className={`relative bg-gradient-to-br ${tip.color} dark:bg-[#1e1b4b] bg-white border rounded-2xl shadow-2xl p-5 backdrop-blur-sm`}>
        {/* Progress dots */}
        <div className="flex items-center gap-1.5 mb-4">
          {TIPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentTip
                  ? 'w-6 bg-indigo-500'
                  : i < currentTip
                  ? 'w-3 bg-indigo-400/50'
                  : 'w-3 dark:bg-white/10 bg-slate-200'
              }`}
            />
          ))}
          <button
            onClick={handleSkip}
            className="ml-auto text-xs dark:text-slate-500 text-slate-400 hover:dark:text-slate-300 hover:text-slate-600 transition-colors"
          >
            Saltar guía
          </button>
        </div>

        {/* Content */}
        <div className="flex items-start gap-3 mb-4">
          <div className={`${tip.iconBg} w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0`}>
            {tip.icon}
          </div>
          <div>
            <h3 className="font-bold dark:text-white text-slate-900 text-sm mb-1">{tip.title}</h3>
            <p className="text-xs dark:text-slate-300 text-slate-600 leading-relaxed">{tip.description}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleAction(tip.route)}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
          >
            {currentTip < TIPS.length - 1 ? `${tip.action} →` : '¡Entendido!'}
          </button>
          {currentTip < TIPS.length - 1 && (
            <button
              onClick={() => setCurrentTip((prev) => prev + 1)}
              className="text-xs dark:text-slate-400 text-slate-500 hover:dark:text-white hover:text-slate-900 px-3 py-2 transition-colors"
            >
              Siguiente
            </button>
          )}
        </div>

        {/* Step indicator */}
        <p className="text-center text-xs dark:text-slate-500 text-slate-400 mt-3">
          {currentTip + 1} de {TIPS.length}
        </p>
      </div>
    </div>
  )
}

export default OnboardingTips
