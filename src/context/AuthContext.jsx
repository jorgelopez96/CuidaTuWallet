// src/context/AuthContext.jsx

import { createContext, useEffect, useReducer, useRef } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../config/firebase'

export const AuthContext = createContext(null)

const SESSION_TIMEOUT_MS = 30 * 60 * 1000
const LAST_ACTIVE_KEY = 'ctw-last-active'

const initialState = {
  user: null,
  isLoading: true,
  error: null,
  sessionExpired: false,
}

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, isLoading: false, error: null, sessionExpired: false }
    case 'CLEAR_USER':
      return { ...state, user: null, isLoading: false, sessionExpired: false }
    case 'SESSION_EXPIRED':
      return { ...state, user: null, isLoading: false, sessionExpired: true }
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false }
    default:
      return state
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)
  const timeoutRef = useRef(null)

  const clearTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = null
  }

  const resetTimer = () => {
    localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString())
    clearTimer()
    timeoutRef.current = setTimeout(() => {
      auth.signOut()
      localStorage.removeItem(LAST_ACTIVE_KEY)
      dispatch({ type: 'SESSION_EXPIRED' })
    }, SESSION_TIMEOUT_MS)
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const lastActive = localStorage.getItem(LAST_ACTIVE_KEY)
        if (lastActive) {
          const elapsed = Date.now() - parseInt(lastActive, 10)
          if (elapsed > SESSION_TIMEOUT_MS) {
            auth.signOut()
            localStorage.removeItem(LAST_ACTIVE_KEY)
            dispatch({ type: 'SESSION_EXPIRED' })
            clearTimer()
            return
          }
        }
        dispatch({ type: 'SET_USER', payload: user })
        resetTimer()
      } else {
        // Limpiar localStorage al cerrar sesión para evitar estados bloqueados
        localStorage.removeItem(LAST_ACTIVE_KEY)
        dispatch({ type: 'CLEAR_USER' })
        clearTimer()
      }
    })

    return () => {
      unsubscribe()
      clearTimer()
    }
  }, [])

  useEffect(() => {
    if (!state.user) return
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll']
    const handleActivity = () => resetTimer()
    events.forEach((e) => window.addEventListener(e, handleActivity, { passive: true }))
    return () => events.forEach((e) => window.removeEventListener(e, handleActivity))
  }, [state.user])

  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AuthContext.Provider>
  )
}
