// src/context/ToastContext.jsx

import { createContext, useReducer, useCallback } from 'react'

export const ToastContext = createContext(null)

const toastReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TOAST':
      return [...state, action.payload]
    case 'REMOVE_TOAST':
      return state.filter((t) => t.id !== action.payload)
    default:
      return state
  }
}

export const ToastProvider = ({ children }) => {
  const [toasts, dispatch] = useReducer(toastReducer, [])

  const addToast = useCallback((message, type = 'success') => {
    const id = crypto.randomUUID()
    dispatch({ type: 'ADD_TOAST', payload: { id, message, type } })
    setTimeout(() => dispatch({ type: 'REMOVE_TOAST', payload: id }), 3500)
  }, [])

  const removeToast = useCallback((id) => {
    dispatch({ type: 'REMOVE_TOAST', payload: id })
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  )
}
