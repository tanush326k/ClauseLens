"use client";

import { cn } from "@/lib/utils";
import { DISCLAIMER_TEXT } from "@/lib/content";

interface DisclaimerProps {
  variant?: "inline" | "footer";
  className?: string;
}

export function Disclaimer({ variant = "inline", className }: DisclaimerProps) {
  if (variant === "footer") {
    return (
      <footer
        className={cn(
          "border-t border-[var(--color-border-subtle)] py-6 px-4 font-sans",
          className,
        )}
      >
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
            <span className="font-medium text-[var(--color-text-secondary)]">ClauseLens</span> · {DISCLAIMER_TEXT}
          </p>
        </div>
      </footer>
    );
  }

  return (
    <div
      role="note"
      aria-label="Legal information disclaimer"
      className={cn(
        "flex gap-3 items-baseline",
        "py-2 px-1 text-xs text-[var(--color-text-muted)] leading-relaxed font-sans",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="flex-shrink-0 font-serif font-bold text-[var(--color-text-muted)] text-sm"
      >
        §
      </span>
      <p>
        <strong className="font-medium text-[var(--color-text-secondary)]">Legal Notice:</strong> {DISCLAIMER_TEXT}
      </p>
    </div>
  );
}
