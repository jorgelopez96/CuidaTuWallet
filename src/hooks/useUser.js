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

  const fetchProfile = useCallback(async () => {
    if (!user) return
    context.dispatch({ type: 'FETCH_START' })
    try {
      const profile = await getUserProfile(user.uid)
      context.dispatch({ type: 'FETCH_SUCCESS', payload: profile })
    } catch {
      context.dispatch({ type: 'FETCH_ERROR', payload: 'Error al cargar perfil' })
    }
  }, [user])

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
