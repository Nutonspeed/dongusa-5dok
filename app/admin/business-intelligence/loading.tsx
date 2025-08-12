export default function BusinessIntelligenceLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 bg-gray-200 rounded w-80 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-64 mt-2 animate-pulse"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg border">
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-24 mt-2 animate-pulse"></div>
            <div className="h-2 bg-gray-200 rounded w-full mt-4 animate-pulse"></div>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-lg border">
        <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="space-y-4">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="h-16 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
