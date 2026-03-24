// src/components/layout/Sidebar.jsx

import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useUser } from '../../hooks/useUser'
import ThemeToggle from '../ui/ThemeToggle'
import Avatar from '../ui/Avatar'
import NavTooltip from '../ui/NavTooltip'
import logo from '../../assets/logo.png'

const NAV_ITEMS = [
  {
    to: '/dashboard', label: 'Dashboard',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  },
  {
    to: '/incomes', label: 'Ingresos',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
  },
  {
    to: '/expenses', label: 'Gastos',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  },
  {
    to: '/credit-cards', label: 'Tarjetas',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
  },
]

export const NavItems = ({ onItemClick }) => {
  const { logout } = useAuth()
  const { initials, displayName, profile, fetchProfile } = useUser()
  const navigate = useNavigate()

  useEffect(() => {
    if (!profile) fetchProfile()
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <>
      {/* Logo — clickeable al dashboard */}
      <Link
        to="/dashboard"
        onClick={onItemClick}
        className="flex items-center gap-3 px-2 mb-8 hover:opacity-80 transition-opacity"
      >
        <img src={logo} alt="CuidaTuWallet logo" className="w-9 h-9 rounded-xl object-cover shrink-0" />
        <span className="dark:text-white text-slate-800 font-bold text-lg tracking-tight">CuidaTuWallet</span>
      </Link>

      {/* Nav con tooltips */}
      <nav className="flex flex-col gap-1 flex-1 overflow-visible" aria-label="Navegación principal">
        {NAV_ITEMS.map((item) => (
          <NavTooltip key={item.to} route={item.to}>
            <NavLink
              to={item.to}
              onClick={onItemClick}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'dark:text-slate-400 text-slate-500 dark:hover:text-white hover:text-slate-900 dark:hover:bg-white/5 hover:bg-slate-100'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          </NavTooltip>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="border-t dark:border-white/10 border-slate-200 pt-4 mt-4 flex flex-col gap-3">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs dark:text-slate-400 text-slate-500">Tema</span>
          <ThemeToggle />
        </div>
        <NavLink
          to="/profile"
          onClick={onItemClick}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200
            ${isActive ? 'bg-indigo-600/10 dark:bg-indigo-600/20' : 'dark:hover:bg-white/5 hover:bg-slate-100'}`
          }
        >
          <Avatar initials={initials} name={profile?.name || ''} size="sm" />
          <div className="min-w-0">
            <p className="text-sm font-medium dark:text-white text-slate-900 truncate">{displayName}</p>
            <p className="text-xs dark:text-slate-500 text-slate-400">Ver perfil</p>
          </div>
        </NavLink>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium dark:text-slate-400 text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-all duration-200 w-full"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Cerrar sesión
        </button>
      </div>
    </>
  )
}

const Sidebar = () => (
  <aside className="hidden md:flex flex-col w-64 min-h-screen dark:bg-[#13102b] bg-white border-r dark:border-white/10 border-slate-200 px-4 py-6 shrink-0 transition-colors duration-300 overflow-visible">
    <NavItems />
  </aside>
)

export default Sidebar
