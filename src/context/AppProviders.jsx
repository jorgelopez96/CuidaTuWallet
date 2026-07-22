// src/context/AppProviders.jsx

import { ClerkProvider } from '@clerk/clerk-react'
import { ThemeProvider } from './ThemeContext'
import { AuthProvider } from './AuthContext'
import { UserProvider } from './UserContext'
import { IncomesProvider } from './IncomesContext'
import { ExpensesProvider } from './ExpensesContext'
import { CreditCardsProvider } from './CreditCardsContext'
import { ToastProvider } from './ToastContext'
import { env } from '../config/env'
import { clerkAppearance } from '../config/clerkAppearance'

const AppProviders = ({ children }) => (
  <ClerkProvider publishableKey={env.clerk.publishableKey} appearance={clerkAppearance} afterSignOutUrl="/login">
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <UserProvider>
            <IncomesProvider>
              <ExpensesProvider>
                <CreditCardsProvider>
                  {children}
                </CreditCardsProvider>
              </ExpensesProvider>
            </IncomesProvider>
          </UserProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  </ClerkProvider>
)

export default AppProviders
