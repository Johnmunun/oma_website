import { PageLoader } from "@/components/page-loader"

export default function EventDetailLoading() {
  return (
    <div>
      <PageLoader />

      {/* Skeleton du hero section */}
      <div className="h-96 md:h-[500px] bg-muted animate-pulse" />

      {/* Skeleton des info cards */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-4 gap-4 mb-12 -mt-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>

          {/* Skeleton du contenu */}
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
