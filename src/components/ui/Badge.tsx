"use client";

import { cn } from "@/lib/utils";

// ============================================================
// Badge Component — Day 6 Editorial Pill
// ============================================================

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "brand" | "success" | "warning" | "error" | "info" | "outline";
  dot?: boolean;
  className?: string;
}

const badgeVariants: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)]",
  brand:   "bg-[var(--color-brand-subtle)] text-[var(--color-brand)] border-[var(--color-brand-muted)]",
  success: "bg-[var(--color-success-bg)] text-[var(--color-success)] border-[var(--color-success-border)]",
  warning: "bg-[var(--color-warning-bg)] text-[var(--color-warning)] border-[var(--color-warning-border)]",
  error:   "bg-[var(--color-error-bg)] text-[var(--color-error)] border-[var(--color-error-border)]",
  info:    "bg-[var(--color-info-bg)] text-[var(--color-info)] border-[var(--color-info-border)]",
  outline: "bg-transparent text-[var(--color-text-muted)] border-[var(--color-border)]",
};

const dotVariants: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-[var(--color-text-muted)]",
  brand:   "bg-[var(--color-brand)]",
  success: "bg-[var(--color-success)]",
  warning: "bg-[var(--color-warning)]",
  error:   "bg-[var(--color-error)]",
  info:    "bg-[var(--color-info)]",
  outline: "bg-[var(--color-text-muted)]",
};

export function Badge({
  children,
  variant = "default",
  dot = false,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5",
        "text-xs font-medium tracking-wide",
        "rounded-[var(--radius-full)]",
        "border shadow-[var(--shadow-xs)]",
        badgeVariants[variant],
        className,
      )}
    >
      {dot && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", dotVariants[variant])}
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
    </span>
  );
}
