// src/app/loading.tsx
export default function Loading() {
    return (
      <main className="container mx-auto max-w-2xl p-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-8 w-32 bg-gray-800 rounded animate-pulse"></div>
            <div className="h-4 w-48 bg-gray-800 rounded mt-2 animate-pulse"></div>
          </div>
          <div className="h-10 w-10 bg-gray-800 rounded-lg animate-pulse"></div>
        </div>
        
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-800 rounded-lg p-4 mb-4 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-700 rounded-lg"></div>
                <div>
                  <div className="h-5 w-32 bg-gray-700 rounded"></div>
                  <div className="h-4 w-48 bg-gray-700 rounded mt-2"></div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {[...Array(28)].map((_, j) => (
                <div 
                  key={j} 
                  className="aspect-square bg-gray-700 rounded-sm"
                />
              ))}
            </div>
          </div>
        ))}
      </main>
    )
  }