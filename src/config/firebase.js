// src/config/firebase.js

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { env } from './env'

const app = initializeApp(env.firebase)

export const auth = getAuth(app)
export const db = getFirestore(app)
