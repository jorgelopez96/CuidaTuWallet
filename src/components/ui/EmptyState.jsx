// src/components/ui/EmptyState.jsx

const EmptyState = ({ icon = '📭', title = 'Sin datos', description = '', action = null }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <span className="text-5xl mb-4">{icon}</span>
    <p className="text-lg font-semibold dark:text-white text-slate-800 mb-1">{title}</p>
    {description && <p className="text-sm dark:text-slate-400 text-slate-500 mb-6 max-w-xs">{description}</p>}
    {action}
  </div>
)

export default EmptyState
