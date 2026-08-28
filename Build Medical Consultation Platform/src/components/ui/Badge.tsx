import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface BadgeProps {
  variant?: "default" | "primary" | "success" | "warning" | "danger" | "muted"
  size?: "sm" | "md"
  className?: string
  children: ReactNode
}

export default function Badge({
  variant = "default",
  size = "sm",
  className,
  children,
}: BadgeProps) {
  const variants = {
    default: "bg-slate-100 text-slate-700",
    primary: "bg-primary-50 text-primary-700",
    success: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-700",
    danger: "bg-red-50 text-red-700",
    muted: "bg-slate-50 text-slate-500",
  }

  const sizes = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium rounded-full",
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {children}
    </span>
  )
}
