// src/services/creditCardsService.js

import { db } from '../config/firebase'
import {
  collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where,
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

export const deleteCard = async (id) => {
  await deleteDoc(doc(db, COLLECTIONS.CREDIT_CARDS, id))
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
