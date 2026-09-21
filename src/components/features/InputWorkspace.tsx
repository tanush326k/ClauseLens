"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { cn, wordCount } from "@/lib/utils";
import type { InputMode } from "@/types";
import { Button } from "@/components/ui/Button";

export interface InputWorkspaceProps {
  onSubmit: (mode: InputMode, text: string) => void;
  onCompare: (textA: string, textB: string) => void;
  isLoading: boolean;
  resetKey?: number;
  initialMode?: "understand" | "compare";
  className?: string;
}

export type FeatureMode = "understand" | "compare";

const MAX_CHARS = 8000;
const MIN_CHARS = 20;

const SITUATION_PLACEHOLDER =
  "Describe your situation in clear language… For example: 'I received a written notice from my landlord claiming deductions from my security deposit for repainting, even though the apartment was left in clean condition. They have not provided receipts. What are my rights?'";

const PASTE_PLACEHOLDER =
  "Paste the legal clause, agreement excerpt, or formal notice here… For example: 'Section 8.1. Confidentiality. Neither party shall disclose any Proprietary Information to any third party without prior written authorization, except as required by applicable law or court order…'";

const TEXT_A_PLACEHOLDER =
  "Paste the original or baseline version of the clause here… For example: the earlier draft, previous contract terms, or standard baseline policy.";

const TEXT_B_PLACEHOLDER =
  "Paste the updated or revised version of the clause here… For example: the amended section, redlined clause, or newly proposed terms.";

/** Curated Scenario Presets */
const SCENARIO_PRESETS = [
  {
    id: "employment",
    label: "Non-Compete",
    detail: "12-month post-employment restriction",
    mode: "paste" as InputMode,
    text: "For a period of twelve (12) months following the termination of employee's engagement for any reason, employee shall not directly or indirectly engage in, perform services for, or consult with any business entity operating within a 50-mile radius that competes with employer's core digital services.",
  },
  {
    id: "notice",
    label: "Notice Window",
    detail: "30-day termination requirement",
    mode: "paste" as InputMode,
    text: "Either party may terminate this agreement at any time by providing not less than thirty (30) days prior written notice to the other party, subject to the final settlement of all accrued performance obligations through the effective termination date.",
  },
  {
    id: "payment",
    label: "Payment Terms",
    detail: "Net-30 with late fee & waiver",
    mode: "paste" as InputMode,
    text: "Payment is due in full within thirty (30) calendar days of client receiving the invoice. Any overdue balance shall accrue interest at 1.5% per month. Client waives all rights to dispute charges after 14 calendar days.",
  },
  {
    id: "rental",
    label: "Rental Agreement",
    detail: "Two-month notice & deductions",
    mode: "paste" as InputMode,
    text: "Either party may terminate this tenancy by providing not less than two full calendar months prior written notice to the other party. The tenant shall surrender the premises in identical clean condition, fair wear and tear accepted, subject to an inspection report conducted within 7 days of vacation.",
  },
  {
    id: "deposit_dispute",
    label: "Deposit Dispute",
    detail: "Unjustified security deductions",
    mode: "situation" as InputMode,
    text: "I received a written notice from my landlord claiming I owe deductions from my security deposit for repainting, even though the apartment was left in clean condition. They have not provided itemized receipts. What are my rights?",
  },
  {
    id: "nda",
    label: "Confidentiality (NDA)",
    detail: "Perpetual trade secrets",
    mode: "paste" as InputMode,
    text: "Neither party shall disclose any Proprietary Information to any third party without prior written authorization, except as required by applicable law or court order. The obligations of confidentiality hereunder shall survive indefinitely with respect to any trade secrets disclosed.",
  },
  {
    id: "indemnity",
    label: "Indemnification",
    detail: "Uncapped liability clause",
    mode: "paste" as InputMode,
    text: "Vendor shall defend, indemnify, and hold harmless Client and its officers from and against any and all claims, damages, liabilities, costs, and expenses (including reasonable attorneys' fees) arising out of or related to any breach of this agreement, with no cap on liability.",
  },
];

/** Sample Comparison Pairs */
const COMPARE_SAMPLE_PAIRS = [
  {
    id: "cmp-notice",
    label: "Notice Period: 30 Days vs. 7 Days",
    a: "Either party may terminate this agreement at any time by providing not less than thirty (30) days prior written notice to the other party. All accrued fees through the termination date shall be paid in full.",
    b: "Either party may terminate this agreement at any time by providing seven (7) days written notice to the other party. In addition, the terminating party shall pay an early cancellation fee equal to one month's standard service charge.",
  },
  {
    id: "cmp-payment",
    label: "Payment Timing: 30 Days vs. 15 Days",
    a: "Payment is due in full within thirty (30) calendar days of client receiving the invoice. No interest or late fees shall accrue during this thirty-day window.",
    b: "Payment is due in full within fifteen (15) calendar days of invoice date. Any overdue amount shall automatically accrue interest at the rate of 1.5% per month or the maximum statutory rate permitted by law.",
  },
];

export function InputWorkspace({
  onSubmit,
  onCompare,
  isLoading,
  resetKey,
  initialMode = "understand",
  className,
}: InputWorkspaceProps) {
  const [featureMode, setFeatureMode] = useState<FeatureMode>(initialMode);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  useEffect(() => {
    if (initialMode) {
      setFeatureMode(initialMode);
    }
  }, [initialMode]);

  // ── Understand state ─────────────────────────────────────────
  const [understandMode, setUnderstandMode] = useState<InputMode>("paste");
  const [text, setText] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Compare state ────────────────────────────────────────────
  const [textA, setTextA] = useState("");
  const [textB, setTextB] = useState("");
  const [isFocusedA, setIsFocusedA] = useState(false);
  const [isFocusedB, setIsFocusedB] = useState(false);
  const textareaARef = useRef<HTMLTextAreaElement>(null);
  const textareaBRef = useRef<HTMLTextAreaElement>(null);

  // ── OS Detection ─────────────────────────────────────────────
  const [shortcutLabel, setShortcutLabel] = useState("Ctrl + Enter");
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.platform.toUpperCase().includes("MAC")) {
      setShortcutLabel("⌘ + Enter");
    }
  }, []);

  // ── Derived counts & validation ──────────────────────────────
  const chars = text.length;
  const words = wordCount(text);
  const isOverLimit = chars > MAX_CHARS;
  const isTooShort = text.trim().length < MIN_CHARS;
  const canSubmitUnderstand = !isTooShort && !isOverLimit && !isLoading;

  const charsA = textA.length;
  const charsB = textB.length;
  const isOverLimitA = charsA > MAX_CHARS;
  const isOverLimitB = charsB > MAX_CHARS;
  const isTooShortA = textA.trim().length < MIN_CHARS;
  const isTooShortB = textB.trim().length < MIN_CHARS;
  const canCompare = !isTooShortA && !isTooShortB && !isOverLimitA && !isOverLimitB && !isLoading;

  // ── Reset effect ─────────────────────────────────────────────
  useEffect(() => {
    if (resetKey === undefined || resetKey === 0) return;
    setText("");
    setTextA("");
    setTextB("");
    setActivePresetId(null);
    setFeatureMode("understand");
    setUnderstandMode("paste");
  }, [resetKey]);

  const handlePresetSelect = useCallback((preset: (typeof SCENARIO_PRESETS)[number]) => {
    setUnderstandMode(preset.mode);
    setText(preset.text);
    setActivePresetId(preset.id);
    setTimeout(() => textareaRef.current?.focus(), 0);
  }, []);

  const handleSampleCompareSelect = useCallback((sample: (typeof COMPARE_SAMPLE_PAIRS)[number]) => {
    setTextA(sample.a);
    setTextB(sample.b);
    setActivePresetId(sample.id);
    setTimeout(() => textareaARef.current?.focus(), 0);
  }, []);

  const handleUnderstandSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!canSubmitUnderstand) return;
      onSubmit(understandMode, text.trim());
    },
    [canSubmitUnderstand, understandMode, text, onSubmit],
  );

  const handleUnderstandKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (canSubmitUnderstand) onSubmit(understandMode, text.trim());
      }
    },
    [canSubmitUnderstand, understandMode, text, onSubmit],
  );

  const handleCompareSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!canCompare) return;
      onCompare(textA.trim(), textB.trim());
    },
    [canCompare, textA, textB, onCompare],
  );

  return (
    <div className={cn("w-full max-w-[1100px] mx-auto space-y-5", className)}>
      
      {/* ── Top Workspace Bar: Architectural Tabs + Input Submode ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--color-border)] pb-3.5">
        
        {/* Prominent Architectural Mode Switch */}
        <div
          role="tablist"
          aria-label="Mode selector"
          className="flex items-center gap-1 p-1 bg-[var(--color-surface)] rounded-[var(--radius-sm)] border border-[var(--color-border)] self-start sm:self-auto"
        >
          <button
            type="button"
            role="tab"
            onClick={() => setFeatureMode("understand")}
            className={cn(
              "px-4 py-1.5 text-xs sm:text-sm rounded-[var(--radius-xs)] transition-colors cursor-pointer font-sans",
              featureMode === "understand"
                ? "bg-[var(--color-bg-card)] text-[var(--color-text-primary)] font-semibold shadow-xs"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] font-normal",
            )}
            aria-selected={featureMode === "understand"}
          >
            Understand Clause
          </button>
          <button
            type="button"
            role="tab"
            onClick={() => setFeatureMode("compare")}
            className={cn(
              "px-4 py-1.5 text-xs sm:text-sm rounded-[var(--radius-xs)] transition-colors cursor-pointer font-sans",
              featureMode === "compare"
                ? "bg-[var(--color-bg-card)] text-[var(--color-text-primary)] font-semibold shadow-xs"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] font-normal",
            )}
            aria-selected={featureMode === "compare"}
          >
            Compare Two Versions
          </button>
        </div>

        {/* Input Submode / Context Hint */}
        {featureMode === "understand" ? (
          <div className="flex items-center gap-1.5 self-start sm:self-auto text-xs">
            <span className="text-[var(--color-text-muted)] mr-1 hidden md:inline">Source format:</span>
            <button
              type="button"
              onClick={() => {
                setUnderstandMode("paste");
                setActivePresetId(null);
                setTimeout(() => textareaRef.current?.focus(), 0);
              }}
              className={cn(
                "px-2.5 py-1 rounded-[var(--radius-xs)] border transition-colors cursor-pointer font-sans",
                understandMode === "paste"
                  ? "bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-primary)] font-medium shadow-xs"
                  : "bg-transparent border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]",
              )}
            >
              Contract Text / Clause
            </button>
            <button
              type="button"
              onClick={() => {
                setUnderstandMode("situation");
                setActivePresetId(null);
                setTimeout(() => textareaRef.current?.focus(), 0);
              }}
              className={cn(
                "px-2.5 py-1 rounded-[var(--radius-xs)] border transition-colors cursor-pointer font-sans",
                understandMode === "situation"
                  ? "bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-primary)] font-medium shadow-xs"
                  : "bg-transparent border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]",
              )}
            >
              Factual Situation
            </button>
          </div>
        ) : (
          <p className="text-xs text-[var(--color-text-muted)] self-start sm:self-auto font-sans">
            Side-by-side comparative analysis of Version A (Baseline) and Version B (Proposed)
          </p>
        )}
      </div>

      {/* ── Curated Scenario Suggestions (Refined Editorial Prompts) ── */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-[var(--color-text-secondary)] pt-0.5">
        <span className="font-serif italic text-sm text-[var(--color-text-muted)]">
          {featureMode === "understand" ? "Suggested clauses:" : "Suggested comparisons:"}
        </span>

        {featureMode === "understand" ? (
          SCENARIO_PRESETS.map((preset) => {
            const isSelected = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                className={cn(
                  "transition-colors cursor-pointer text-left py-0.5",
                  isSelected
                    ? "text-[var(--color-brand)] font-semibold underline underline-offset-4"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:underline underline-offset-2",
                )}
                aria-label={`Load preset: ${preset.label}`}
              >
                <span>{preset.label}</span>
              </button>
            );
          })
        ) : (
          COMPARE_SAMPLE_PAIRS.map((sample) => {
            const isSelected = activePresetId === sample.id;
            return (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleSampleCompareSelect(sample)}
                className={cn(
                  "transition-colors cursor-pointer text-left py-0.5",
                  isSelected
                    ? "text-[var(--color-brand)] font-semibold underline underline-offset-4"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:underline underline-offset-2",
                )}
                aria-label={`Load sample comparison: ${sample.label}`}
              >
                <span>{sample.label}</span>
              </button>
            );
          })
        )}
      </div>

      {/* ── Main Writing Surface: Understand Mode ── */}
      {featureMode === "understand" && (
        <form onSubmit={handleUnderstandSubmit} className="space-y-4">
          <div
            className={cn(
              "relative bg-[var(--color-bg-card)] rounded-[var(--radius-md)] border transition-all duration-150 shadow-[var(--shadow-card)]",
              isFocused && !isOverLimit
                ? "border-[var(--color-brand)] ring-1 ring-[var(--color-brand)]/20"
                : isOverLimit
                  ? "border-[var(--color-error)]"
                  : "border-[var(--color-border)] hover:border-[var(--color-text-muted)]",
            )}
          >
            {/* Editor Canvas Header */}
            <div className="flex items-center justify-between px-5 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)]/40 rounded-t-[calc(var(--radius-md)-1px)]">
              <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                {understandMode === "situation" ? "Describe your legal situation" : "Legal text or agreement clause"}
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">
                Up to 8,000 characters
              </span>
            </div>

            {/* Input Canvas */}
            <div className="p-5 sm:p-7">
              <label htmlFor="main-understand-input" className="sr-only">
                {understandMode === "situation" ? "Describe your legal situation" : "Paste your legal text"}
              </label>
              <textarea
                ref={textareaRef}
                id="main-understand-input"
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  if (activePresetId) setActivePresetId(null);
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={handleUnderstandKeyDown}
                placeholder={understandMode === "situation" ? SITUATION_PLACEHOLDER : PASTE_PLACEHOLDER}
                aria-describedby="char-count"
                aria-invalid={isOverLimit}
                rows={9}
                className={cn(
                  "w-full resize-none bg-transparent text-[var(--color-text-primary)]",
                  "placeholder:text-[var(--color-text-muted)]/50",
                  "text-sm sm:text-base leading-relaxed sm:leading-7 outline-none font-normal font-sans",
                )}
              />
            </div>

            {/* Editor Canvas Toolbar */}
            <div className="flex items-center justify-between px-5 py-2.5 border-t border-[var(--color-border)] bg-[var(--color-bg-subtle)]/20 rounded-b-[calc(var(--radius-md)-1px)]">
              <div className="flex items-center gap-3">
                <span
                  id="char-count"
                  className={cn(
                    "text-xs tabular-nums font-sans",
                    isOverLimit ? "text-[var(--color-error)] font-semibold" : "text-[var(--color-text-muted)]",
                  )}
                >
                  {chars > 0
                    ? `${chars.toLocaleString()} / ${MAX_CHARS.toLocaleString()} characters · ${words} words`
                    : "0 / 8,000 characters"}
                </span>

                {chars > 0 && text.trim().length < MIN_CHARS && (
                  <span className="text-xs text-[var(--color-warning)]">
                    (Minimum {MIN_CHARS} characters)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {chars > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setText("");
                      setActivePresetId(null);
                    }}
                    className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer py-0.5 px-2 rounded hover:bg-[var(--color-surface)]"
                  >
                    Clear text
                  </button>
                )}
                <span className="text-xs text-[var(--color-text-muted)] hidden sm:inline font-sans">
                  {shortcutLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <p className="text-xs text-[var(--color-text-muted)] font-sans">
              Stateless in-memory analysis · Verbatim source quotations verified against text
            </p>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              disabled={!canSubmitUnderstand}
              className="px-7 shadow-xs text-sm font-semibold rounded-[var(--radius-sm)] w-full sm:w-auto"
            >
              {isLoading ? "Analyzing clause…" : "Analyze clause →"}
            </Button>
          </div>
        </form>
      )}

      {/* ── Main Writing Surface: Compare Mode (Side-by-Side on Desktop) ── */}
      {featureMode === "compare" && (
        <form onSubmit={handleCompareSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Version A Panel */}
            <div
              className={cn(
                "relative bg-[var(--color-bg-card)] rounded-[var(--radius-md)] border transition-all duration-150 shadow-[var(--shadow-card)] flex flex-col justify-between",
                isFocusedA && !isOverLimitA
                  ? "border-[var(--color-brand)] ring-1 ring-[var(--color-brand)]/20"
                  : isOverLimitA
                    ? "border-[var(--color-error)]"
                    : "border-[var(--color-border)] hover:border-[var(--color-text-muted)]",
              )}
            >
              <div className="flex items-center justify-between px-5 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)]/40 rounded-t-[calc(var(--radius-md)-1px)]">
                <span className="text-xs font-semibold text-[var(--color-text-primary)]">
                  Version A · Baseline Draft
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  Original text
                </span>
              </div>

              <div className="p-4 sm:p-5 flex-1">
                <textarea
                  ref={textareaARef}
                  id="compare-text-a"
                  value={textA}
                  onChange={(e) => setTextA(e.target.value)}
                  onFocus={() => setIsFocusedA(true)}
                  onBlur={() => setIsFocusedA(false)}
                  placeholder={TEXT_A_PLACEHOLDER}
                  rows={8}
                  className="w-full resize-none bg-transparent text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]/50 text-sm leading-relaxed outline-none font-normal font-sans"
                />
              </div>

              <div className="flex items-center justify-between px-5 py-2 border-t border-[var(--color-border)] bg-[var(--color-bg-subtle)]/20 rounded-b-[calc(var(--radius-md)-1px)] text-xs font-sans">
                <span className={cn(isOverLimitA ? "text-[var(--color-error)] font-semibold" : "text-[var(--color-text-muted)]")}>
                  {charsA > 0 ? `${charsA.toLocaleString()} / 8,000 characters` : "0 / 8,000 characters"}
                </span>
                {charsA > 0 && (
                  <button
                    type="button"
                    onClick={() => setTextA("")}
                    className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Version B Panel */}
            <div
              className={cn(
                "relative bg-[var(--color-bg-card)] rounded-[var(--radius-md)] border transition-all duration-150 shadow-[var(--shadow-card)] flex flex-col justify-between",
                isFocusedB && !isOverLimitB
                  ? "border-[var(--color-brand)] ring-1 ring-[var(--color-brand)]/20"
                  : isOverLimitB
                    ? "border-[var(--color-error)]"
                    : "border-[var(--color-border)] hover:border-[var(--color-text-muted)]",
              )}
            >
              <div className="flex items-center justify-between px-5 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)]/40 rounded-t-[calc(var(--radius-md)-1px)]">
                <span className="text-xs font-semibold text-[var(--color-brand)]">
                  Version B · Proposed Revision
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  Revised text
                </span>
              </div>

              <div className="p-4 sm:p-5 flex-1">
                <textarea
                  ref={textareaBRef}
                  id="compare-text-b"
                  value={textB}
                  onChange={(e) => setTextB(e.target.value)}
                  onFocus={() => setIsFocusedB(true)}
                  onBlur={() => setIsFocusedB(false)}
                  placeholder={TEXT_B_PLACEHOLDER}
                  rows={8}
                  className="w-full resize-none bg-transparent text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]/50 text-sm leading-relaxed outline-none font-normal font-sans"
                />
              </div>

              <div className="flex items-center justify-between px-5 py-2 border-t border-[var(--color-border)] bg-[var(--color-bg-subtle)]/20 rounded-b-[calc(var(--radius-md)-1px)] text-xs font-sans">
                <span className={cn(isOverLimitB ? "text-[var(--color-error)] font-semibold" : "text-[var(--color-text-muted)]")}>
                  {charsB > 0 ? `${charsB.toLocaleString()} / 8,000 characters` : "0 / 8,000 characters"}
                </span>
                {charsB > 0 && (
                  <button
                    type="button"
                    onClick={() => setTextB("")}
                    className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <p className="text-xs text-[var(--color-text-muted)] font-sans">
              Independent A/B evidence verification · Strictly neutral substantive comparison
            </p>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              disabled={!canCompare}
              className="px-7 shadow-xs text-sm font-semibold rounded-[var(--radius-sm)] w-full sm:w-auto"
            >
              {isLoading ? "Comparing versions…" : "Compare versions →"}
            </Button>
          </div>
        </form>
      )}

    </div>
  );
}
