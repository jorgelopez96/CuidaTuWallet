// src/context/CreditCardsContext.jsx

import { createContext, useReducer } from 'react'

export const CreditCardsContext = createContext(null)

const initialState = {
  cards: [],
  cardExpenses: [],
  isLoading: false,
  error: null,
}

const creditCardsReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, isLoading: true, error: null }
    case 'FETCH_SUCCESS_CARDS':
      return { ...state, cards: action.payload, isLoading: false }
    case 'FETCH_SUCCESS_EXPENSES':
      return { ...state, cardExpenses: action.payload, isLoading: false }
    case 'FETCH_ERROR':
      return { ...state, error: action.payload, isLoading: false }
    case 'ADD_CARD':
      return { ...state, cards: [...state.cards, action.payload] }
    case 'UPDATE_CARD':
      return {
        ...state,
        cards: state.cards.map((c) =>
          c.id === action.payload.id ? { ...c, ...action.payload } : c
        ),
      }
    case 'DELETE_CARD':
      return { ...state, cards: state.cards.filter((c) => c.id !== action.payload) }
    case 'ADD_CARD_EXPENSE':
      return { ...state, cardExpenses: [...state.cardExpenses, action.payload] }
    case 'UPDATE_CARD_EXPENSE':
      return {
        ...state,
        cardExpenses: state.cardExpenses.map((e) =>
          e.id === action.payload.id ? action.payload : e
        ),
      }
    case 'DELETE_CARD_EXPENSE':
      return {
        ...state,
        cardExpenses: state.cardExpenses.filter((e) => e.id !== action.payload),
      }
    default:
      return state
  }
}

export const getTotalCardDebt = (cardExpenses) =>
  cardExpenses.reduce((acc, e) => acc + (e.currentInstallmentAmount || 0), 0)

export const getCardExpensesByCard = (cardExpenses, cardId) =>
  cardExpenses.filter((e) => e.cardId === cardId)

export const CreditCardsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(creditCardsReducer, initialState)
  return (
    <CreditCardsContext.Provider value={{ ...state, dispatch }}>
      {children}
    </CreditCardsContext.Provider>
  )
}
