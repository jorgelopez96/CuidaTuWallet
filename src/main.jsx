// src/main.jsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import AppProviders from './context/AppProviders'
import AppRouter from './router/AppRouter'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </ErrorBoundary>
  </React.StrictMode>
)
