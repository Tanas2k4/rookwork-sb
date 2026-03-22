import preloadUrl from "../../assets/preload.svg";

function Loading({ fullScreen = false }) {
  return (
    <div
      className={
        fullScreen
          ? "flex items-center justify-center h-screen bg-white"
          : "flex items-center justify-center p-4"
      }
    >
      <div className="flex flex-col items-center gap-4">
        <img src={preloadUrl} className="w-24 h-auto" />

        {/* progress */}
        <div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-700 rounded-full"
            style={{
              animation: "progress 3s ease-in-out forwards",
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes progress {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  );
}

export default Loading;
