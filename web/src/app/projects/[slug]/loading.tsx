export default function ProjectLoading() {
  return (
    <div className="min-h-screen bg-[#F7F0FF]">
      <header className="bg-white border-b border-purple-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <div className="h-4 w-20 bg-purple-100 rounded animate-pulse" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-200 rounded-xl animate-pulse" />
            <div className="h-5 w-36 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-9 w-24 bg-white border border-purple-100 rounded-lg animate-pulse"
            />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-purple-100 p-6"
            >
              <div className="h-5 w-48 bg-gray-100 rounded animate-pulse mb-3" />
              <div className="h-4 w-full bg-gray-50 rounded animate-pulse mb-2" />
              <div className="h-4 w-2/3 bg-gray-50 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
