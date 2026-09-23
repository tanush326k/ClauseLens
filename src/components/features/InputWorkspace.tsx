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
  onModeChange?: (mode: "understand" | "compare") => void;
  className?: string;
}

export type FeatureMode = "understand" | "compare";

const MAX_CHARS = 8000;
const MIN_CHARS = 20;

const SITUATION_PLACEHOLDER =
  "Describe your situation in plain language… For example: 'I received a written notice from my landlord claiming deductions from my security deposit for repainting, even though the apartment was left clean and undamaged. They have not provided receipts. What are my rights?'";

const PASTE_PLACEHOLDER =
  "Paste the legal clause, contract excerpt, or formal notice here… For example: 'Section 8.1. Confidentiality. Neither party shall disclose any Proprietary Information to any third party without prior written authorization, except as required by applicable law or court order…'";

const TEXT_A_PLACEHOLDER =
  "Paste the baseline or original version here… For example: the earlier draft, previous contract terms, or original policy.";

const TEXT_B_PLACEHOLDER =
  "Paste the revised or proposed version here… For example: the amended section, redlined clause, or counter-offer.";

/** Curated, elegant starting points with distinct color categorization */
const SCENARIO_PRESETS = [
  {
    id: "rental",
    label: "Rental agreement notice",
    colorClass: "bg-[#FAF4E8] text-[#8C5D14] border-[#E8D8BA] hover:border-[#8C5D14]",
    activeClass: "bg-[#8C5D14] text-white border-[#8C5D14] shadow-xs",
    dotColor: "bg-[#8C5D14]",
    mode: "paste" as InputMode,
    text: "Either party may terminate this tenancy by providing not less than two full calendar months prior written notice to the other party. The tenant shall surrender the premises in identical clean condition, fair wear and tear accepted, subject to an inspection report conducted within 7 days of vacation.",
  },
  {
    id: "employment",
    label: "Non-compete covenant",
    colorClass: "bg-[#EEF3FA] text-[#112240] border-[#C4D6EB] hover:border-[#112240]",
    activeClass: "bg-[#112240] text-white border-[#112240] shadow-xs",
    dotColor: "bg-[#112240]",
    mode: "paste" as InputMode,
    text: "For a period of twelve (12) months following the termination of employee's engagement for any reason, employee shall not directly or indirectly engage in, perform services for, or consult with any business entity operating within a 50-mile radius that competes with employer's core digital services.",
  },
  {
    id: "payment",
    label: "Payment terms & late fees",
    colorClass: "bg-[#F0F7F3] text-[#195C38] border-[#BEDECC] hover:border-[#195C38]",
    activeClass: "bg-[#195C38] text-white border-[#195C38] shadow-xs",
    dotColor: "bg-[#195C38]",
    mode: "paste" as InputMode,
    text: "Payment is due in full within thirty (30) calendar days of client receiving the invoice. Any overdue balance shall accrue interest at 1.5% per month. Client waives all rights to dispute charges after 14 calendar days.",
  },
  {
    id: "deposit_dispute",
    label: "Deposit deduction dispute",
    colorClass: "bg-[#FDF4F0] text-[#943C1D] border-[#ECCEC2] hover:border-[#943C1D]",
    activeClass: "bg-[#943C1D] text-white border-[#943C1D] shadow-xs",
    dotColor: "bg-[#943C1D]",
    mode: "situation" as InputMode,
    text: "I received a written notice from my landlord claiming I owe deductions from my security deposit for repainting, even though the apartment was left in clean condition. They have not provided itemized receipts. What are my rights?",
  },
  {
    id: "nda",
    label: "Confidentiality (NDA)",
    colorClass: "bg-[#F2F4F8] text-[#2C4164] border-[#CAD5E8] hover:border-[#2C4164]",
    activeClass: "bg-[#2C4164] text-white border-[#2C4164] shadow-xs",
    dotColor: "bg-[#2C4164]",
    mode: "paste" as InputMode,
    text: "Neither party shall disclose any Proprietary Information to any third party without prior written authorization, except as required by applicable law or court order. The obligations of confidentiality hereunder shall survive indefinitely with respect to any trade secrets disclosed.",
  },
];

/** Sample Comparison Pairs */
const COMPARE_SAMPLE_PAIRS = [
  {
    id: "cmp-notice",
    label: "Notice period: 30 days vs. 7 days",
    colorClass: "bg-[#FAF4E8] text-[#8C5D14] border-[#E8D8BA] hover:border-[#8C5D14]",
    activeClass: "bg-[#8C5D14] text-white border-[#8C5D14] shadow-xs",
    dotColor: "bg-[#8C5D14]",
    a: "Either party may terminate this agreement at any time by providing not less than thirty (30) days prior written notice to the other party. All accrued fees through the termination date shall be paid in full.",
    b: "Either party may terminate this agreement at any time by providing seven (7) days written notice to the other party. In addition, the terminating party shall pay an early cancellation fee equal to one month's standard service charge.",
  },
  {
    id: "cmp-payment",
    label: "Payment window: 30 days vs. 15 days",
    colorClass: "bg-[#F0F7F3] text-[#195C38] border-[#BEDECC] hover:border-[#195C38]",
    activeClass: "bg-[#195C38] text-white border-[#195C38] shadow-xs",
    dotColor: "bg-[#195C38]",
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
  onModeChange,
  className,
}: InputWorkspaceProps) {
  const [featureMode, setFeatureMode] = useState<FeatureMode>(initialMode);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  useEffect(() => {
    if (initialMode && initialMode !== featureMode) {
      setFeatureMode(initialMode);
    }
  }, [initialMode, featureMode]);

  const handleModeSwitch = (mode: FeatureMode) => {
    setFeatureMode(mode);
    if (onModeChange) onModeChange(mode);
  };

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
    <div className={cn("w-full max-w-[880px] mx-auto space-y-5", className)}>
      
      {/* ── 1. Centered Primary Mode Switch (UNDERSTAND | COMPARE) ── */}
      <div className="flex flex-col items-center gap-3">
        <div
          role="tablist"
          aria-label="Analysis mode"
          className="inline-flex items-center p-1 bg-[var(--color-surface)] rounded-[var(--radius-md)] border border-[var(--color-border)] shadow-[var(--shadow-xs)]"
        >
          <button
            type="button"
            role="tab"
            onClick={() => handleModeSwitch("understand")}
            className={cn(
              "px-5 sm:px-6 py-2 text-xs sm:text-sm rounded-[var(--radius-sm)] transition-all cursor-pointer font-sans font-medium tracking-wide",
              featureMode === "understand"
                ? "bg-[var(--color-bg-card)] text-[var(--color-brand)] shadow-[var(--shadow-xs)] font-bold border border-[var(--color-border-subtle)]"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] border border-transparent",
            )}
            aria-selected={featureMode === "understand"}
          >
            UNDERSTAND
          </button>
          <button
            type="button"
            role="tab"
            onClick={() => handleModeSwitch("compare")}
            className={cn(
              "px-5 sm:px-6 py-2 text-xs sm:text-sm rounded-[var(--radius-sm)] transition-all cursor-pointer font-sans font-medium tracking-wide",
              featureMode === "compare"
                ? "bg-[var(--color-bg-card)] text-[var(--color-brand)] shadow-[var(--shadow-xs)] font-bold border border-[var(--color-border-subtle)]"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] border border-transparent",
            )}
            aria-selected={featureMode === "compare"}
          >
            COMPARE
          </button>
        </div>

        {/* ── 2. Relevant Input Mode (For Understand: Legal text | Situation) ── */}
        {featureMode === "understand" && (
          <div className="inline-flex items-center gap-1 p-0.5 bg-[var(--color-bg-subtle)] rounded-[var(--radius-sm)] border border-[var(--color-border-subtle)] text-xs font-sans">
            <button
              type="button"
              onClick={() => {
                setUnderstandMode("paste");
                setActivePresetId(null);
                setTimeout(() => textareaRef.current?.focus(), 0);
              }}
              className={cn(
                "px-3 py-1 rounded-[var(--radius-xs)] transition-all font-medium cursor-pointer",
                understandMode === "paste"
                  ? "bg-[var(--color-bg-card)] text-[var(--color-brand)] shadow-[var(--shadow-xs)] border border-[var(--color-border-subtle)] font-semibold"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] border border-transparent",
              )}
            >
              Legal text
            </button>
            <button
              type="button"
              onClick={() => {
                setUnderstandMode("situation");
                setActivePresetId(null);
                setTimeout(() => textareaRef.current?.focus(), 0);
              }}
              className={cn(
                "px-3 py-1 rounded-[var(--radius-xs)] transition-all font-medium cursor-pointer",
                understandMode === "situation"
                  ? "bg-[var(--color-bg-card)] text-[var(--color-brand)] shadow-[var(--shadow-xs)] border border-[var(--color-border-subtle)] font-semibold"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] border border-transparent",
              )}
            >
              Situation
            </button>
          </div>
        )}
      </div>

      {/* ── 3. Editorial Question & Categorized Presets ── */}
      <div className="text-center space-y-2.5 pt-1">
        <h2
          className="text-lg sm:text-2xl font-serif text-[var(--color-text-primary)] font-normal tracking-tight"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {featureMode === "understand"
            ? (understandMode === "situation" ? "What is happening in your situation?" : "What do you want to understand?")
            : "Compare two contract versions side by side"}
        </h2>

        {/* Compact, elegant starting point suggestions with purposeful color coding */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-[var(--color-text-secondary)] max-w-2xl mx-auto px-1">
          <span className="font-serif italic text-xs text-[var(--color-text-muted)] mr-1 hidden sm:inline">
            Sample starting points:
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
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-[var(--radius-full)] border text-xs transition-all cursor-pointer font-sans",
                    isSelected
                      ? preset.activeClass
                      : `${preset.colorClass} shadow-xs`,
                  )}
                  aria-label={`Load preset: ${preset.label}`}
                >
                  <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", isSelected ? "bg-white" : preset.dotColor)} />
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
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-[var(--radius-full)] border text-xs transition-all cursor-pointer font-sans",
                    isSelected
                      ? sample.activeClass
                      : `${sample.colorClass} shadow-xs`,
                  )}
                  aria-label={`Load sample: ${sample.label}`}
                >
                  <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", isSelected ? "bg-white" : sample.dotColor)} />
                  <span>{sample.label}</span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── 4. Main Writing Surface: Understand Mode ── */}
      {featureMode === "understand" && (
        <form onSubmit={handleUnderstandSubmit} className="space-y-3.5">
          <div
            className={cn(
              "relative bg-[var(--color-bg-card)] rounded-[var(--radius-lg)] border border-t-2 border-t-[var(--color-brand)] transition-all duration-150 shadow-[var(--shadow-card)]",
              isFocused && !isOverLimit
                ? "border-[var(--color-brand)] ring-2 ring-[var(--color-brand)]/15 shadow-[var(--shadow-sm)]"
                : isOverLimit
                  ? "border-[var(--color-error)]"
                  : "border-[var(--color-border)] hover:border-[var(--color-text-muted)]",
            )}
          >
            {/* Input Canvas Area */}
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
                  "placeholder:text-[var(--color-text-muted)]/70",
                  "text-sm sm:text-base leading-relaxed sm:leading-7 outline-none font-normal font-sans",
                )}
              />
            </div>

            {/* Canvas Bottom Toolbar */}
            <div className="flex items-center justify-between px-5 sm:px-7 py-2.5 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)]/40 rounded-b-[calc(var(--radius-lg)-1px)]">
              <div className="flex items-center gap-3">
                <span
                  id="char-count"
                  className={cn(
                    "text-xs tabular-nums font-sans px-2 py-0.5 rounded-[var(--radius-xs)]",
                    isOverLimit
                      ? "text-[var(--color-error)] bg-[var(--color-error-bg)] font-semibold"
                      : chars > 0
                        ? "text-[var(--color-brand)] bg-[var(--color-brand-subtle)] font-medium"
                        : "text-[var(--color-text-muted)]",
                  )}
                >
                  {chars > 0
                    ? `${chars.toLocaleString()} / ${MAX_CHARS.toLocaleString()} characters · ${words} words`
                    : "0 / 8,000 characters"}
                </span>

                {chars > 0 && text.trim().length < MIN_CHARS && (
                  <span className="text-xs text-[var(--color-amber)] font-medium font-sans">
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

          {/* Action Row — Primary CTA */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] font-sans">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-emerald)] flex-shrink-0" />
              <span>Stateless in-memory analysis · Verbatim excerpts verified against text</span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              disabled={!canSubmitUnderstand}
              className="px-8 text-sm font-semibold rounded-[var(--radius-md)] w-full sm:w-auto shadow-[var(--shadow-sm)]"
            >
              {isLoading ? "Analyzing clause…" : "Analyze clause →"}
            </Button>
          </div>
        </form>
      )}

      {/* ── 5. Main Writing Surface: Compare Mode (Side-by-Side) ── */}
      {featureMode === "compare" && (
        <form onSubmit={handleCompareSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {/* Version A Panel */}
            <div
              className={cn(
                "relative bg-[var(--color-bg-card)] rounded-[var(--radius-lg)] border border-t-2 border-t-[#3A506B] transition-all duration-150 shadow-[var(--shadow-card)] flex flex-col justify-between",
                isFocusedA && !isOverLimitA
                  ? "border-[var(--color-brand)] ring-2 ring-[var(--color-brand)]/15 shadow-[var(--shadow-sm)]"
                  : isOverLimitA
                    ? "border-[var(--color-error)]"
                    : "border-[var(--color-border)] hover:border-[var(--color-text-muted)]",
              )}
            >
              <div className="flex items-center justify-between px-5 py-2.5 border-b border-[var(--color-border-subtle)] bg-[var(--color-brand-subtle)]/50 rounded-t-[calc(var(--radius-lg)-1px)]">
                <span className="text-xs font-semibold text-[var(--color-brand)] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#3A506B]" />
                  Version A · Baseline Draft
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  Original
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
                  className="w-full resize-none bg-transparent text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]/70 text-sm leading-relaxed outline-none font-normal font-sans"
                />
              </div>

              <div className="flex items-center justify-between px-5 py-2 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)]/30 rounded-b-[calc(var(--radius-lg)-1px)] text-xs font-sans">
                <span className={cn(isOverLimitA ? "text-[var(--color-error)] font-semibold" : "text-[var(--color-text-muted)]")}>
                  {charsA > 0 ? `${charsA.toLocaleString()} / 8,000 characters` : "0 / 8,000"}
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
                "relative bg-[var(--color-bg-card)] rounded-[var(--radius-lg)] border border-t-2 border-t-[var(--color-amber)] transition-all duration-150 shadow-[var(--shadow-card)] flex flex-col justify-between",
                isFocusedB && !isOverLimitB
                  ? "border-[var(--color-brand)] ring-2 ring-[var(--color-brand)]/15 shadow-[var(--shadow-sm)]"
                  : isOverLimitB
                    ? "border-[var(--color-error)]"
                    : "border-[var(--color-border)] hover:border-[var(--color-text-muted)]",
              )}
            >
              <div className="flex items-center justify-between px-5 py-2.5 border-b border-[var(--color-border-subtle)] bg-[var(--color-amber-subtle)]/70 rounded-t-[calc(var(--radius-lg)-1px)]">
                <span className="text-xs font-semibold text-[var(--color-amber)] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-amber)]" />
                  Version B · Proposed Revision
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  Revised
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
                  className="w-full resize-none bg-transparent text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]/70 text-sm leading-relaxed outline-none font-normal font-sans"
                />
              </div>

              <div className="flex items-center justify-between px-5 py-2 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)]/30 rounded-b-[calc(var(--radius-lg)-1px)] text-xs font-sans">
                <span className={cn(isOverLimitB ? "text-[var(--color-error)] font-semibold" : "text-[var(--color-text-muted)]")}>
                  {charsB > 0 ? `${charsB.toLocaleString()} / 8,000 characters` : "0 / 8,000"}
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

          {/* Action Row — Compare CTA */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] font-sans">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-emerald)] flex-shrink-0" />
              <span>Independent A/B verification · Strictly neutral substantive comparison</span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              disabled={!canCompare}
              className="px-8 text-sm font-semibold rounded-[var(--radius-md)] w-full sm:w-auto shadow-[var(--shadow-sm)]"
            >
              {isLoading ? "Comparing versions…" : "Compare versions →"}
            </Button>
          </div>
        </form>
      )}

    </div>
  );
}
