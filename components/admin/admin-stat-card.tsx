/**
 * @file components/admin/admin-stat-card.tsx
 * @description Carte de statistique réutilisable avec le thème CRM
 */

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
        "p-5 md:p-6 hover:shadow-md transition-all duration-200 cursor-pointer border border-border/60 shadow-soft bg-white rounded-2xl group relative overflow-hidden",
        className
      )}
    >
      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
          <p className="text-2xl md:text-3xl font-semibold mt-1.5 text-foreground tracking-tight">{value}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {trend && (
              <span
                className={cn(
                  "text-xs font-medium",
                  trend.isPositive ? "text-emerald-600" : "text-red-600"
                )}
              >
                {trend.isPositive ? "↑" : "↓"} {trend.value}
              </span>
            )}
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        <div className="ml-4 p-2.5 rounded-xl bg-primary/90 shadow-soft group-hover:bg-primary transition-colors">
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    </Card>
  )

  return href ? <Link href={href}>{content}</Link> : content
}
