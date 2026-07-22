// src/config/supabase.js

import { createClient } from '@supabase/supabase-js'
import { env } from './env'

// El cliente de Supabase necesita el token de sesión de Clerk en cada
// request (integración nativa Third-Party Auth, sin JWT template). Como
// Clerk solo expone `session.getToken()` dentro de React, el cliente no
// puede ser un singleton creado a nivel de módulo como lo era `firebase.js`:
// se construye con esta factory dentro de un hook que reciba `getToken`
// desde `useAuth()` de Clerk.
export const createClerkSupabaseClient = (getToken) =>
  createClient(env.supabase.url, env.supabase.publishableKey, {
    accessToken: () => getToken(),
  })
