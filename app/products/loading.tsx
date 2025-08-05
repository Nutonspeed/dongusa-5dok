import { Skeleton } from "@/components/ui/skeleton"
import Header from "@/app/components/Header"
import Footer from "@/app/components/Footer"

export default function ProductsLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <Skeleton className="h-10 w-80 mx-auto mb-8" /> {/* Title Skeleton */}
          {/* Filters and Search Skeleton */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 p-4 bg-white rounded-lg shadow-sm">
            <Skeleton className="h-10 w-full md:w-1/3" />
            <div className="flex items-center gap-4 w-full md:w-auto">
              <Skeleton className="h-10 w-full md:w-[180px]" />
              <Skeleton className="h-10 w-full md:w-[180px]" />
              <Skeleton className="h-10 w-10 md:hidden" />
            </div>
          </div>
          {/* Product Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
                <Skeleton className="w-full h-48" />
                <div className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-8 w-full" />
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
