"use client";

import { cn } from "@/lib/utils";

// ============================================================
// Spinner — understated precision indicator
// ============================================================

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: 16,
  md: 22,
  lg: 32,
};

export function Spinner({ size = "md", className }: SpinnerProps) {
  const px = sizes[size];
  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn("animate-spin text-[var(--color-brand)]", className)}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2.25"
        opacity="0.2"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ============================================================
// AnalysisLoadingState — editorial legal research placeholder
// ============================================================

export function AnalysisLoadingState() {
  return (
    <div
      aria-live="polite"
      aria-label="Analyzing legal text, please wait"
      className="flex flex-col items-center justify-center py-14 px-4 gap-4 max-w-[900px] mx-auto font-sans"
    >
      <Spinner size="lg" />

      <div className="text-center space-y-1">
        <p className="text-[var(--color-text-primary)] font-serif text-lg">
          Conducting legal analysis…
        </p>
        <p className="text-[var(--color-text-muted)] text-xs font-sans">
          Verifying plain-language explanations and exact source quotations.
        </p>
      </div>

      {/* Editorial placeholder skeleton lines */}
      <div className="w-full max-w-xl space-y-4 mt-4 pt-4 border-t border-[var(--color-border-subtle)]" aria-hidden="true">
        <div className="h-3 bg-[var(--color-surface)] rounded-[var(--radius-xs)] w-3/4 mx-auto animate-pulse" />
        <div className="h-2.5 bg-[var(--color-surface)] rounded-[var(--radius-xs)] w-full animate-pulse" />
        <div className="h-2.5 bg-[var(--color-surface)] rounded-[var(--radius-xs)] w-5/6 mx-auto animate-pulse" />
      </div>
    </div>
  );
}
