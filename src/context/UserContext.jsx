// src/context/UserContext.jsx

import { createContext, useReducer } from 'react'

export const UserContext = createContext(null)

const initialState = {
  profile: null,
  isLoading: false,
  error: null,
}

const userReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, isLoading: true, error: null }
    case 'FETCH_SUCCESS':
      return { ...state, profile: action.payload, isLoading: false }
    case 'FETCH_ERROR':
      return { ...state, error: action.payload, isLoading: false }
    case 'UPDATE_PROFILE':
      return { ...state, profile: { ...state.profile, ...action.payload } }
    case 'CLEAR_PROFILE':
      return initialState
    default:
      return state
  }
}

// Selector: obtener iniciales del nombre
export const getInitials = (name) => {
  if (!name) return '?'
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('')
}

export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState)
  return (
    <UserContext.Provider value={{ ...state, dispatch }}>
      {children}
    </UserContext.Provider>
  )
}
