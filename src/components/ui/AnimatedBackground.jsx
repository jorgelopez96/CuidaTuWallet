// src/components/ui/AnimatedBackground.jsx

const AnimatedBackground = () => (
  <>
    <style>{`
      @keyframes gradientShift {
        0%   { background-position: 0% 50%; }
        50%  { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      @keyframes float1 {
        0%, 100% { transform: translateY(0px) translateX(0px) scale(1); }
        33%       { transform: translateY(-60px) translateX(30px) scale(1.08); }
        66%       { transform: translateY(30px) translateX(-20px) scale(0.95); }
      }
      @keyframes float2 {
        0%, 100% { transform: translateY(0px) translateX(0px) scale(1); }
        40%       { transform: translateY(50px) translateX(-35px) scale(1.1); }
        70%       { transform: translateY(-30px) translateX(15px) scale(0.93); }
      }
      @keyframes float3 {
        0%, 100% { transform: translateY(0px) scale(1); }
        50%       { transform: translateY(-40px) scale(1.12); }
      }
      @keyframes pulse-ring {
        0%, 100% { opacity: 0.15; transform: scale(1); }
        50%       { opacity: 0.35; transform: scale(1.04); }
      }
      .login-bg {
        background: linear-gradient(
          135deg,
          #0a0820 0%,
          #160d40 20%,
          #0d1550 40%,
          #1a0838 60%,
          #0a0820 80%,
          #120e38 100%
        );
        background-size: 400% 400%;
        animation: gradientShift 10s ease infinite;
      }
      .blob-1 { animation: float1 8s ease-in-out infinite; }
      .blob-2 { animation: float2 11s ease-in-out infinite; }
      .blob-3 { animation: float3 6s ease-in-out infinite; }
      .pulse-ring { animation: pulse-ring 4s ease-in-out infinite; }
    `}</style>

    <div className="login-bg fixed inset-0 -z-10" />

    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Main blobs — más grandes y más opacas */}
      <div className="blob-1 absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-indigo-700/40 blur-3xl" />
      <div className="blob-2 absolute -bottom-40 -right-40 w-[700px] h-[700px] rounded-full bg-violet-700/35 blur-3xl" />
      <div className="blob-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-blue-700/25 blur-3xl" />

      {/* Accent blobs — detalles extra */}
      <div className="blob-2 absolute top-20 right-20 w-[300px] h-[300px] rounded-full bg-purple-600/20 blur-2xl" />
      <div className="blob-1 absolute bottom-20 left-20 w-[280px] h-[280px] rounded-full bg-indigo-500/20 blur-2xl" />

      {/* Pulsing rings para profundidad -->*/}
      <div className="pulse-ring absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-indigo-500/20" />
      <div className="pulse-ring absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-violet-500/15" style={{ animationDelay: '2s' }} />

      {/* Grid overlay sutil */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  </>
)

export default AnimatedBackground
