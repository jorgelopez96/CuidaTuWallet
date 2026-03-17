// src/hooks/useExpenses.js

import { useContext, useCallback } from 'react'
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
import { useAuth } from './useAuth'
import { useToast } from './useToast'

export const useExpenses = () => {
  const context = useContext(ExpensesContext)
  if (!context) throw new Error('useExpenses debe usarse dentro de ExpensesProvider')

  const { user } = useAuth()
  const { addToast } = useToast()

  const fetchExpenses = useCallback(async () => {
    if (!user) return
    context.dispatch({ type: 'FETCH_START' })
    try {
      const data = await getExpenses(user.uid)
      context.dispatch({ type: 'FETCH_SUCCESS', payload: data })
    } catch {
      context.dispatch({ type: 'FETCH_ERROR', payload: 'Error al cargar gastos' })
      addToast('Error al cargar gastos', 'error')
    }
  }, [user])

  const createExpense = async (formData) => {
    try {
      const data = { ...formData, userId: user.uid, createdAt: new Date().toISOString() }
      const newExpense = await addExpense(data)
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
      const updated = await updateExpense(id, formData)
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
      await deleteExpense(id)
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
