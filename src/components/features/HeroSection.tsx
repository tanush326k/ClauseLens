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
        "pt-7 pb-4 sm:pt-9 sm:pb-6",
        "text-center max-w-[820px] mx-auto px-5 sm:px-8",
        className,
      )}
    >
      <div className="space-y-2.5">
        <h1
          className="text-3xl sm:text-4xl lg:text-[42px] font-normal tracking-tight text-[var(--color-text-primary)] leading-[1.18] font-serif"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Understand legal text{" "}
          <span className="italic font-serif text-[var(--color-brand)]">
            before it becomes a problem.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-[var(--color-text-secondary)] max-w-xl mx-auto leading-relaxed font-sans">
          A private research desk to analyze contract clauses, evaluate differences, and prepare structured questions for legal counsel.
        </p>
      </div>
    </section>
  );
}
