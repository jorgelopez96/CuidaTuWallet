// src/pages/RegisterPage.jsx

import { useState } from 'react'
import { SignUp } from '@clerk/clerk-react'
import AnimatedBackground from '../components/ui/AnimatedBackground'
import TermsModal from '../components/ui/TermsModal'
import logo from '../assets/logo.png'

const RegisterPage = () => {
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [termsModal, setTermsModal] = useState(false)

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <AnimatedBackground />
      <div className="relative w-full max-w-sm z-10 py-6">
        <div className="text-center mb-6">
          <img src={logo} alt="CuidaTuWallet" className="w-16 h-16 mx-auto mb-3 drop-shadow-2xl" />
          <h1 className="text-2xl font-bold text-white tracking-tight">Crear cuenta</h1>
          <p className="text-slate-400 text-sm mt-1">Empezá a controlar tus finanzas</p>
        </div>

        {acceptedTerms ? (
          <SignUp routing="hash" forceRedirectUrl="/dashboard" signInUrl="/login" />
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-7 backdrop-blur-xl shadow-2xl">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 accent-indigo-500 w-4 h-4 shrink-0"
              />
              <span className="text-sm text-slate-300">
                Acepto los{' '}
                <button
                  type="button"
                  onClick={() => setTermsModal(true)}
                  className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
                >
                  términos y condiciones
                </button>{' '}
                para crear una cuenta
              </span>
            </label>
          </div>
        )}
      </div>
      <TermsModal isOpen={termsModal} onClose={() => setTermsModal(false)} />
    </div>
  )
}

export default RegisterPage
