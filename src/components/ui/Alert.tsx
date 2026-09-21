"use client";

import { cn } from "@/lib/utils";

// ============================================================
// Alert Component — informational banners
// ============================================================

interface AlertProps {
  children: React.ReactNode;
  variant?: "info" | "success" | "warning" | "error";
  title?: string;
  icon?: React.ReactNode;
  className?: string;
}

const alertVariants: Record<
  NonNullable<AlertProps["variant"]>,
  { wrapper: string; icon: string }
> = {
  info: {
    wrapper: "bg-[var(--color-info-bg)] border-[var(--color-info)] text-[var(--color-info)]",
    icon: "ℹ",
  },
  success: {
    wrapper: "bg-[var(--color-success-bg)] border-[var(--color-success)] text-[var(--color-success)]",
    icon: "✓",
  },
  warning: {
    wrapper: "bg-[var(--color-warning-bg)] border-[var(--color-warning)] text-[var(--color-warning)]",
    icon: "⚠",
  },
  error: {
    wrapper: "bg-[var(--color-error-bg)] border-[var(--color-error)] text-[var(--color-error)]",
    icon: "✕",
  },
};

export function Alert({ children, variant = "info", title, icon, className }: AlertProps) {
  const styles = alertVariants[variant];
  const displayIcon = icon ?? styles.icon;

  return (
    <div
      role="alert"
      className={cn(
        "flex gap-3 p-4 rounded-[var(--radius-md)]",
        "border border-current border-opacity-20",
        styles.wrapper,
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="flex-shrink-0 mt-px text-base font-bold leading-none"
      >
        {displayIcon}
      </span>
      <div className="flex-1 min-w-0">
        {title && (
          <p className="font-semibold text-sm mb-1">{title}</p>
        )}
        <div className="text-sm leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
