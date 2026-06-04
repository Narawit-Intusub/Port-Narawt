export default function HandPenLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#050301]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#F5D061] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#F5D061] font-mono text-sm tracking-wider animate-pulse">
          LOADING HAND PEN...
        </p>
      </div>
    </div>
  );
}
