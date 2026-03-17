// src/router/PrivateRoute.jsx

import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Spinner from '../components/ui/Spinner'
import SessionExpiredModal from '../components/ui/SessionExpiredModal'

const PrivateRoute = () => {
  const { user, isLoading, sessionExpired } = useAuth()

  if (isLoading) return <Spinner />

  // Session expired: show modal over a blank page, don't redirect yet
  // The modal itself handles the redirect on button press
  if (sessionExpired) return <SessionExpiredModal />

  if (!user) return <Navigate to="/login" replace />

  return (
    <>
      <Outlet />
      <SessionExpiredModal />
    </>
  )
}

export default PrivateRoute
