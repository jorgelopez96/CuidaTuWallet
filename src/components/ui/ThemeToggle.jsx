// src/components/ui/ThemeToggle.jsx

import { useTheme } from '../../hooks/useTheme'

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      className="relative flex items-center w-16 h-8 rounded-full bg-indigo-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-transparent shrink-0"
    >
      <span className="absolute left-1.5 text-sm leading-none select-none">🌙</span>
      <span className="absolute right-1.5 text-sm leading-none select-none">☀️</span>
      <span
        className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300"
        style={{ transform: isDark ? 'translateX(4px)' : 'translateX(36px)' }}
      />
    </button>
  )
}

export default ThemeToggle
