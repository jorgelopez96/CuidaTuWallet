// src/pages/LoginPage.jsx

import { SignIn } from '@clerk/clerk-react'
import AnimatedBackground from '../components/ui/AnimatedBackground'
import logo from '../assets/logo.png'

const LoginPage = () => (
  <div className="min-h-screen flex items-center justify-center p-4 relative">
    <AnimatedBackground />
    <div className="relative w-full max-w-sm z-10">
      <div className="text-center mb-8">
        <img src={logo} alt="CuidaTuWallet" className="w-20 h-20 mx-auto mb-4 drop-shadow-2xl" />
        <h1 className="text-3xl font-bold text-white tracking-tight">CuidaTuWallet</h1>
        <p className="text-slate-400 text-sm mt-2">Tu billetera inteligente</p>
      </div>

      <SignIn routing="hash" forceRedirectUrl="/dashboard" signUpUrl="/register" />
    </div>
  </div>
)

export default LoginPage
