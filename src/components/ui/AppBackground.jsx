// src/components/ui/AppBackground.jsx

const AppBackground = () => (
  <>
    <style>{`
      @keyframes appBlob1 {
        0%, 100% { transform: translate(0px, 0px) scale(1); }
        33%       { transform: translate(30px, -20px) scale(1.04); }
        66%       { transform: translate(-15px, 15px) scale(0.97); }
      }
      @keyframes appBlob2 {
        0%, 100% { transform: translate(0px, 0px) scale(1); }
        40%       { transform: translate(-25px, 20px) scale(1.05); }
        70%       { transform: translate(20px, -10px) scale(0.96); }
      }
      @keyframes appBlob3 {
        0%, 100% { transform: translate(0px, 0px) scale(1); }
        50%       { transform: translate(10px, -25px) scale(1.03); }
      }
      @keyframes subtleShift {
        0%   { background-position: 0% 0%; }
        50%  { background-position: 100% 100%; }
        100% { background-position: 0% 0%; }
      }
      .app-bg-gradient {
        background: linear-gradient(135deg, #0f0c24 0%, #13102b 50%, #0f0c24 100%);
        background-size: 200% 200%;
        animation: subtleShift 20s ease infinite;
      }
      html:not(.dark) .app-bg-gradient {
        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #f8fafc 100%);
        background-size: 200% 200%;
        animation: subtleShift 20s ease infinite;
      }
      .app-blob-1 { animation: appBlob1 18s ease-in-out infinite; }
      .app-blob-2 { animation: appBlob2 24s ease-in-out infinite; }
      .app-blob-3 { animation: appBlob3 14s ease-in-out infinite; }
    `}</style>

    {/* Base gradient */}
    <div className="app-bg-gradient fixed inset-0 -z-20" />

    {/* Subtle blobs — much lower opacity than login */}
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="app-blob-1 absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-indigo-600/8 dark:bg-indigo-600/10 blur-3xl" />
      <div className="app-blob-2 absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-violet-600/6 dark:bg-violet-600/8 blur-3xl" />
      <div className="app-blob-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-blue-600/5 dark:bg-blue-600/6 blur-3xl" />
    </div>
  </>
)

export default AppBackground
