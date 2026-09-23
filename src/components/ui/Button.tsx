"use client";

import { cn } from "@/lib/utils";

// ============================================================
// Button Component — Day 6 Elevated UI
// Variants: primary | secondary | ghost | outline | danger
// Sizes: sm | md | lg
// ============================================================

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: [
    "bg-[var(--color-brand)] text-[var(--color-text-inverse)]",
    "border border-[var(--color-brand-hover)]",
    "hover:bg-[var(--color-brand-hover)]",
    "shadow-[var(--shadow-sm),inset_0_1px_0_rgba(255,255,255,0.14)] hover:shadow-[var(--shadow-card),inset_0_1px_0_rgba(255,255,255,0.18)]",
    "active:scale-[0.985] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)] transition-all duration-[var(--transition-fast)]",
    "disabled:bg-[var(--color-surface)] disabled:text-[var(--color-text-muted)] disabled:border-[var(--color-border)] disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none disabled:active:scale-100",
  ].join(" "),

  secondary: [
    "bg-[var(--color-bg-card)] text-[var(--color-text-primary)]",
    "border border-[var(--color-border)]",
    "hover:bg-[var(--color-bg-subtle)] hover:border-[var(--color-text-muted)]",
    "shadow-[var(--shadow-xs),inset_0_-1px_0_rgba(0,0,0,0.02)] hover:shadow-[var(--shadow-sm)]",
    "active:scale-[0.985] active:shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] transition-all duration-[var(--transition-fast)]",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
  ].join(" "),

  outline: [
    "bg-transparent text-[var(--color-text-primary)]",
    "border border-[var(--color-border)]",
    "hover:bg-[var(--color-surface)] hover:border-[var(--color-brand-muted)]",
    "active:scale-[0.985] transition-all duration-[var(--transition-fast)]",
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ].join(" "),

  ghost: [
    "bg-transparent text-[var(--color-text-secondary)]",
    "hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)]",
    "active:scale-[0.985] transition-all duration-[var(--transition-fast)]",
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ].join(" "),

  danger: [
    "bg-[var(--color-error-bg)] text-[var(--color-error)]",
    "border border-[var(--color-error-border)]",
    "hover:bg-[var(--color-error)] hover:text-white",
    "active:scale-[0.985] transition-all duration-[var(--transition-fast)]",
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ].join(" "),
};

const sizeStyles: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-[var(--radius-sm)] font-medium tracking-wide",
  md: "h-10 px-4 text-sm gap-2 rounded-[var(--radius-md)] font-medium tracking-wide",
  lg: "h-12 px-6 text-sm sm:text-base gap-2.5 rounded-[var(--radius-md)] font-semibold tracking-wide",
};

export function Button({
  variant = "secondary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center select-none cursor-pointer",
        "focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <LoadingSpinner size={size === "sm" ? 13 : 16} />
          <span>Processing…</span>
        </>
      ) : (
        <>
          {leftIcon && <span aria-hidden="true" className="flex-shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span aria-hidden="true" className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}

function LoadingSpinner({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="animate-spin text-current"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeDasharray="31.4"
        strokeDashoffset="10"
        opacity="0.25"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="2.75"
        strokeLinecap="round"
      />
    </svg>
  );
}
