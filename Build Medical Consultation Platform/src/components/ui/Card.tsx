import { cn } from "@/lib/utils"
import type { HTMLAttributes, ReactNode } from "react"

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  hover?: boolean
  padding?: "none" | "sm" | "md" | "lg"
}

export default function Card({
  children,
  hover = false,
  padding = "md",
  className,
  ...props
}: CardProps) {
  const paddings = {
    none: "",
    sm: "p-4",
    md: "p-5",
    lg: "p-6",
  }

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-slate-200/80 shadow-sm",
        hover &&
          "hover:shadow-[0_14px_36px_rgba(11,110,142,.10)] hover:-translate-y-1 hover:border-primary-300/50 transition-all duration-200 cursor-pointer",
        paddings[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
