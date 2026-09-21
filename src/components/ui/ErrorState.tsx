"use client";

import { cn } from "@/lib/utils";
import type { AppError } from "@/types";
import { Button } from "@/components/ui/Button";

export interface ErrorStateProps {
  error: AppError;
  onRetry?: () => void;
  onReset?: () => void;
  className?: string;
}

export function ErrorState({ error, onRetry, onReset, className }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "bg-[var(--color-bg-card)] border border-[var(--color-error-border)] rounded-[var(--radius-md)]",
        "flex flex-col items-center text-center p-8 sm:p-10 gap-5 max-w-lg mx-auto shadow-[var(--shadow-card)] font-sans",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="w-12 h-12 rounded-[var(--radius-sm)] flex items-center justify-center bg-[var(--color-error-bg)] text-[var(--color-error)] border border-[var(--color-error-border)]"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>

      <div className="space-y-2 max-w-md">
        <h3 className="text-xl font-normal text-[var(--color-text-primary)] font-serif" style={{ fontFamily: "var(--font-serif)" }}>
          Analysis could not be completed
        </h3>
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed font-sans">
          {error.message}
        </p>
        {error.code && (
          <p className="text-xs text-[var(--color-text-muted)] font-sans">
            Reference code: {error.code}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 flex-wrap justify-center pt-1 font-sans">
        {error.retryable && onRetry && (
          <Button variant="primary" size="md" onClick={onRetry} className="rounded-[var(--radius-xs)]">
            Try again
          </Button>
        )}
        {onReset && (
          <Button variant="secondary" size="md" onClick={onReset} className="rounded-[var(--radius-xs)]">
            Start over
          </Button>
        )}
      </div>
    </div>
  );
}
