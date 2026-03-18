// src/components/ui/CloseButton.jsx

const CloseButton = ({ onClick, label = 'Eliminar', size = 'sm', variant = 'ghost' }) => {
  const sizes = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
  }

  const variants = {
    ghost: `dark:text-slate-500 text-slate-400
            dark:hover:text-red-400 hover:text-red-500
            dark:hover:bg-red-500/10 hover:bg-red-50`,
    solid: `dark:text-slate-300 text-slate-600
            dark:hover:text-white hover:text-slate-900
            dark:hover:bg-white/10 hover:bg-slate-100`,
  }

  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`
        ${sizes[size]} ${variants[variant]}
        rounded-lg flex items-center justify-center
        transition-all duration-200 shrink-0
      `}
    >
      <svg
        className="w-3.5 h-3.5"
        fill="none"
        viewBox="0 0 14 14"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
      >
        <line x1="1" y1="1" x2="13" y2="13" />
        <line x1="13" y1="1" x2="1" y2="13" />
      </svg>
    </button>
  )
}

export default CloseButton
