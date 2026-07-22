// src/config/env.js

const required = (key) => {
  const value = import.meta.env[key]
  if (!value) throw new Error(`[env] Variable de entorno faltante: ${key}`)
  return value
}

export const env = {
  firebase: {
    apiKey: required('VITE_FIREBASE_API_KEY'),
    authDomain: required('VITE_FIREBASE_AUTH_DOMAIN'),
    projectId: required('VITE_FIREBASE_PROJECT_ID'),
    storageBucket: required('VITE_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: required('VITE_FIREBASE_MESSAGING_SENDER_ID'),
    appId: required('VITE_FIREBASE_APP_ID'),
  },
  clerk: {
    publishableKey: required('VITE_CLERK_PUBLISHABLE_KEY'),
  },
  supabase: {
    url: required('VITE_SUPABASE_URL'),
    anonKey: required('VITE_SUPABASE_ANON_KEY'),
  },
}
