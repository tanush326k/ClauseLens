"use client";

import { cn } from "@/lib/utils";

interface HeroSectionProps {
  className?: string;
}

export function HeroSection({ className }: HeroSectionProps) {
  return (
    <section
      aria-label="Introduction to ClauseLens"
      className={cn(
        "pt-5 pb-2 sm:pt-7 sm:pb-3",
        "text-center max-w-[780px] mx-auto px-4 sm:px-8",
        className,
      )}
    >
      <div className="space-y-2.5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[var(--radius-full)] bg-[var(--color-amber-subtle)] border border-[var(--color-amber-border)] text-[11px] font-semibold text-[var(--color-amber)] tracking-wider uppercase font-sans shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-amber)]" aria-hidden="true" />
          <span>Private Legal Research Desk</span>
        </div>

        <h1
          className="text-2xl sm:text-3xl lg:text-[40px] font-normal tracking-tight text-[var(--color-text-primary)] leading-[1.2] font-serif"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Understand what you&apos;re signing{" "}
          <span className="italic font-serif text-[var(--color-brand)]">with clarity.</span>
        </h1>

        <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] max-w-lg mx-auto leading-relaxed font-sans">
          Turn legal language into clear information, review points, and practical next steps.
        </p>
      </div>
    </section>
  );
}
