import { Skeleton } from "@/components/ui/skeleton"
import Header from "@/app/components/Header"
import Footer from "@/app/components/Footer"

export default function FabricCollectionsLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <Skeleton className="h-10 w-80 mx-auto mb-4" /> {/* Title Skeleton */}
          <Skeleton className="h-6 w-2/3 mx-auto mb-12" /> {/* Subtitle Skeleton */}
          {/* Collections Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
                <Skeleton className="w-full h-64" />
                <div className="p-6">
                  <Skeleton className="h-8 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6 mb-4" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
