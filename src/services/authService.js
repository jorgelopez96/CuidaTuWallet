// src/services/authService.js
// Implementación completa en Etapa 2

import { auth } from '../config/firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'

export const registerUser = async (email, password) => {
  const { user } = await createUserWithEmailAndPassword(auth, email, password)
  return user
}

export const loginUser = async (email, password) => {
  const { user } = await signInWithEmailAndPassword(auth, email, password)
  return user
}

export const logoutUser = async () => {
  await signOut(auth)
}
