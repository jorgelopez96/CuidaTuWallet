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
        33%       { transform: translateY(-40px) translateX(20px) scale(1.05); }
        66%       { transform: translateY(20px) translateX(-15px) scale(0.97); }
      }
      @keyframes float2 {
        0%, 100% { transform: translateY(0px) translateX(0px) scale(1); }
        40%       { transform: translateY(30px) translateX(-25px) scale(1.08); }
        70%       { transform: translateY(-20px) translateX(10px) scale(0.95); }
      }
      @keyframes float3 {
        0%, 100% { transform: translateY(0px) scale(1); }
        50%       { transform: translateY(-30px) scale(1.1); }
      }
      .animated-bg {
        background: linear-gradient(
          135deg,
          #0f0c24 0%,
          #1a1040 20%,
          #0d1b4b 40%,
          #1e0a3c 60%,
          #0f0c24 80%,
          #16103a 100%
        );
        background-size: 400% 400%;
        animation: gradientShift 12s ease infinite;
      }
      .blob-1 { animation: float1 9s ease-in-out infinite; }
      .blob-2 { animation: float2 13s ease-in-out infinite; }
      .blob-3 { animation: float3 7s ease-in-out infinite; }
    `}</style>

    <div className="animated-bg fixed inset-0 -z-10" />

    {/* Blobs */}
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="blob-1 absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-indigo-700/25 blur-3xl" />
      <div className="blob-2 absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full bg-violet-700/20 blur-3xl" />
      <div className="blob-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-blue-700/15 blur-3xl" />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  </>
)

export default AnimatedBackground
