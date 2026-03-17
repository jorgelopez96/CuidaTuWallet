// src/context/ExpensesContext.jsx

import { createContext, useReducer } from 'react'

export const ExpensesContext = createContext(null)

const initialState = {
  expenses: [],
  isLoading: false,
  error: null,
}

const expensesReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, isLoading: true, error: null }
    case 'FETCH_SUCCESS':
      return { ...state, expenses: action.payload, isLoading: false }
    case 'FETCH_ERROR':
      return { ...state, error: action.payload, isLoading: false }
    case 'ADD_EXPENSE':
      return { ...state, expenses: [...state.expenses, action.payload] }
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map((e) =>
          e.id === action.payload.id ? action.payload : e
        ),
      }
    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter((e) => e.id !== action.payload),
      }
    default:
      return state
  }
}

export const getTotalExpenses = (expenses) =>
  expenses.reduce((acc, expense) => acc + expense.amount, 0)

export const getExpensesByCategory = (expenses) =>
  expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount
    return acc
  }, {})

export const ExpensesProvider = ({ children }) => {
  const [state, dispatch] = useReducer(expensesReducer, initialState)

  return (
    <ExpensesContext.Provider value={{ ...state, dispatch }}>
      {children}
    </ExpensesContext.Provider>
  )
}
