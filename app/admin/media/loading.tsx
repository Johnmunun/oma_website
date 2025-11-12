import { PageSkeleton } from "@/components/admin/page-skeleton"

export default function Loading() {
  return <PageSkeleton type="grid" showHeader={true} showFilters={true} />
}
