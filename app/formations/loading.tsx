import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function FormationsLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary to-primary/90 text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <Button variant="ghost" className="mb-6 text-primary-foreground hover:bg-primary-foreground/10" disabled>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à l'accueil
          </Button>
          <Skeleton className="h-12 w-3/4 mb-6 bg-primary-foreground/20" />
          <Skeleton className="h-6 w-full max-w-3xl bg-primary-foreground/20" />
          <Skeleton className="h-6 w-2/3 max-w-3xl mt-2 bg-primary-foreground/20" />
        </div>
      </div>

      {/* Formations Grid Skeleton */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-card rounded-lg overflow-hidden shadow-lg border border-border">
              {/* Image skeleton */}
              <Skeleton className="h-48 w-full" />

              <div className="p-6">
                {/* Duration badge */}
                <Skeleton className="h-5 w-24 mb-3" />

                {/* Title */}
                <Skeleton className="h-7 w-full mb-3" />

                {/* Description */}
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6 mb-4" />

                {/* Features */}
                <Skeleton className="h-5 w-32 mb-2" />
                <div className="space-y-2 mb-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-4 w-5/6" />
                </div>

                {/* Price and button */}
                <div className="border-t border-border pt-4 mt-4">
                  <Skeleton className="h-10 w-32 mb-4" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section Skeleton */}
      <div className="bg-card border-t border-border py-16">
        <div className="container mx-auto px-4 text-center">
          <Skeleton className="h-10 w-96 mx-auto mb-4" />
          <Skeleton className="h-6 w-full max-w-2xl mx-auto mb-2" />
          <Skeleton className="h-6 w-3/4 max-w-2xl mx-auto mb-8" />
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-12 w-48" />
          </div>
        </div>
      </div>
    </div>
  )
}
