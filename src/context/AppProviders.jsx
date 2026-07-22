// src/context/AppProviders.jsx

import { ClerkProvider } from '@clerk/clerk-react'
import { ThemeProvider } from './ThemeContext'
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
    </ThemeProvider>
  </ClerkProvider>
)

export default AppProviders
