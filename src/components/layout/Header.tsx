"use client";

import { cn } from "@/lib/utils";

// ============================================================
// SiteHeader — minimal, trustworthy navigation
// ============================================================

interface SiteHeaderProps {
  className?: string;
}

export function SiteHeader({ className }: SiteHeaderProps) {
  return (
    <header
      className={cn(
        "border-b border-[var(--color-border-subtle)]",
        "bg-[var(--color-bg)]",
        "sticky top-0 z-50",
        // subtle backdrop
        "backdrop-blur-sm bg-opacity-90",
        className,
      )}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo wordmark */}
          <div className="flex items-center gap-2.5">
            <div
              aria-hidden="true"
              className={cn(
                "w-7 h-7 rounded-[var(--radius-md)]",
                "bg-[var(--color-brand)] flex items-center justify-center",
                "text-white text-xs font-bold tracking-tight",
              )}
            >
              CL
            </div>
            <span className="font-semibold text-[var(--color-text-primary)] text-sm tracking-tight">
              ClauseLens
            </span>
          </div>

          {/* Right: tagline on medium+ screens */}
          <p
            className="hidden md:block text-xs text-[var(--color-text-muted)] italic"
            aria-label="Tagline"
          >
            Legal information, without the complexity.
          </p>
        </div>
      </div>
    </header>
  );
}

// ============================================================
// Hero — the initial page title and value proposition
// ============================================================

interface HeroProps {
  className?: string;
}

export function Hero({ className }: HeroProps) {
  return (
    <div className={cn("text-center space-y-4 py-10 sm:py-14", className)}>
      {/* Eyebrow badge */}
      <div className="flex justify-center">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1",
            "text-xs font-medium",
            "text-[var(--color-brand)]",
            "bg-[var(--color-brand-subtle)]",
            "border border-[var(--color-brand-muted)]",
            "rounded-[var(--radius-full)]",
          )}
        >
          <span aria-hidden="true">⚖</span>
          AI-powered legal information
        </span>
      </div>

      {/* Main headline */}
      <h1
        className={cn(
          "text-3xl sm:text-4xl lg:text-5xl",
          "font-bold tracking-tight",
          "text-[var(--color-text-primary)]",
          "leading-tight",
        )}
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Legal information,{" "}
        <span className="text-[var(--color-brand)]">without the complexity.</span>
      </h1>

      {/* Subheading */}
      <p
        className={cn(
          "text-base sm:text-lg",
          "text-[var(--color-text-secondary)]",
          "max-w-xl mx-auto leading-relaxed",
        )}
      >
        Understand legal text, make sense of difficult situations, and prepare
        better questions — in plain language.
      </p>

      {/* Supporting value props */}
      <div
        className={cn(
          "flex flex-wrap justify-center gap-x-6 gap-y-2 pt-1",
          "text-sm text-[var(--color-text-muted)]",
        )}
        aria-label="Key features"
      >
        {[
          "Understand clauses",
          "Identify key terms",
          "Prepare your questions",
        ].map((feat) => (
          <span key={feat} className="flex items-center gap-1.5">
            <span aria-hidden="true" className="text-[var(--color-brand)] font-bold">
              ✓
            </span>
            {feat}
          </span>
        ))}
      </div>
    </div>
  );
}
