// src/hooks/useSupabase.js

import { useMemo } from 'react'
import { useSession } from '@clerk/clerk-react'
import { createClerkSupabaseClient } from '../config/supabase'

export const useSupabase = () => {
  const { session } = useSession()

  return useMemo(
    () => createClerkSupabaseClient(() => session?.getToken() ?? Promise.resolve(null)),
    [session]
  )
}
