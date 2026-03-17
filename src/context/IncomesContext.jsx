// src/context/IncomesContext.jsx

import { createContext, useReducer } from 'react'

export const IncomesContext = createContext(null)

const initialState = {
  incomes: [],
  isLoading: false,
  error: null,
}

const incomesReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, isLoading: true, error: null }
    case 'FETCH_SUCCESS':
      return { ...state, incomes: action.payload, isLoading: false }
    case 'FETCH_ERROR':
      return { ...state, error: action.payload, isLoading: false }
    case 'ADD_INCOME':
      return { ...state, incomes: [...state.incomes, action.payload] }
    case 'UPDATE_INCOME':
      return {
        ...state,
        incomes: state.incomes.map((i) => i.id === action.payload.id ? action.payload : i),
      }
    case 'DELETE_INCOME':
      return { ...state, incomes: state.incomes.filter((i) => i.id !== action.payload) }
    default:
      return state
  }
}

// Activos: no archivados
export const getActiveIncomes = (incomes) =>
  incomes.filter((i) => !i.isArchived)

// Archivados: historial
export const getArchivedIncomes = (incomes) =>
  incomes.filter((i) => i.isArchived)

// Total solo de activos
export const getTotalIncomes = (incomes) =>
  getActiveIncomes(incomes).reduce((acc, i) => acc + i.amount, 0)

// Historial agrupado por mes
export const getIncomesByMonth = (incomes) =>
  incomes.reduce((acc, income) => {
    const key = income.month || income.createdAt?.slice(0, 7) || 'Sin fecha'
    if (!acc[key]) acc[key] = []
    acc[key].push(income)
    return acc
  }, {})

export const IncomesProvider = ({ children }) => {
  const [state, dispatch] = useReducer(incomesReducer, initialState)
  return (
    <IncomesContext.Provider value={{ ...state, dispatch }}>
      {children}
    </IncomesContext.Provider>
  )
}
