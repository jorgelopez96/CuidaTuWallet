// src/components/ui/Avatar.jsx

const COLORS = [
  'bg-indigo-500',
  'bg-violet-500',
  'bg-pink-500',
  'bg-emerald-500',
  'bg-blue-500',
  'bg-orange-500',
]

const getColor = (name = '') => {
  const index = name.charCodeAt(0) % COLORS.length
  return COLORS[index]
}

const SIZES = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-16 h-16 text-xl',
  xl: 'w-24 h-24 text-3xl',
}

const Avatar = ({ initials = '?', name = '', size = 'md' }) => (
  <div
    className={`
      ${SIZES[size]} ${getColor(name)}
      rounded-full flex items-center justify-center
      font-bold text-white shadow-lg shrink-0 select-none
    `}
    aria-label={`Avatar de ${name}`}
  >
    {initials}
  </div>
)

export default Avatar
