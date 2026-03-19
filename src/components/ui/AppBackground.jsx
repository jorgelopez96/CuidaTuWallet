// src/components/ui/AppBackground.jsx

const AppBackground = () => (
  <>
    <style>{`
      @keyframes appBlob1 {
        0%, 100% { transform: translate(0px, 0px) scale(1); }
        33%       { transform: translate(40px, -30px) scale(1.06); }
        66%       { transform: translate(-20px, 20px) scale(0.96); }
      }
      @keyframes appBlob2 {
        0%, 100% { transform: translate(0px, 0px) scale(1); }
        40%       { transform: translate(-35px, 30px) scale(1.07); }
        70%       { transform: translate(25px, -15px) scale(0.94); }
      }
      @keyframes appBlob3 {
        0%, 100% { transform: translate(0px, 0px) scale(1); }
        50%       { transform: translate(15px, -35px) scale(1.05); }
      }
      @keyframes appSubtleShift {
        0%   { background-position: 0% 0%; }
        50%  { background-position: 100% 100%; }
        100% { background-position: 0% 0%; }
      }
      .app-bg-gradient {
        background: linear-gradient(135deg, #0c0a20 0%, #130e2e 50%, #0c0a20 100%);
        background-size: 200% 200%;
        animation: appSubtleShift 18s ease infinite;
      }
      html:not(.dark) .app-bg-gradient {
        background: linear-gradient(135deg, #f0f0ff 0%, #e8e4ff 50%, #f0f0ff 100%);
        background-size: 200% 200%;
        animation: appSubtleShift 18s ease infinite;
      }
      .app-blob-1 { animation: appBlob1 16s ease-in-out infinite; }
      .app-blob-2 { animation: appBlob2 22s ease-in-out infinite; }
      .app-blob-3 { animation: appBlob3 12s ease-in-out infinite; }
    `}</style>

    <div className="app-bg-gradient fixed inset-0 -z-20" />

    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Blobs más visibles que antes */}
      <div className="app-blob-1 absolute top-0 right-0 w-[700px] h-[700px] rounded-full bg-indigo-600/20 dark:bg-indigo-600/22 blur-3xl" />
      <div className="app-blob-2 absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-violet-600/18 dark:bg-violet-600/20 blur-3xl" />
      <div className="app-blob-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-blue-600/12 dark:bg-blue-600/15 blur-3xl" />

      {/* Blobs secundarios para más profundidad */}
      <div className="app-blob-2 absolute top-1/4 left-1/4 w-[350px] h-[350px] rounded-full bg-purple-600/12 dark:bg-purple-600/14 blur-3xl" />
      <div className="app-blob-1 absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-indigo-500/12 dark:bg-indigo-500/15 blur-2xl" />
    </div>
  </>
)

export default AppBackground
