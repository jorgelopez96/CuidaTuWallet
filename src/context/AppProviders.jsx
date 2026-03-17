// src/context/AppProviders.jsx

import { ThemeProvider } from './ThemeContext'
import { AuthProvider } from './AuthContext'
import { UserProvider } from './UserContext'
import { IncomesProvider } from './IncomesContext'
import { ExpensesProvider } from './ExpensesContext'
import { CreditCardsProvider } from './CreditCardsContext'
import { ToastProvider } from './ToastContext'

const AppProviders = ({ children }) => (
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
)

export default AppProviders
