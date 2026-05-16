export default function LoadingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:0ms]" />
      <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:150ms]" />
      <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:300ms]" />
    </div>
  );
}
