"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { AnalysisResult, GroundedFinding } from "@/types";
import { Button } from "@/components/ui/Button";

interface ResultWorkspaceProps {
  result: AnalysisResult;
  className?: string;
}

type TabKey = "all" | "important" | "review" | "steps" | "checklist" | "questions" | "scope";

export function ResultWorkspace({ result, className }: ResultWorkspaceProps) {
  const { sections, inputMode } = result;

  const simpleTermsSection = sections.find((s) => s.id === "simple_terms" || s.id === "summary");
  const importantPointsSection = sections.find((s) => s.id === "important_points" || s.id === "important");
  const reviewPointsSection = sections.find((s) => s.id === "review_points" || s.id === "review");
  const nextStepsSection = sections.find((s) => s.id === "next_steps" || s.id === "actions");
  const checklistSection = sections.find((s) => s.id === "checklist");
  const questionsSection = sections.find((s) => s.id === "questions" || s.id === "lawyer_questions");
  const sourcesSection = sections.find((s) => s.id === "sources");

  const importantFindings =
    importantPointsSection && Array.isArray(importantPointsSection.content)
      ? (importantPointsSection.content as GroundedFinding[])
      : [];

  const reviewFindings =
    reviewPointsSection && Array.isArray(reviewPointsSection.content)
      ? (reviewPointsSection.content as GroundedFinding[])
      : [];

  const nextSteps =
    nextStepsSection && Array.isArray(nextStepsSection.content)
      ? (nextStepsSection.content as string[])
      : [];

  const checklistItems =
    checklistSection && Array.isArray(checklistSection.content)
      ? (checklistSection.content as string[])
      : [];

  const questionsList =
    questionsSection && Array.isArray(questionsSection.content)
      ? (questionsSection.content as string[])
      : [];

  const [activeTab, setActiveTab] = useState<TabKey>("all");

  return (
    <article
      aria-label="Legal analysis briefing"
      className={cn(
        "w-full max-w-[1100px] mx-auto bg-[var(--color-bg-card)] rounded-[var(--radius-md)] border border-[var(--color-border)] shadow-[var(--shadow-card)] p-6 sm:p-10 lg:p-12 space-y-9 animate-in",
        className,
      )}
    >
      {/* ── Document Masthead ── */}
      <header className="border-b border-[var(--color-border)] pb-6 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[var(--color-text-muted)] font-sans">
          <span>
            {inputMode === "situation" ? "Situation Memorandum" : "Legal Analysis Briefing"}
          </span>
          <div className="flex items-center gap-2">
            <time dateTime={new Date(result.timestamp).toISOString()}>
              {new Date(result.timestamp).toLocaleDateString(undefined, {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </time>
            <span>·</span>
            <span>Verbatim evidence verified</span>
          </div>
        </div>

        <h2
          className="text-2xl sm:text-3xl lg:text-[34px] font-normal text-[var(--color-text-primary)] tracking-tight leading-snug font-serif"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {inputMode === "situation"
            ? "Factual Situation Analysis & Guidance"
            : "Clause Analysis & Plain-Language Briefing"}
        </h2>
      </header>

      {/* ── Executive Summary: In Simple Terms ── */}
      {simpleTermsSection && simpleTermsSection.content && (
        <section aria-labelledby="exec-summary-heading" className="space-y-3 py-2">
          <h3 id="exec-summary-heading" className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] font-sans">
            Executive Summary · In Plain Terms
          </h3>
          <blockquote
            className="text-lg sm:text-xl lg:text-[22px] text-[var(--color-text-primary)] font-serif leading-relaxed italic border-l-2 border-[var(--color-brand)] pl-5 py-1"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            &ldquo;{String(simpleTermsSection.content)}&rdquo;
          </blockquote>
        </section>
      )}

      {/* ── Document Index / Navigation Tabs ── */}
      <nav
        aria-label="Briefing sections"
        className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[var(--color-border)] text-xs no-scrollbar"
      >
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={cn(
            "px-3 py-1.5 rounded-[var(--radius-xs)] whitespace-nowrap transition-colors cursor-pointer font-sans",
            activeTab === "all"
              ? "bg-[var(--color-text-primary)] text-[var(--color-text-inverse)] font-medium"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]",
          )}
        >
          Complete Briefing
        </button>

        {importantFindings.length > 0 && (
          <button
            type="button"
            onClick={() => setActiveTab("important")}
            className={cn(
              "px-3 py-1.5 rounded-[var(--radius-xs)] whitespace-nowrap transition-colors cursor-pointer font-sans",
              activeTab === "important"
                ? "bg-[var(--color-brand)] text-white font-medium"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]",
            )}
          >
            Key Obligations ({importantFindings.length})
          </button>
        )}

        {reviewFindings.length > 0 && (
          <button
            type="button"
            onClick={() => setActiveTab("review")}
            className={cn(
              "px-3 py-1.5 rounded-[var(--radius-xs)] whitespace-nowrap transition-colors cursor-pointer font-sans",
              activeTab === "review"
                ? "bg-[var(--color-warning)] text-white font-medium"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]",
            )}
          >
            Review Areas ({reviewFindings.length})
          </button>
        )}

        {nextSteps.length > 0 && (
          <button
            type="button"
            onClick={() => setActiveTab("steps")}
            className={cn(
              "px-3 py-1.5 rounded-[var(--radius-xs)] whitespace-nowrap transition-colors cursor-pointer font-sans",
              activeTab === "steps"
                ? "bg-[var(--color-brand)] text-white font-medium"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]",
            )}
          >
            Action Sequence ({nextSteps.length})
          </button>
        )}

        {checklistItems.length > 0 && (
          <button
            type="button"
            onClick={() => setActiveTab("checklist")}
            className={cn(
              "px-3 py-1.5 rounded-[var(--radius-xs)] whitespace-nowrap transition-colors cursor-pointer font-sans",
              activeTab === "checklist"
                ? "bg-[var(--color-brand)] text-white font-medium"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]",
            )}
          >
            Checklist ({checklistItems.length})
          </button>
        )}

        {questionsList.length > 0 && (
          <button
            type="button"
            onClick={() => setActiveTab("questions")}
            className={cn(
              "px-3 py-1.5 rounded-[var(--radius-xs)] whitespace-nowrap transition-colors cursor-pointer font-sans",
              activeTab === "questions"
                ? "bg-[var(--color-brand)] text-white font-medium"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]",
            )}
          >
            Counsel Agenda ({questionsList.length})
          </button>
        )}

        {sourcesSection && sourcesSection.content && (
          <button
            type="button"
            onClick={() => setActiveTab("scope")}
            className={cn(
              "px-3 py-1.5 rounded-[var(--radius-xs)] whitespace-nowrap transition-colors cursor-pointer font-sans",
              activeTab === "scope"
                ? "bg-[var(--color-brand)] text-white font-medium"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]",
            )}
          >
            Scope & Notes
          </button>
        )}
      </nav>

      {/* ── Substantive Editorial Sections ── */}
      <div className="space-y-10">

        {/* 1. Important Points & Key Obligations */}
        {(activeTab === "all" || activeTab === "important") && importantFindings.length > 0 && (
          <section aria-labelledby="important-points-heading" className="space-y-6">
            <div className="space-y-1 border-b border-[var(--color-border-subtle)] pb-3">
              <h3
                id="important-points-heading"
                className="text-xl sm:text-2xl font-normal text-[var(--color-text-primary)] font-serif"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Key Obligations & Substantive Terms
              </h3>
              <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] font-sans">
                Core obligations, deadlines, and rights surfaced from the source text.
              </p>
            </div>

            <EditorialFindingsList items={importantFindings} variant="important" />
          </section>
        )}

        {/* 2. Review Points / Worth a Closer Look */}
        {(activeTab === "all" || activeTab === "review") && reviewFindings.length > 0 && (
          <section aria-labelledby="review-points-heading" className="space-y-6 pt-2">
            <div className="space-y-1 border-b border-[var(--color-border-subtle)] pb-3">
              <h3
                id="review-points-heading"
                className="text-xl sm:text-2xl font-normal text-[var(--color-text-primary)] font-serif"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Clauses Warranting Closer Examination
              </h3>
              <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] font-sans">
                Provisions with potential ambiguity, restrictive covenants, or unilateral exposure.
              </p>
            </div>

            <EditorialFindingsList items={reviewFindings} variant="review" />
          </section>
        )}

        {/* 3. Action Sequence */}
        {(activeTab === "all" || activeTab === "steps") && nextSteps.length > 0 && (
          <section aria-labelledby="next-steps-heading" className="space-y-6 pt-2">
            <div className="space-y-1 border-b border-[var(--color-border-subtle)] pb-3">
              <h3
                id="next-steps-heading"
                className="text-xl sm:text-2xl font-normal text-[var(--color-text-primary)] font-serif"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Recommended Procedural Next Steps
              </h3>
              <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] font-sans">
                Prudent, non-binding sequence to organize documentation and protect your position.
              </p>
            </div>

            <ol className="divide-y divide-[var(--color-border-subtle)]" role="list">
              {nextSteps.map((step, i) => (
                <li key={i} className="py-4 flex items-baseline gap-4 first:pt-0 last:pb-0">
                  <span className="text-sm font-serif font-semibold text-[var(--color-brand)] flex-shrink-0 w-6">
                    {i + 1}.
                  </span>
                  <span className="text-sm text-[var(--color-text-primary)] leading-relaxed font-sans">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* 4. Interactive Checklist */}
        {(activeTab === "all" || activeTab === "checklist") && checklistItems.length > 0 && (
          <section aria-labelledby="checklist-heading" className="space-y-6 pt-2">
            <div className="space-y-1 border-b border-[var(--color-border-subtle)] pb-3">
              <h3
                id="checklist-heading"
                className="text-xl sm:text-2xl font-normal text-[var(--color-text-primary)] font-serif"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Pre-Response Verification Checklist
              </h3>
              <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] font-sans">
                Items to verify prior to signing or responding. Click any item to mark completed.
              </p>
            </div>

            <EditorialChecklist items={checklistItems} />
          </section>
        )}

        {/* 5. Questions for Counsel */}
        {(activeTab === "all" || activeTab === "questions") && questionsList.length > 0 && (
          <section aria-labelledby="counsel-agenda-heading" className="space-y-6 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 border-b border-[var(--color-border-subtle)] pb-3">
              <div className="space-y-1">
                <h3
                  id="counsel-agenda-heading"
                  className="text-xl sm:text-2xl font-normal text-[var(--color-text-primary)] font-serif"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  Consultation Agenda for Legal Counsel
                </h3>
                <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] font-sans">
                  Targeted questions to bring to a solicitor or attorney to make legal consultation efficient.
                </p>
              </div>

              <CopyQuestionsButton questions={questionsList} />
            </div>

            <ol className="divide-y divide-[var(--color-border-subtle)]" role="list">
              {questionsList.map((question, i) => (
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

        {/* 6. Scope & Limitations */}
        {(activeTab === "all" || activeTab === "scope") && sourcesSection && sourcesSection.content && (
          <section aria-labelledby="scope-heading" className="space-y-2 pt-4 border-t border-[var(--color-border)] text-xs text-[var(--color-text-muted)] font-sans">
            <h4 id="scope-heading" className="font-semibold text-[var(--color-text-secondary)]">
              Scope of Analysis & Informational Limits
            </h4>
            <p className="leading-relaxed whitespace-pre-wrap">
              {String(sourcesSection.content)}
            </p>
          </section>
        )}

      </div>
    </article>
  );
}

// ── Editorial Findings List (Replacing Boxy Card Grids) ─────────

interface EditorialFindingsListProps {
  items: GroundedFinding[];
  variant: "important" | "review";
}

function EditorialFindingsList({ items, variant }: EditorialFindingsListProps) {
  const isReview = variant === "review";

  return (
    <div className="divide-y divide-[var(--color-border-subtle)]" role="list">
      {items.map((item, i) => (
        <article key={i} className="py-6 first:pt-0 last:pb-0 space-y-3">
          {/* Finding Title & Sequence */}
          <div className="flex items-baseline gap-3">
            <span className={cn("text-sm font-serif font-semibold flex-shrink-0", isReview ? "text-[var(--color-warning)]" : "text-[var(--color-brand)]")}>
              {i + 1}.
            </span>
            <h4 className="text-base sm:text-lg font-semibold text-[var(--color-text-primary)] leading-snug font-sans">
              {item.point}
            </h4>
          </div>

          {/* Legal Rationale / Practical Explanation */}
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed pl-6 font-sans">
            {item.why_it_matters}
          </p>

          {/* Editorial Source Quotation (Typographical Quote, Not Code Pill) */}
          {item.evidence && (
            <div className="ml-6 mt-3 pl-4 border-l-2 border-[var(--color-border)] space-y-1">
              <blockquote
                className="text-xs sm:text-sm text-[var(--color-text-primary)] italic font-serif leading-relaxed"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                &ldquo;{item.evidence}&rdquo;
              </blockquote>
              <cite className="not-italic text-[11px] text-[var(--color-text-muted)] block font-sans">
                Source text{item.source_location ? ` · ${item.source_location}` : ""}
              </cite>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}

// ── Editorial Interactive Checklist ────────────────────────────

function EditorialChecklist({ items }: { items: string[] }) {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const toggle = useCallback((index: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, []);

  return (
    <ul className="divide-y divide-[var(--color-border-subtle)]" role="list">
      {items.map((item, i) => {
        const isChecked = checked.has(i);
        return (
          <li
            key={i}
            className="py-3.5 flex items-start gap-3.5 cursor-pointer select-none first:pt-0 last:pb-0"
            onClick={() => toggle(i)}
          >
            <div
              role="checkbox"
              aria-checked={isChecked}
              aria-label={`Checklist item: ${item}`}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  toggle(i);
                }
              }}
              className={cn(
                "flex-shrink-0 mt-0.5 w-4 h-4 rounded-[2px] border flex items-center justify-center transition-colors",
                isChecked
                  ? "bg-[var(--color-brand)] border-[var(--color-brand)] text-white"
                  : "bg-transparent border-[var(--color-border)] hover:border-[var(--color-brand)]",
              )}
            >
              {isChecked && (
                <svg width="10" height="8" viewBox="0 0 11 9" fill="none" aria-hidden="true" className="stroke-current">
                  <path d="M1 4.5L4 7.5L10 1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>

            <span
              className={cn(
                "text-sm leading-relaxed font-sans transition-colors",
                isChecked
                  ? "line-through text-[var(--color-text-muted)]"
                  : "text-[var(--color-text-primary)]",
              )}
            >
              {item}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

// ── Copy Agenda Action ────────────────────────────────────────

function CopyQuestionsButton({ questions }: { questions: string[] }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const formatted = questions.map((q, i) => `${i + 1}. ${q}`).join("\n\n");
      await navigator.clipboard.writeText(
        `Consultation Agenda for Legal Counsel (prepared via ClauseLens):\n\n${formatted}`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch (err) {
      console.error("Failed to copy questions:", err);
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
      aria-label="Copy agenda questions to clipboard"
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
