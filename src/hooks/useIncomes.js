// src/hooks/useIncomes.js

import { useContext, useCallback } from 'react'
import { useAuth } from '@clerk/clerk-react'
import {
  IncomesContext,
  getTotalIncomes,
  getActiveIncomes,
  getArchivedIncomes,
  getIncomesByMonth,
} from '../context/IncomesContext'
import {
  getIncomes, addIncome, updateIncome, deleteIncome, archiveIncome,
} from '../services/incomesService'
import { useSupabase } from './useSupabase'
import { useToast } from './useToast'

// Chequea si un ingreso tipo sueldo venció (mes de vencimiento < mes actual)
const isExpiredSalary = (income) => {
  if (income.type !== 'salary' || !income.expiresMonth) return false
  const now = new Date().toISOString().slice(0, 7)
  return income.expiresMonth < now
}

export const useIncomes = () => {
  const context = useContext(IncomesContext)
  if (!context) throw new Error('useIncomes debe usarse dentro de IncomesProvider')

  const { userId } = useAuth()
  const supabase = useSupabase()
  const { addToast } = useToast()

  const fetchIncomes = useCallback(async () => {
    if (!userId) return
    context.dispatch({ type: 'FETCH_START' })
    try {
      const data = await getIncomes(supabase, userId)

      // Auto-archivar sueldos vencidos
      const toArchive = data.filter((i) => !i.isArchived && isExpiredSalary(i))
      await Promise.all(toArchive.map((i) => archiveIncome(supabase, i.id)))

      const updated = data.map((i) =>
        toArchive.find((a) => a.id === i.id) ? { ...i, isArchived: true } : i
      )

      context.dispatch({ type: 'FETCH_SUCCESS', payload: updated })

      if (toArchive.length > 0) {
        addToast(`${toArchive.length} ingreso(s) archivado(s) automáticamente`, 'info')
      }
    } catch {
      context.dispatch({ type: 'FETCH_ERROR', payload: 'Error al cargar ingresos' })
      addToast('Error al cargar ingresos', 'error')
    }
  }, [userId, supabase])

  const createIncome = async (formData) => {
    try {
      const data = { ...formData, userId, isArchived: false }
      const newIncome = await addIncome(supabase, data)
      context.dispatch({ type: 'ADD_INCOME', payload: newIncome })
      addToast('Ingreso registrado', 'success')
      return { success: true }
    } catch {
      addToast('Error al registrar ingreso', 'error')
      return { success: false }
    }
  }

  const editIncome = async (id, formData) => {
    try {
      const updated = await updateIncome(supabase, id, formData)
      context.dispatch({ type: 'UPDATE_INCOME', payload: updated })
      addToast('Ingreso actualizado', 'success')
      return { success: true }
    } catch {
      addToast('Error al actualizar ingreso', 'error')
      return { success: false }
    }
  }

  const removeIncome = async (id) => {
    try {
      await deleteIncome(supabase, id)
      context.dispatch({ type: 'DELETE_INCOME', payload: id })
      addToast('Ingreso eliminado', 'success')
    } catch {
      addToast('Error al eliminar ingreso', 'error')
    }
  }

  const totalIncomes = getTotalIncomes(context.incomes)
  const activeIncomes = getActiveIncomes(context.incomes)
  const archivedIncomes = getArchivedIncomes(context.incomes)
  const incomesByMonth = getIncomesByMonth(context.incomes)

  return {
    ...context,
    totalIncomes,
    activeIncomes,
    archivedIncomes,
    incomesByMonth,
    fetchIncomes,
    createIncome,
    editIncome,
    removeIncome,
  }
}
