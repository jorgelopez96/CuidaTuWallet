// src/components/ui/Card.jsx

const Card = ({ children, className = '' }) => (
  <div className={`dark:bg-white/5 bg-white border dark:border-white/10 border-slate-200 rounded-2xl p-5 backdrop-blur-sm shadow-sm dark:shadow-black/10 transition-colors duration-300 ${className}`}>
    {children}
  </div>
)

export default Card
