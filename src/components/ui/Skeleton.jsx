// src/components/ui/Skeleton.jsx

const Skeleton = ({ className = '' }) => (
  <div
    className={`animate-pulse bg-white/10 rounded-xl ${className}`}
    aria-hidden="true"
  />
)

export default Skeleton
