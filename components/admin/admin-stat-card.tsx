/**
 * @file components/admin/admin-stat-card.tsx
 * @description Carte de statistique réutilisable avec le thème CRM
 */

import { ReactNode } from "react"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface AdminStatCardProps {
  label: string
  value: string | number
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  href?: string
  trend?: { value: string; isPositive: boolean }
  className?: string
}

export function AdminStatCard({
  label,
  value,
  subtitle,
  icon: Icon,
  href,
  trend,
  className,
}: AdminStatCardProps) {
  const content = (
    <Card
      className={cn(
        "p-6 hover:shadow-xl transition-all duration-300 ease-out cursor-pointer border-0 shadow-soft bg-white rounded-2xl hover:scale-[1.03] active:scale-[0.98] group relative overflow-hidden",
        className
      )}
    >
      {/* Effet shimmer au hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 shimmer-effect pointer-events-none" />
      
      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1 transition-colors duration-200 group-hover:text-foreground">{label}</p>
          <p className="text-3xl font-bold mt-2 text-foreground transition-transform duration-200 group-hover:scale-105">{value}</p>
          <div className="flex items-center gap-2 mt-2">
            {trend && (
              <span
                className={cn(
                  "text-xs font-medium transition-all duration-200 group-hover:scale-110",
                  trend.isPositive ? "text-green-600" : "text-red-600"
                )}
              >
                <span className="inline-block transition-transform duration-200 group-hover:translate-y-[-2px]">{trend.isPositive ? "↑" : "↓"}</span> {trend.value}
              </span>
            )}
            {subtitle && <p className="text-xs text-muted-foreground transition-colors duration-200 group-hover:text-foreground/80">{subtitle}</p>}
          </div>
        </div>
        <div className="ml-4 p-3 rounded-xl gradient-purple-light shadow-soft transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-lg">
          <Icon className="w-6 h-6 text-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-5deg]" />
        </div>
      </div>
      
      {/* Indicateur de hover en bas */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-x-0 group-hover:scale-x-100 origin-left" />
    </Card>
  )

  return href ? <Link href={href}>{content}</Link> : content
}





