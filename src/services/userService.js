// src/services/userService.js

import { db } from '../config/firebase'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { COLLECTIONS } from '../config/constants'

export const createUserProfile = async (uid, data) => {
  await setDoc(doc(db, COLLECTIONS.USERS, uid), {
    ...data,
    createdAt: new Date().toISOString(),
  })
}

export const getUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, COLLECTIONS.USERS, uid))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export const updateUserProfile = async (uid, data) => {
  await updateDoc(doc(db, COLLECTIONS.USERS, uid), {
    ...data,
    updatedAt: new Date().toISOString(),
  })
  return data
}
