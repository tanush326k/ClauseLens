"use client";

import { cn } from "@/lib/utils";

// ============================================================
// ClauseLens Logo System — Architectural Precision Brand
// An abstract optical aperture focusing upon a structured clause line
// ============================================================

interface ClauseLensLogoProps {
  variant?: "full" | "symbol" | "wordmark";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ClauseLensLogo({
  variant = "full",
  size = "md",
  className,
}: ClauseLensLogoProps) {
  const symbolDimensions = {
    sm: 20,
    md: 24,
    lg: 32,
  }[size];

  const wordmarkStyles = {
    sm: "text-xs tracking-[0.14em]",
    md: "text-sm tracking-[0.14em]",
    lg: "text-lg tracking-[0.16em]",
  }[size];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2.5 select-none",
        className,
      )}
      aria-label="ClauseLens"
    >
      {/* ── Symbol ── */}
      {variant !== "wordmark" && (
        <div
          className={cn(
            "relative flex items-center justify-center flex-shrink-0",
            "rounded-[var(--radius-xs)]",
            "bg-[var(--color-brand)] text-[var(--color-bg)]",
          )}
          style={{ width: symbolDimensions + 6, height: symbolDimensions + 6 }}
          aria-hidden="true"
        >
          <svg
            width={symbolDimensions}
            height={symbolDimensions}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-current"
          >
            {/* Outer Lens Aperture Ring */}
            <circle
              cx="12"
              cy="12"
              r="9.5"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeOpacity="0.4"
            />
            {/* Elegant Clause Arc / Monogram */}
            <path
              d="M 17 8 C 14.5 5.5 9 6 6.5 10 C 4.5 13.5 5.5 17.5 8.5 19.5 C 11.5 21 16 20 17.5 17.5"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
            {/* Inner Precision Focal Point */}
            <circle cx="12.5" cy="12" r="1.75" fill="currentColor" />
          </svg>
        </div>
      )}

      {/* ── Wordmark Typography ── */}
      {variant !== "symbol" && (
        <span
          className={cn(
            "font-sans uppercase font-bold text-[var(--color-text-primary)]",
            wordmarkStyles,
          )}
        >
          Clause
          <span className="text-[var(--color-brand)] font-extrabold ml-0.5">Lens</span>
        </span>
      )}
    </div>
  );
}
