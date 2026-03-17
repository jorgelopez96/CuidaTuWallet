// src/services/incomesService.js

import { db } from '../config/firebase'
import {
  collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where,
} from 'firebase/firestore'
import { COLLECTIONS } from '../config/constants'

export const getIncomes = async (userId) => {
  const q = query(collection(db, COLLECTIONS.INCOMES), where('userId', '==', userId))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const addIncome = async (data) => {
  const docRef = await addDoc(collection(db, COLLECTIONS.INCOMES), data)
  return { id: docRef.id, ...data }
}

export const updateIncome = async (id, data) => {
  await updateDoc(doc(db, COLLECTIONS.INCOMES, id), data)
  return { id, ...data }
}

export const archiveIncome = async (id) => {
  await updateDoc(doc(db, COLLECTIONS.INCOMES, id), { isArchived: true })
  return id
}

export const deleteIncome = async (id) => {
  await deleteDoc(doc(db, COLLECTIONS.INCOMES, id))
  return id
}
