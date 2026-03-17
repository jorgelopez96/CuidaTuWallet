// src/components/ui/Spinner.jsx

const Spinner = ({ size = 'md' }) => {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-4',
    lg: 'h-12 w-12 border-4',
  }

  return (
    <div className="flex items-center justify-center w-full h-full min-h-[100px]">
      <div
        className={`${sizes[size]} animate-spin rounded-full border-white/20 border-t-indigo-500`}
        role="status"
        aria-label="Cargando"
      />
    </div>
  )
}

export default Spinner
