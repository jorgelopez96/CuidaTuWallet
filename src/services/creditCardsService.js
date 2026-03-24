// src/services/creditCardsService.js

import { db } from '../config/firebase'
import {
  collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, writeBatch,
} from 'firebase/firestore'
import { COLLECTIONS } from '../config/constants'

export const getCards = async (userId) => {
  const q = query(collection(db, COLLECTIONS.CREDIT_CARDS), where('userId', '==', userId))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const addCard = async (data) => {
  const docRef = await addDoc(collection(db, COLLECTIONS.CREDIT_CARDS), data)
  return { id: docRef.id, ...data }
}

export const updateCardData = async (id, data) => {
  await updateDoc(doc(db, COLLECTIONS.CREDIT_CARDS, id), data)
  return { id, ...data }
}

// Elimina la tarjeta Y todos sus gastos en una sola operación batch
export const deleteCard = async (id) => {
  const batch = writeBatch(db)

  // Eliminar la tarjeta
  batch.delete(doc(db, COLLECTIONS.CREDIT_CARDS, id))

  // Buscar y eliminar todos los gastos de esa tarjeta
  const expensesQuery = query(
    collection(db, COLLECTIONS.CARD_EXPENSES),
    where('cardId', '==', id)
  )
  const expensesSnapshot = await getDocs(expensesQuery)
  expensesSnapshot.docs.forEach((d) => batch.delete(d.ref))

  await batch.commit()
  return id
}

export const getCardExpenses = async (userId) => {
  const q = query(collection(db, COLLECTIONS.CARD_EXPENSES), where('userId', '==', userId))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const addCardExpense = async (data) => {
  const docRef = await addDoc(collection(db, COLLECTIONS.CARD_EXPENSES), data)
  return { id: docRef.id, ...data }
}

export const updateCardExpense = async (id, data) => {
  await updateDoc(doc(db, COLLECTIONS.CARD_EXPENSES, id), data)
  return { id, ...data }
}

export const deleteCardExpense = async (id) => {
  await deleteDoc(doc(db, COLLECTIONS.CARD_EXPENSES, id))
  return id
}
