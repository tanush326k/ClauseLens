"use client";

import { cn } from "@/lib/utils";

// ============================================================
// HowItWorks — Day 6 Open Editorial Progression
// Zero card boxes. Pure typographic sequence with delicate dividers.
// ============================================================

interface HowItWorksProps {
  className?: string;
}

const STAGES = [
  {
    num: "01",
    title: "UNDERSTAND",
    subtitle: "Describe or paste",
    description:
      "Explain your situation in everyday English, or paste the text of any clause, notice, or agreement. No legal framing or technical terminology is needed.",
  },
  {
    num: "02",
    title: "REVIEW",
    subtitle: "Surface key findings",
    description:
      "ClauseLens extracts the plain-language meaning, identifies deadlines and obligations, and independently verifies every quoted excerpt against your source text.",
  },
  {
    num: "03",
    title: "PREPARE",
    subtitle: "Equip yourself for counsel",
    description:
      "Receive practical next steps, an interactive pre-response checklist, and prepared questions to make any discussion with a legal professional more productive.",
  },
];

export function HowItWorks({ className }: HowItWorksProps) {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className={cn(
        "py-20 sm:py-28 lg:py-32 border-t border-[var(--color-border)] bg-[var(--color-bg-subtle)]/30",
        className,
      )}
    >
      <div className="max-w-[1320px] mx-auto px-6 sm:px-10 lg:px-12">
        
        {/* Section Header */}
        <div className="max-w-2xl text-left space-y-3 mb-12 sm:mb-16">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand)]" aria-hidden="true" />
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[var(--color-brand)]">
              HOW IT WORKS
            </span>
          </div>
          <h2
            id="how-it-works-heading"
            className="text-3xl sm:text-4xl lg:text-[42px] font-normal text-[var(--color-text-primary)] tracking-tight leading-[1.15]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            From legal language{" "}
            <span className="italic block sm:inline font-serif text-[var(--color-brand)]">
              to clearer decisions.
            </span>
          </h2>
          <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed max-w-xl">
            A three-stage sequence to eliminate confusion, verify critical terms,
            and prepare you for productive discussions with counsel.
          </p>
        </div>

        {/* Connected Horizontal Flow (Desktop 3-Column Sequence, Single Unified Surface) */}
        <div className="rounded-[var(--radius-lg)] bg-[var(--color-bg-card)] border border-[var(--color-border)] shadow-[var(--shadow-card)] p-6 sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[var(--color-border-subtle)]">
            {STAGES.map((stage, idx) => (
              <div
                key={stage.num}
                className={cn(
                  "flex flex-col justify-between space-y-5",
                  idx === 0 ? "md:pr-8 pb-6 md:pb-0" : "",
                  idx === 1 ? "md:px-8 py-6 md:py-0" : "",
                  idx === 2 ? "md:pl-8 pt-6 md:pt-0" : "",
                )}
              >
                {/* Stage Indicator */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-mono font-semibold text-[var(--color-brand)] flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-text-muted)]">
                      Phase {idx + 1}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-[var(--color-brand)] font-medium">
                    {stage.title}
                  </span>
                </div>

                {/* Stage Content */}
                <div className="space-y-2">
                  <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
                    {stage.subtitle}
                  </h3>
                  <p className="text-xs sm:text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
                    {stage.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
