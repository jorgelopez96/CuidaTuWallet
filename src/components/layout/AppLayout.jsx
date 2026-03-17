// src/components/layout/AppLayout.jsx

import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import MobileHeader from './MobileHeader'
import Toast from '../ui/Toast'
import AppBackground from '../ui/AppBackground'

const AppLayout = () => (
  <div className="flex min-h-screen dark:bg-transparent bg-transparent dark:text-white text-slate-900 relative">
    <AppBackground />
    <Sidebar />
    <div className="flex flex-col flex-1 min-w-0">
      <MobileHeader />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
    <Toast />
  </div>
)

export default AppLayout
