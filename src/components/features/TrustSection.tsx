"use client";

import { cn } from "@/lib/utils";
import { DISCLAIMER_TEXT } from "@/lib/content";

interface TrustSectionProps {
  className?: string;
}

const PRINCIPLES = [
  {
    title: "General Information Only",
    text: "An educational comprehension desk, not an attorney or formal legal representation.",
  },
  {
    title: "Verbatim Source Grounding",
    text: "Every quoted excerpt is independently verified word-for-word against your source text.",
  },
  {
    title: "Non-Definitive Phrasing",
    text: "Strictly neutral, non-definitive framing that analyzes text rather than predicting legal outcomes.",
  },
  {
    title: "Jurisdictional Sensitivity",
    text: "Flags missing local governing context and recommends consultation with qualified local counsel.",
  },
];

export function TrustSection({ className }: TrustSectionProps) {
  return (
    <aside
      id="trust-safety"
      aria-labelledby="trust-safety-heading"
      className={cn(
        "py-12 border-t border-[var(--color-border)] bg-[var(--color-bg-subtle)]/40 font-sans",
        className,
      )}
    >
      <div className="max-w-[880px] mx-auto px-4 sm:px-8 space-y-7">
        
        {/* Principles row */}
        <div className="space-y-4">
          <h2
            id="trust-safety-heading"
            className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]"
          >
            Operating Principles & Analytical Boundaries
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRINCIPLES.map((p, i) => (
              <div key={p.title} className="space-y-2">
                <span className="w-5 h-5 rounded-full bg-[var(--color-brand-subtle)] text-[var(--color-brand)] border border-[var(--color-brand-border)] text-[11px] font-serif font-bold flex items-center justify-center flex-shrink-0 shadow-xs">
                  {i + 1}
                </span>
                <h3 className="text-xs font-semibold text-[var(--color-text-primary)]">
                  {p.title}
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                  {p.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Official Statutory Legal Notice */}
        <div
          className="pt-6 border-t border-[var(--color-border-subtle)] space-y-1 text-xs text-[var(--color-text-secondary)] leading-relaxed"
          role="note"
          aria-label="Official Legal Information Notice"
        >
          <span className="font-semibold text-[var(--color-text-primary)] block">
            Official Legal Information Notice
          </span>
          <p>{DISCLAIMER_TEXT}</p>
        </div>

      </div>
    </aside>
  );
}
