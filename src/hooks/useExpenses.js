// src/hooks/useExpenses.js

import { useContext, useCallback } from 'react'
import { useAuth } from '@clerk/clerk-react'
import {
  ExpensesContext,
  getTotalExpenses,
  getExpensesByCategory,
} from '../context/ExpensesContext'
import {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
} from '../services/expensesService'
import { useSupabase } from './useSupabase'
import { useToast } from './useToast'

export const useExpenses = () => {
  const context = useContext(ExpensesContext)
  if (!context) throw new Error('useExpenses debe usarse dentro de ExpensesProvider')

  const { userId } = useAuth()
  const supabase = useSupabase()
  const { addToast } = useToast()

  const fetchExpenses = useCallback(async () => {
    if (!userId) return
    context.dispatch({ type: 'FETCH_START' })
    try {
      const data = await getExpenses(supabase, userId)
      context.dispatch({ type: 'FETCH_SUCCESS', payload: data })
    } catch {
      context.dispatch({ type: 'FETCH_ERROR', payload: 'Error al cargar gastos' })
      addToast('Error al cargar gastos', 'error')
    }
  }, [userId, supabase])

  const createExpense = async (formData) => {
    try {
      const data = { ...formData, userId }
      const newExpense = await addExpense(supabase, data)
      context.dispatch({ type: 'ADD_EXPENSE', payload: newExpense })
      addToast('Gasto registrado', 'success')
      return { success: true }
    } catch {
      addToast('Error al registrar gasto', 'error')
      return { success: false }
    }
  }

  const editExpense = async (id, formData) => {
    try {
      const updated = await updateExpense(supabase, id, formData)
      context.dispatch({ type: 'UPDATE_EXPENSE', payload: updated })
      addToast('Gasto actualizado', 'success')
      return { success: true }
    } catch {
      addToast('Error al actualizar gasto', 'error')
      return { success: false }
    }
  }

  const removeExpense = async (id) => {
    try {
      await deleteExpense(supabase, id)
      context.dispatch({ type: 'DELETE_EXPENSE', payload: id })
      addToast('Gasto eliminado', 'success')
    } catch {
      addToast('Error al eliminar gasto', 'error')
    }
  }

  const totalExpenses = getTotalExpenses(context.expenses)
  const expensesByCategory = getExpensesByCategory(context.expenses)

  return {
    ...context,
    totalExpenses,
    expensesByCategory,
    fetchExpenses,
    createExpense,
    editExpense,
    removeExpense,
  }
}
