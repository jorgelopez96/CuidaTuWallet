// src/config/env.js

const required = (key) => {
  const value = import.meta.env[key]
  if (!value) throw new Error(`[env] Variable de entorno faltante: ${key}`)
  return value
}

export const env = {
  clerk: {
    publishableKey: required('VITE_CLERK_PUBLISHABLE_KEY'),
  },
  supabase: {
    url: required('VITE_SUPABASE_URL'),
    publishableKey: required('VITE_SUPABASE_PUBLISHABLE_KEY'),
  },
}
