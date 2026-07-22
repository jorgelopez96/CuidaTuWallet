// src/hooks/useUser.js

import { useContext, useCallback } from 'react'
import { useUser as useClerkUser } from '@clerk/clerk-react'
import { UserContext, getInitials } from '../context/UserContext'
import { getUserProfile, upsertUserProfile } from '../services/userService'
import { useSupabase } from './useSupabase'
import { useToast } from './useToast'

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) throw new Error('useUser debe usarse dentro de UserProvider')

  const { user: clerkUser } = useClerkUser()
  const supabase = useSupabase()
  const { addToast } = useToast()
  const userId = clerkUser?.id

  // useCallback para que fetchProfile no cambie de referencia en cada render
  const fetchProfile = useCallback(async () => {
    if (!userId) return
    context.dispatch({ type: 'FETCH_START' })
    try {
      let profile = await getUserProfile(supabase, userId)
      // Primer login: todavía no hay fila en profiles (incomes/expenses/
      // credit_cards tienen FK a profiles, así que la necesitamos antes
      // de que el usuario pueda cargar cualquier dato).
      if (!profile) {
        profile = await upsertUserProfile(supabase, userId, {
          name: clerkUser.fullName || clerkUser.primaryEmailAddress?.emailAddress?.split('@')[0] || 'Usuario',
          email: clerkUser.primaryEmailAddress?.emailAddress || '',
        })
      }
      context.dispatch({ type: 'FETCH_SUCCESS', payload: profile })
    } catch {
      context.dispatch({ type: 'FETCH_ERROR', payload: 'Error al cargar perfil' })
      addToast('Error al cargar perfil', 'error')
    }
  }, [userId, supabase, clerkUser])

  const updateProfile = async (data) => {
    if (!userId) return { success: false }
    try {
      const updated = await upsertUserProfile(supabase, userId, data)
      context.dispatch({ type: 'UPDATE_PROFILE', payload: updated })
      addToast('Perfil actualizado', 'success')
      return { success: true }
    } catch {
      addToast('Error al actualizar perfil', 'error')
      return { success: false }
    }
  }

  const initials = getInitials(context.profile?.name)
  const displayName = context.profile?.name?.split(' ')[0] || clerkUser?.firstName || 'Usuario'

  return { ...context, fetchProfile, updateProfile, initials, displayName }
}
