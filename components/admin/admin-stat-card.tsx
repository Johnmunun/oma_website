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
        "p-6 hover:shadow-soft-lg transition-all duration-200 cursor-pointer border-0 shadow-soft bg-white",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
          <p className="text-3xl font-bold mt-2 text-foreground">{value}</p>
          <div className="flex items-center gap-2 mt-2">
            {trend && (
              <span
                className={cn(
                  "text-xs font-medium",
                  trend.isPositive ? "text-green-600" : "text-red-600"
                )}
              >
                {trend.isPositive ? "↑" : "↓"} {trend.value}
              </span>
            )}
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        <div className="ml-4 p-3 rounded-xl gradient-purple-light shadow-soft">
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Card>
  )

  return href ? <Link href={href}>{content}</Link> : content
}





