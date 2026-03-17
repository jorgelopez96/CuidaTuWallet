// src/pages/RegisterPage.jsx

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import PasswordInput from '../components/ui/PasswordInput'
import AnimatedBackground from '../components/ui/AnimatedBackground'
import TermsModal from '../components/ui/TermsModal'
import logo from '../assets/logo.png'

const RegisterPage = () => {
  const { register, isLoading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', birthdate: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [termsError, setTermsError] = useState('')
  const [termsModal, setTermsModal] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'El nombre es requerido'
    if (!form.birthdate) e.birthdate = 'La fecha de nacimiento es requerida'
    if (!form.email) e.email = 'El email es requerido'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email inválido'
    if (!form.password) e.password = 'La contraseña es requerida'
    else if (form.password.length < 6) e.password = 'Mínimo 6 caracteres'
    else if (!/[A-Z]/.test(form.password)) e.password = 'Debe tener al menos una mayúscula'
    else if (!/[^a-zA-Z0-9]/.test(form.password)) e.password = 'Debe tener al menos un carácter especial'
    if (!form.confirm) e.confirm = 'Confirmá la contraseña'
    else if (form.confirm !== form.password) e.confirm = 'Las contraseñas no coinciden'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }
    if (!acceptedTerms) { setTermsError('Debés aceptar los términos y condiciones'); return }
    const result = await register({ email: form.email, password: form.password, name: form.name, birthdate: form.birthdate })
    if (result.success) navigate('/dashboard')
  }

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <AnimatedBackground />
      <div className="relative w-full max-w-sm z-10 py-6">
        <div className="text-center mb-6">
          <img src={logo} alt="CuidaTuWallet" className="w-16 h-16 mx-auto mb-3 drop-shadow-2xl" />
          <h1 className="text-2xl font-bold text-white tracking-tight">Crear cuenta</h1>
          <p className="text-slate-400 text-sm mt-1">Empezá a controlar tus finanzas</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-7 backdrop-blur-xl shadow-2xl">
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <Input id="name" label="Nombre completo" placeholder="Juan García" value={form.name} onChange={handleChange('name')} error={errors.name} autoComplete="name" />
            <Input id="birthdate" label="Fecha de nacimiento" type="date" value={form.birthdate} onChange={handleChange('birthdate')} error={errors.birthdate} />
            <Input id="email" label="Email" type="email" placeholder="tu@email.com" value={form.email} onChange={handleChange('email')} error={errors.email} autoComplete="email" />
            <PasswordInput id="password" label="Contraseña" placeholder="••••••••" value={form.password} onChange={handleChange('password')} error={errors.password} autoComplete="new-password" showStrength />
            <PasswordInput id="confirm" label="Confirmar contraseña" placeholder="••••••••" value={form.confirm} onChange={handleChange('confirm')} error={errors.confirm} autoComplete="new-password" />

            <div className="flex flex-col gap-1">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox" checked={acceptedTerms}
                  onChange={(e) => { setAcceptedTerms(e.target.checked); setTermsError('') }}
                  className="mt-0.5 accent-indigo-500 w-4 h-4 shrink-0"
                />
                <span className="text-sm text-slate-300">
                  Acepto los{' '}
                  <button type="button" onClick={() => setTermsModal(true)} className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">
                    términos y condiciones
                  </button>
                </span>
              </label>
              {termsError && <span className="text-xs text-red-400">{termsError}</span>}
            </div>

            <Button type="submit" isLoading={isLoading} className="w-full mt-1" size="lg">
              Crear cuenta
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-400 mt-5">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
            Iniciá sesión
          </Link>
        </p>
      </div>
      <TermsModal isOpen={termsModal} onClose={() => setTermsModal(false)} />
    </div>
  )
}

export default RegisterPage
