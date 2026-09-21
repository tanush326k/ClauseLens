"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ComparisonResult, ComparisonDifference } from "@/types";
import { Button } from "@/components/ui/Button";

interface ComparisonWorkspaceProps {
  result: ComparisonResult;
  className?: string;
}

export function ComparisonWorkspace({ result, className }: ComparisonWorkspaceProps) {
  return (
    <article
      aria-label="Document comparison results"
      className={cn(
        "w-full max-w-[1100px] mx-auto bg-[var(--color-bg-card)] rounded-[var(--radius-md)] border border-[var(--color-border)] shadow-[var(--shadow-card)] p-6 sm:p-10 lg:p-12 space-y-9 animate-in",
        className,
      )}
    >
      {/* ── Document Masthead ── */}
      <header className="border-b border-[var(--color-border)] pb-6 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[var(--color-text-muted)] font-sans">
          <span>Comparative Document Memorandum</span>
          <div className="flex items-center gap-2">
            <span>{result.differences.length} substantive variance{result.differences.length === 1 ? "" : "s"}</span>
            <span>·</span>
            <span>Neutral side-by-side verification</span>
          </div>
        </div>

        <h2
          className="text-2xl sm:text-3xl lg:text-[34px] font-normal text-[var(--color-text-primary)] tracking-tight leading-snug font-serif"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Comparative Analysis of Baseline and Proposed Terms
        </h2>
      </header>

      {/* ── Overview Summary ── */}
      {result.summary && (
        <section aria-labelledby="comparison-overview-heading" className="space-y-3 py-2">
          <h3 id="comparison-overview-heading" className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] font-sans">
            Executive Synthesis
          </h3>
          <blockquote
            className="text-lg sm:text-xl lg:text-[22px] text-[var(--color-text-primary)] font-serif leading-relaxed italic border-l-2 border-[var(--color-brand)] pl-5 py-1"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            &ldquo;{result.summary}&rdquo;
          </blockquote>
        </section>
      )}

      {/* ── Substantive Differences (Comparative Editorial Panels) ── */}
      <section aria-labelledby="differences-heading" className="space-y-6">
        <div className="space-y-1 border-b border-[var(--color-border-subtle)] pb-3">
          <h3
            id="differences-heading"
            className="text-xl sm:text-2xl font-normal text-[var(--color-text-primary)] font-serif"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Substantive Differences Identified
          </h3>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] font-sans">
            Specific terms affecting obligations, exposure, or rights between Version A and Version B.
          </p>
        </div>

        {result.differences.length > 0 ? (
          <div className="divide-y divide-[var(--color-border-subtle)]" role="list">
            {result.differences.map((diff, i) => (
              <DifferenceEntry key={i} index={i + 1} diff={diff} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--color-text-muted)] italic py-4 font-sans">
            No substantive legal differences were identified in the submitted excerpts.
          </p>
        )}
      </section>

      {/* ── Common Ground & Unchanged Terms ── */}
      {result.similarities.length > 0 && (
        <section aria-labelledby="similarities-heading" className="space-y-4 pt-2">
          <div className="space-y-1 border-b border-[var(--color-border-subtle)] pb-3">
            <h3
              id="similarities-heading"
              className="text-xl sm:text-2xl font-normal text-[var(--color-text-primary)] font-serif"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Common Ground & Unchanged Terms
            </h3>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] font-sans">
              Provisions where obligations and rights remain consistent across both versions.
            </p>
          </div>

          <ul className="space-y-2 text-sm text-[var(--color-text-secondary)] font-sans" role="list">
            {result.similarities.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-[var(--color-brand)] font-bold mt-0.5">•</span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Review Points ── */}
      {result.review_points.length > 0 && (
        <section aria-labelledby="comparison-review-heading" className="space-y-4 pt-2">
          <div className="space-y-1 border-b border-[var(--color-border-subtle)] pb-3">
            <h3
              id="comparison-review-heading"
              className="text-xl sm:text-2xl font-normal text-[var(--color-text-primary)] font-serif"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Points Warranting Closer Examination
            </h3>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] font-sans">
              Variances introducing potential unilateral risk, ambiguity, or burden shifting.
            </p>
          </div>

          <ul className="space-y-3 font-sans" role="list">
            {result.review_points.map((item, i) => (
              <li
                key={i}
                className="pl-4 py-2 border-l-2 border-[var(--color-warning)] text-sm text-[var(--color-text-secondary)] leading-relaxed"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Questions for Counsel ── */}
      {result.questions.length > 0 && (
        <section aria-labelledby="comparison-counsel-heading" className="space-y-6 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 border-b border-[var(--color-border-subtle)] pb-3">
            <div className="space-y-1">
              <h3
                id="comparison-counsel-heading"
                className="text-xl sm:text-2xl font-normal text-[var(--color-text-primary)] font-serif"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Consultation Agenda for Legal Counsel
              </h3>
              <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] font-sans">
                Targeted questions regarding the changes to bring to legal counsel.
              </p>
            </div>
            <CopyCompareQuestionsButton questions={result.questions} />
          </div>

          <ol className="divide-y divide-[var(--color-border-subtle)]" role="list">
            {result.questions.map((question, i) => (
              <li key={i} className="py-4 flex items-baseline gap-4 first:pt-0 last:pb-0">
                <span className="text-sm font-serif font-semibold text-[var(--color-brand)] flex-shrink-0 w-6">
                  {i + 1}.
                </span>
                <span className="text-sm text-[var(--color-text-primary)] leading-relaxed font-sans">
                  {question}
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* ── Scope & Limitations ── */}
      {result.confidence_note && (
        <section aria-labelledby="comparison-scope-heading" className="pt-4 border-t border-[var(--color-border)] text-xs text-[var(--color-text-muted)] font-sans space-y-1">
          <h4 id="comparison-scope-heading" className="font-semibold text-[var(--color-text-secondary)]">
            Scope & Comparative Boundaries
          </h4>
          <p className="leading-relaxed">
            {result.confidence_note}
          </p>
        </section>
      )}
    </article>
  );
}

// ── Comparative Difference Entry ───────────────────────────────

function DifferenceEntry({ index, diff }: { index: number; diff: ComparisonDifference }) {
  return (
    <article className="py-7 first:pt-0 last:pb-0 space-y-4 font-sans">
      {/* Topic Title */}
      <div className="flex items-baseline gap-3">
        <span className="text-sm font-serif font-semibold text-[var(--color-brand)] flex-shrink-0">
          {index}.
        </span>
        <h4 className="text-base sm:text-lg font-semibold text-[var(--color-text-primary)] leading-snug">
          {diff.topic}
        </h4>
      </div>

      {/* Side-by-side Comparative Excerpts on Desktop/Tablet */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Version A Panel */}
        <div className="p-4 rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)]/50 border border-[var(--color-border)] space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
            <span className="font-medium text-[var(--color-text-primary)]">Version A · Baseline Draft</span>
            {diff.source_location_a && <span>{diff.source_location_a}</span>}
          </div>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
            {diff.version_a}
          </p>
          {diff.evidence_a && (
            <div className="pl-3 border-l-2 border-[var(--color-border)] pt-1 space-y-0.5">
              <blockquote
                className="text-xs text-[var(--color-text-primary)] italic font-serif leading-relaxed"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                &ldquo;{diff.evidence_a}&rdquo;
              </blockquote>
            </div>
          )}
        </div>

        {/* Version B Panel */}
        <div className="p-4 rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)]/50 border border-[var(--color-border)] space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
            <span className="font-medium text-[var(--color-brand)]">Version B · Proposed Revision</span>
            {diff.source_location_b && <span>{diff.source_location_b}</span>}
          </div>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
            {diff.version_b}
          </p>
          {diff.evidence_b && (
            <div className="pl-3 border-l-2 border-[var(--color-brand)] pt-1 space-y-0.5">
              <blockquote
                className="text-xs text-[var(--color-text-primary)] italic font-serif leading-relaxed"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                &ldquo;{diff.evidence_b}&rdquo;
              </blockquote>
            </div>
          )}
        </div>
      </div>

      {/* Legal & Practical Impact Note */}
      <div className="pl-4 py-1 border-l-2 border-[var(--color-text-muted)] text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed space-y-0.5">
        <span className="font-semibold text-[var(--color-text-primary)] block text-xs">
          Practical Legal Significance
        </span>
        <p>{diff.why_it_may_matter}</p>
      </div>
    </article>
  );
}

// ── Copy Compare Questions Action ─────────────────────────────

function CopyCompareQuestionsButton({ questions }: { questions: string[] }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const text = questions.map((q, i) => `${i + 1}. ${q}`).join("\n\n");
      await navigator.clipboard.writeText(
        `Comparison Questions for Legal Counsel (prepared via ClauseLens):\n\n${text}`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch (err) {
      console.error("Failed to copy comparison questions:", err);
    }
  };

  return (
    <Button
      variant={copied ? "secondary" : "outline"}
      size="sm"
      onClick={handleCopy}
      className={cn(
        "transition-colors self-start sm:self-auto rounded-[var(--radius-xs)] font-sans",
        copied && "border-[var(--color-success)] text-[var(--color-success)] bg-[var(--color-success-bg)]",
      )}
    >
      {copied ? (
        <>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-success)]">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Agenda Copied</span>
        </>
      ) : (
        <>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          <span>Copy Counsel Agenda</span>
        </>
      )}
    </Button>
  );
}
