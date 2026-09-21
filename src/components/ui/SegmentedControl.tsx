"use client";

import { cn } from "@/lib/utils";

// ============================================================
// SegmentedControl — Day 6 Editorial Mode Switcher
// Sizes: sm | md | lg (for primary product modes)
// ============================================================

export interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  size = "md",
  className,
}: SegmentedControlProps<T>) {
  const containerPadding = {
    sm: "p-0.5 gap-1 rounded-[var(--radius-md)]",
    md: "p-1 gap-1.5 rounded-[var(--radius-lg)]",
    lg: "p-1.5 gap-2 rounded-[var(--radius-lg)]",
  }[size];

  const buttonPadding = {
    sm: "py-1 px-2.5 text-xs",
    md: "py-2 px-3 text-sm",
    lg: "py-3 sm:py-3.5 px-4 sm:px-6 text-sm sm:text-base",
  }[size];

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const nextIdx = (index + 1) % options.length;
      onChange(options[nextIdx].value);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prevIdx = (index - 1 + options.length) % options.length;
      onChange(options[prevIdx].value);
    }
  };

  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn(
        "flex w-full",
        "bg-[var(--color-surface)]",
        "border border-[var(--color-border)]",
        "shadow-[var(--shadow-xs)]",
        containerPadding,
        className,
      )}
    >
      {options.map((opt, index) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(opt.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={cn(
              "flex-1 flex flex-col items-center justify-center text-center",
              "rounded-[var(--radius-md)] select-none cursor-pointer",
              "transition-all duration-[var(--transition-fast)]",
              buttonPadding,
              isActive
                ? [
                    "bg-[var(--color-bg-card)]",
                    "text-[var(--color-text-primary)]",
                    "font-semibold",
                    "shadow-[var(--shadow-sm)]",
                    "border border-[var(--color-border-subtle)]",
                  ].join(" ")
                : [
                    "text-[var(--color-text-secondary)]",
                    "font-medium",
                    "hover:text-[var(--color-text-primary)]",
                    "hover:bg-[rgba(255,255,255,0.4)]",
                  ].join(" "),
            )}
          >
            <div className="flex items-center justify-center gap-2">
              {opt.icon && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex-shrink-0 transition-colors",
                    isActive ? "text-[var(--color-brand)]" : "text-[var(--color-text-muted)]",
                  )}
                >
                  {opt.icon}
                </span>
              )}
              <span className="tracking-tight">{opt.label}</span>
            </div>

            {opt.description && (
              <span
                className={cn(
                  "text-xs mt-0.5 tracking-normal hidden sm:block transition-colors",
                  isActive
                    ? "text-[var(--color-text-muted)]"
                    : "text-[var(--color-text-muted)] opacity-70",
                )}
              >
                {opt.description}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
