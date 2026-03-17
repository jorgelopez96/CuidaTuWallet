// src/components/ui/Select.jsx

const Select = ({ label, id, error, children, className = '', ...props }) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label htmlFor={id} className="text-sm font-medium dark:text-slate-300 text-slate-700">
        {label}
      </label>
    )}
    <select
      id={id}
      className={`
        w-full dark:bg-[#1e1b4b] bg-white border rounded-xl px-4 py-2.5 text-sm
        dark:text-white text-slate-900
        outline-none transition-all duration-200
        focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
        ${error ? 'border-red-400' : 'dark:border-white/10 border-slate-300'}
        ${className}
      `}
      {...props}
    >
      {children}
    </select>
    {error && <span className="text-xs text-red-400">{error}</span>}
  </div>
)

export default Select
