// src/services/expensesService.js
// Implementación completa en Etapa 2

import { db } from '../config/firebase'
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from 'firebase/firestore'
import { COLLECTIONS } from '../config/constants'

export const getExpenses = async (userId) => {
  const q = query(collection(db, COLLECTIONS.EXPENSES), where('userId', '==', userId))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const addExpense = async (data) => {
  const docRef = await addDoc(collection(db, COLLECTIONS.EXPENSES), data)
  return { id: docRef.id, ...data }
}

export const updateExpense = async (id, data) => {
  await updateDoc(doc(db, COLLECTIONS.EXPENSES, id), data)
  return { id, ...data }
}

export const deleteExpense = async (id) => {
  await deleteDoc(doc(db, COLLECTIONS.EXPENSES, id))
  return id
}
