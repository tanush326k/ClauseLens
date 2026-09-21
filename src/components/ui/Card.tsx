"use client";

import { cn } from "@/lib/utils";

// ============================================================
// Card Component — Day 6 Editorial Container
// ============================================================

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
  elevated?: boolean;
  editorial?: boolean;
  flush?: boolean;
}

export function Card({
  children,
  className,
  as: Component = "div",
  elevated = false,
  editorial = false,
  flush = false,
}: CardProps) {
  return (
    <Component
      className={cn(
        "bg-[var(--color-bg-card)]",
        "border border-[var(--color-border)]",
        "rounded-[var(--radius-lg)]",
        "transition-all duration-[var(--transition-base)]",
        editorial && "border-t-2 border-t-[var(--color-brand)]",
        elevated
          ? "shadow-[var(--shadow-elevated)]"
          : "shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)]",
        !flush && "p-6 sm:p-7",
        className,
      )}
    >
      {children}
    </Component>
  );
}

export interface CardHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  eyebrow?: string;
  action?: React.ReactNode;
  className?: string;
}

export function CardHeader({
  title,
  description,
  icon,
  eyebrow,
  action,
  className,
}: CardHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4 mb-5", className)}>
      <div className="flex items-start gap-3.5">
        {icon && (
          <div
            aria-hidden="true"
            className={cn(
              "flex-shrink-0 w-9 h-9 flex items-center justify-center",
              "rounded-[var(--radius-md)]",
              "bg-[var(--color-brand-subtle)] text-[var(--color-brand)]",
              "border border-[var(--color-brand-muted)]",
              "shadow-[var(--shadow-xs)]",
            )}
          >
            {icon}
          </div>
        )}
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-[10px] font-semibold tracking-wider uppercase text-[var(--color-brand)] mb-0.5">
              {eyebrow}
            </p>
          )}
          <h3 className="text-base sm:text-lg font-semibold text-[var(--color-text-primary)] tracking-tight">
            {title}
          </h3>
          {description && (
            <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-0.5 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

export interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return (
    <div className={cn("text-sm text-[var(--color-text-secondary)] leading-relaxed", className)}>
      {children}
    </div>
  );
}
