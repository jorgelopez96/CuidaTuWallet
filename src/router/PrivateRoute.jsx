// src/router/PrivateRoute.jsx

import { useState, useEffect, useRef, useCallback } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import Spinner from '../components/ui/Spinner'
import SessionExpiredModal from '../components/ui/SessionExpiredModal'

const SESSION_TIMEOUT_MS = 30 * 60 * 1000
const LAST_ACTIVE_KEY = 'ctw-last-active'

const PrivateRoute = () => {
  const { isLoaded, isSignedIn, signOut } = useAuth()
  const [sessionExpired, setSessionExpired] = useState(false)
  const timeoutRef = useRef(null)

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = null
  }, [])

  const expireSession = useCallback(() => {
    localStorage.removeItem(LAST_ACTIVE_KEY)
    clearTimer()
    signOut().then(() => setSessionExpired(true))
  }, [clearTimer, signOut])

  const resetTimer = useCallback(() => {
    localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString())
    clearTimer()
    timeoutRef.current = setTimeout(expireSession, SESSION_TIMEOUT_MS)
  }, [clearTimer, expireSession])

  useEffect(() => {
    if (!isSignedIn) return

    const lastActive = localStorage.getItem(LAST_ACTIVE_KEY)
    if (lastActive && Date.now() - parseInt(lastActive, 10) > SESSION_TIMEOUT_MS) {
      expireSession()
      return
    }

    resetTimer()
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll']
    const handleActivity = () => resetTimer()
    events.forEach((e) => window.addEventListener(e, handleActivity, { passive: true }))
    return () => {
      events.forEach((e) => window.removeEventListener(e, handleActivity))
      clearTimer()
    }
  }, [isSignedIn, resetTimer, expireSession, clearTimer])

  if (!isLoaded) return <Spinner />

  if (sessionExpired) {
    return <SessionExpiredModal onGoToLogin={() => setSessionExpired(false)} />
  }

  if (!isSignedIn) return <Navigate to="/login" replace />

  return <Outlet />
}

export default PrivateRoute
