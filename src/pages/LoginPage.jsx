// src/pages/LoginPage.jsx

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import PasswordInput from '../components/ui/PasswordInput'
import AnimatedBackground from '../components/ui/AnimatedBackground'
import logo from '../assets/logo.png'

const LoginPage = () => {
  const { login, isLoading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.email) e.email = 'El email es requerido'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email inválido'
    if (!form.password) e.password = 'La contraseña es requerida'
    else if (form.password.length < 6) e.password = 'Mínimo 6 caracteres'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }
    const result = await login(form.email, form.password)
    if (result.success) navigate('/dashboard')
  }

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <AnimatedBackground />
      <div className="relative w-full max-w-sm z-10">
        <div className="text-center mb-8">
          <img
            src={logo}
            alt="CuidaTuWallet"
            className="w-20 h-20 mx-auto mb-4 drop-shadow-2xl"
          />
          <h1 className="text-3xl font-bold text-white tracking-tight">CuidaTuWallet</h1>
          <p className="text-slate-400 text-sm mt-2">Tu billetera inteligente</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-7 backdrop-blur-xl shadow-2xl">
          <h2 className="text-lg font-semibold text-white mb-5">Iniciá sesión</h2>
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <Input
              id="email" label="Email" type="email" placeholder="tu@email.com"
              value={form.email} onChange={handleChange('email')} error={errors.email} autoComplete="email"
            />
            <PasswordInput
              id="password" label="Contraseña" placeholder="••••••••"
              value={form.password} onChange={handleChange('password')} error={errors.password} autoComplete="current-password"
            />
            <Button type="submit" isLoading={isLoading} className="w-full mt-1" size="lg">
              Ingresar
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-400 mt-5">
          ¿No tenés cuenta?{' '}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
            Registrate gratis
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
