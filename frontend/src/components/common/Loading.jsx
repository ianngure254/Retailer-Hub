export default function Loading({ text = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        {/* Spinner */}
        <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin" />

        {/* Optional text */}
        <p className="text-sm text-gray-600">{text}</p>
      </div>
    </div>
  );
}
