// src/hooks/useUser.js

import { useContext, useCallback } from 'react'
import { UserContext, getInitials } from '../context/UserContext'
import { getUserProfile, updateUserProfile } from '../services/userService'
import { useAuth } from './useAuth'
import { useToast } from './useToast'

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) throw new Error('useUser debe usarse dentro de UserProvider')

  const { user } = useAuth()
  const { addToast } = useToast()

  // useCallback para que fetchProfile no cambie de referencia en cada render
  const fetchProfile = useCallback(async () => {
    if (!user) return
    context.dispatch({ type: 'FETCH_START' })
    try {
      const profile = await getUserProfile(user.uid)
      // Si no existe el perfil en Firestore (cuenta vieja), creamos uno mínimo
      if (!profile) {
        const fallback = {
          name: user.email?.split('@')[0] || 'Usuario',
          email: user.email || '',
          birthdate: '',
        }
        context.dispatch({ type: 'FETCH_SUCCESS', payload: fallback })
      } else {
        context.dispatch({ type: 'FETCH_SUCCESS', payload: profile })
      }
    } catch {
      // En caso de error, usar datos mínimos del auth para no romper la UI
      const fallback = {
        name: user.email?.split('@')[0] || 'Usuario',
        email: user.email || '',
        birthdate: '',
      }
      context.dispatch({ type: 'FETCH_SUCCESS', payload: fallback })
    }
  }, [user?.uid])

  const updateProfile = async (data) => {
    if (!user) return { success: false }
    try {
      await updateUserProfile(user.uid, data)
      context.dispatch({ type: 'UPDATE_PROFILE', payload: data })
      addToast('Perfil actualizado', 'success')
      return { success: true }
    } catch {
      addToast('Error al actualizar perfil', 'error')
      return { success: false }
    }
  }

  const initials = getInitials(context.profile?.name)
  const displayName = context.profile?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Usuario'

  return { ...context, fetchProfile, updateProfile, initials, displayName }
}
