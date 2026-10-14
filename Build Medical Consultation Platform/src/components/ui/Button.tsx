import { cn } from "@/lib/utils"
import type { ButtonHTMLAttributes, ReactNode } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  as?: "button" | "span"
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "accent"
  size?: "sm" | "md" | "lg"
  loading?: boolean
  children: ReactNode
}

export default function Button({
  as: Component = "button",
  variant = "primary",
  size = "md",
  loading = false,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none"

  const variants = {
    primary:
      "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 focus-visible:outline-primary-600 shadow-sm",
    accent:
      "bg-coral-500 text-white hover:bg-coral-600 active:bg-coral-700 focus-visible:outline-coral-500 shadow-sm",
    secondary:
      "bg-primary-50 text-primary-700 hover:bg-primary-100 active:bg-primary-200 focus-visible:outline-primary-600",
    outline:
      "border border-slate-200 text-slate-700 hover:bg-slate-50 active:bg-slate-100 focus-visible:outline-primary-600",
    ghost:
      "text-slate-600 hover:bg-slate-100 active:bg-slate-200 focus-visible:outline-primary-600",
    danger:
      "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus-visible:outline-red-600",
  }

  const sizes = {
    sm: "text-sm px-3 py-1.5 gap-1.5",
    md: "text-sm px-4 py-2",
    lg: "text-base px-6 py-3",
  }

  return (
    <Component
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          />
        </svg>
      )}
      {children}
    </Component>
  )
}
