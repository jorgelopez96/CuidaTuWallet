// src/router/AppRouter.jsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import PrivateRoute from './PrivateRoute'
import AppLayout from '../components/layout/AppLayout'

import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import DashboardPage from '../pages/DashboardPage'
import ExpensesPage from '../pages/ExpensesPage'
import IncomesPage from '../pages/IncomesPage'
import CreditCardsPage from '../pages/CreditCardsPage'
import CardDetailPage from '../pages/CardDetailPage'
import ProfilePage from '../pages/ProfilePage'

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      {/* Públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protegidas con layout */}
      <Route element={<PrivateRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/incomes" element={<IncomesPage />} />
          <Route path="/credit-cards" element={<CreditCardsPage />} />
          <Route path="/credit-cards/:cardId" element={<CardDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </BrowserRouter>
)

export default AppRouter
