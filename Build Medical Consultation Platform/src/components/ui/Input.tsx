import { useId } from "react"
import { cn } from "@/lib/utils"
import type { InputHTMLAttributes, ReactNode } from "react"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  startIcon?: ReactNode
  endIcon?: ReactNode
}

export default function Input({
  label,
  error,
  hint,
  startIcon,
  endIcon,
  className,
  id,
  ...props
}: InputProps) {
  const generatedId = useId()
  const inputId = id || generatedId
  const descriptionId = error
    ? `${inputId}-error`
    : hint
      ? `${inputId}-hint`
      : undefined
  const describedBy =
    [props["aria-describedby"], descriptionId].filter(Boolean).join(" ") ||
    undefined

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          {label}
          {props.required && <span className="text-red-500 ms-1">*</span>}
        </label>
      )}
      <div className="relative">
        {startIcon && (
          <span className="absolute inset-y-0 start-0 flex items-center ps-3 text-slate-400 pointer-events-none">
            {startIcon}
          </span>
        )}
        <input
          id={inputId}
          className={cn(
            "w-full rounded-xl border text-sm transition-colors",
            "bg-white text-slate-900 placeholder:text-slate-400",
            "focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500",
            error
              ? "border-red-400 focus:ring-red-400/30 focus:border-red-400"
              : "border-slate-200 hover:border-slate-300",
            startIcon ? "ps-10" : "ps-4",
            endIcon ? "pe-10" : "pe-4",
            "py-2.5",
            className,
          )}
          {...props}
          aria-invalid={error ? true : props["aria-invalid"]}
          aria-describedby={describedBy}
        />
        {endIcon && (
          <span className="absolute inset-y-0 end-0 flex items-center pe-3 text-slate-400 pointer-events-none">
            {endIcon}
          </span>
        )}
      </div>
      {error && (
        <p
          id={`${inputId}-error`}
          role="alert"
          className="mt-1.5 text-xs text-red-600 flex items-center gap-1"
        >
          <svg
            className="w-3.5 h-3.5 shrink-0"
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 10.5a.75.75 0 110-1.5.75.75 0 010 1.5zm.75-3.75a.75.75 0 01-1.5 0V5.75a.75.75 0 011.5 0v2z" />
          </svg>
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-slate-500">
          {hint}
        </p>
      )}
    </div>
  )
}
