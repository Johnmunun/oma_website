/**
 * @file components/admin/admin-page-header.tsx
 * @description En-tête réutilisable pour toutes les pages admin avec le thème CRM
 */

import { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AdminPageHeaderProps {
  title: string
  description?: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
    icon?: ReactNode
  }
  className?: string
}

export function AdminPageHeader({ title, description, action, className }: AdminPageHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between mb-8", className)}>
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
        {description && <p className="text-muted-foreground mt-2">{description}</p>}
      </div>
      {action && (
        <Button
          className="gap-2 shadow-soft-lg hover:shadow-soft-lg transition-all gradient-purple text-white border-0"
          onClick={action.onClick}
          {...(action.href && { asChild: true })}
        >
          {action.icon}
          {action.label}
        </Button>
      )}
    </div>
  )
}





