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
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8", className)}>
      <div className="min-w-0">
        <div className="h-1 w-10 rounded-full bg-gold mb-3" aria-hidden />
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description && <p className="text-muted-foreground mt-1.5 text-sm md:text-base">{description}</p>}
      </div>
      {action && (
        <Button
          className="gap-2 shadow-soft hover:shadow-md transition-all bg-primary hover:bg-primary/90 text-primary-foreground border-0 rounded-xl shrink-0"
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
