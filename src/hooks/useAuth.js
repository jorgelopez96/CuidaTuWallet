// src/hooks/useAuth.js

import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { loginUser, registerUser, logoutUser } from '../services/authService'
import { createUserProfile } from '../services/userService'
import { useToast } from './useToast'

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider')

  const { addToast } = useToast()

  const login = async (email, password) => {
    context.dispatch({ type: 'SET_ERROR', payload: null })
    try {
      const user = await loginUser(email, password)
      context.dispatch({ type: 'SET_USER', payload: user })
      addToast('Sesión iniciada correctamente', 'success')
      return { success: true }
    } catch (error) {
      const message = getAuthErrorMessage(error.code)
      context.dispatch({ type: 'SET_ERROR', payload: message })
      addToast(message, 'error')
      return { success: false }
    }
  }

  const register = async ({ email, password, name, birthdate }) => {
    context.dispatch({ type: 'SET_ERROR', payload: null })
    try {
      const user = await registerUser(email, password)
      await createUserProfile(user.uid, { name, birthdate, email })
      context.dispatch({ type: 'SET_USER', payload: user })
      addToast(`Bienvenido, ${name}!`, 'success')
      return { success: true }
    } catch (error) {
      const message = getAuthErrorMessage(error.code)
      context.dispatch({ type: 'SET_ERROR', payload: message })
      addToast(message, 'error')
      return { success: false }
    }
  }

  const logout = async () => {
    try {
      await logoutUser()
      context.dispatch({ type: 'CLEAR_USER' })
      addToast('Sesión cerrada', 'success')
    } catch {
      addToast('Error al cerrar sesión', 'error')
    }
  }

  return { ...context, login, register, logout }
}

const getAuthErrorMessage = (code) => {
  const messages = {
    'auth/user-not-found': 'No existe una cuenta con ese email',
    'auth/wrong-password': 'Contraseña incorrecta',
    'auth/email-already-in-use': 'Ya existe una cuenta con ese email',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
    'auth/invalid-email': 'El email no es válido',
    'auth/invalid-credential': 'Credenciales incorrectas',
    'auth/too-many-requests': 'Demasiados intentos. Intentá más tarde',
  }
  return messages[code] || 'Ocurrió un error inesperado'
}
