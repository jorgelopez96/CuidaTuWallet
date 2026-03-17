// src/hooks/useCreditCards.js

import { useContext, useCallback } from 'react'
import {
  CreditCardsContext,
  getTotalCardDebt,
  getCardExpensesByCard,
} from '../context/CreditCardsContext'
import {
  getCards, addCard, deleteCard, updateCardData,
  getCardExpenses, addCardExpense, updateCardExpense, deleteCardExpense,
} from '../services/creditCardsService'
import { useAuth } from './useAuth'
import { useToast } from './useToast'

export const useCreditCards = () => {
  const context = useContext(CreditCardsContext)
  if (!context) throw new Error('useCreditCards debe usarse dentro de CreditCardsProvider')

  const { user } = useAuth()
  const { addToast } = useToast()

  const fetchCards = useCallback(async () => {
    if (!user) return
    context.dispatch({ type: 'FETCH_START' })
    try {
      const data = await getCards(user.uid)
      context.dispatch({ type: 'FETCH_SUCCESS_CARDS', payload: data })
    } catch {
      context.dispatch({ type: 'FETCH_ERROR', payload: 'Error al cargar tarjetas' })
      addToast('Error al cargar tarjetas', 'error')
    }
  }, [user])

  const fetchCardExpenses = useCallback(async () => {
    if (!user) return
    try {
      const data = await getCardExpenses(user.uid)
      context.dispatch({ type: 'FETCH_SUCCESS_EXPENSES', payload: data })
    } catch {
      addToast('Error al cargar gastos de tarjeta', 'error')
    }
  }, [user])

  const createCard = async (formData) => {
    try {
      const data = { ...formData, userId: user.uid, createdAt: new Date().toISOString() }
      const newCard = await addCard(data)
      context.dispatch({ type: 'ADD_CARD', payload: newCard })
      addToast('Tarjeta agregada', 'success')
      return { success: true }
    } catch {
      addToast('Error al agregar tarjeta', 'error')
      return { success: false }
    }
  }

  const updateCard = async (id, data) => {
    try {
      const updated = await updateCardData(id, data)
      context.dispatch({ type: 'UPDATE_CARD', payload: updated })
      addToast('Tarjeta actualizada', 'success')
      return { success: true }
    } catch {
      addToast('Error al actualizar tarjeta', 'error')
      return { success: false }
    }
  }

  const removeCard = async (id) => {
    try {
      await deleteCard(id)
      context.dispatch({ type: 'DELETE_CARD', payload: id })
      addToast('Tarjeta eliminada', 'success')
    } catch {
      addToast('Error al eliminar tarjeta', 'error')
    }
  }

  const createCardExpense = async (formData) => {
    try {
      const data = { ...formData, userId: user.uid, createdAt: new Date().toISOString() }
      const newExpense = await addCardExpense(data)
      context.dispatch({ type: 'ADD_CARD_EXPENSE', payload: newExpense })
      addToast('Gasto de tarjeta registrado', 'success')
      return { success: true }
    } catch {
      addToast('Error al registrar gasto de tarjeta', 'error')
      return { success: false }
    }
  }

  const editCardExpense = async (id, formData) => {
    try {
      const updated = await updateCardExpense(id, formData)
      context.dispatch({ type: 'UPDATE_CARD_EXPENSE', payload: updated })
      addToast('Gasto actualizado', 'success')
      return { success: true }
    } catch {
      addToast('Error al actualizar gasto', 'error')
      return { success: false }
    }
  }

  const removeCardExpense = async (id) => {
    try {
      await deleteCardExpense(id)
      context.dispatch({ type: 'DELETE_CARD_EXPENSE', payload: id })
      addToast('Gasto eliminado', 'success')
    } catch {
      addToast('Error al eliminar gasto', 'error')
    }
  }

  const getExpensesByCard = (cardId) => getCardExpensesByCard(context.cardExpenses, cardId)
  const totalCardDebt = getTotalCardDebt(context.cardExpenses)

  return {
    ...context,
    totalCardDebt,
    fetchCards,
    fetchCardExpenses,
    createCard,
    updateCard,
    removeCard,
    createCardExpense,
    editCardExpense,
    removeCardExpense,
    getExpensesByCard,
  }
}
