"use client"
import { Suspense, use } from "react"
import { Navigation } from "@/components/navigation"
import EventDetailContent from "./content"
import EventDetailLoading from "./loading"

export default function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  
  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-40 bg-black">
        <Navigation />
      </div>
      <div className="pt-20">
        <Suspense fallback={<EventDetailLoading />}>
          <EventDetailContent slug={slug} />
        </Suspense>
      </div>
    </>
  )
}
