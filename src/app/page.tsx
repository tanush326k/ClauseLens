"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { AppState, InputMode, AnalysisResult, ComparisonResult, AppError } from "@/types";
import { SiteNavbar } from "@/components/layout/SiteNavbar";
import { HeroSection } from "@/components/features/HeroSection";
import { InputWorkspace, type FeatureMode } from "@/components/features/InputWorkspace";
import { ResultWorkspace } from "@/components/features/ResultWorkspace";
import { ComparisonWorkspace } from "@/components/features/ComparisonWorkspace";
import { TrustSection } from "@/components/features/TrustSection";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Disclaimer } from "@/components/features/Disclaimer";
import { AnalysisLoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default function ClauseLensApp() {
  const [appState, setAppState] = useState<AppState>("idle");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState<AppError | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [activeMode, setActiveMode] = useState<FeatureMode>("understand");
  const resultRef = useRef<HTMLDivElement>(null);

  // Track last submission for retry
  const lastSubmissionRef = useRef<
    | { kind: "understand"; mode: InputMode; text: string }
    | { kind: "compare"; textA: string; textB: string }
    | null
  >(null);

  // Sync mode from URL search params on mount if present & expose test helpers
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("mode") === "compare") {
        setActiveMode("compare");
      }
      (window as unknown as Record<string, unknown>).__SET_TEST_RESULT__ = (data: AnalysisResult) => {
        setComparisonResult(null);
        setResult(data);
        setAppState("result");
      };
      (window as unknown as Record<string, unknown>).__SET_TEST_COMPARISON__ = (data: ComparisonResult) => {
        setResult(null);
        setComparisonResult(data);
        setAppState("result");
      };
    }
  }, []);

  // Scroll to results smoothly when they appear or start loading
  useEffect(() => {
    if ((appState === "result" || appState === "loading" || appState === "error") && resultRef.current) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [appState]);

  // ── Understand mode submit ───────────────────────────────
  const handleSubmit = useCallback(async (mode: InputMode, text: string) => {
    lastSubmissionRef.current = { kind: "understand", mode, text };
    setAppState("loading");
    setResult(null);
    setComparisonResult(null);
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, text }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorPayload = data?.error || {};
        setError({
          code: errorPayload.code || "ANALYSIS_FAILED",
          message:
            errorPayload.message ||
            "We were unable to complete the analysis. Please check your input and try again.",
          retryable: response.status >= 500 || response.status === 429,
        });
        setAppState("error");
        return;
      }

      setResult(data as AnalysisResult);
      setAppState("result");
    } catch (err) {
      console.error("Analysis request error:", err);
      setError({
        code: "NETWORK_ERROR",
        message:
          "Unable to connect to the ClauseLens service. Please check your network connection and try again.",
        retryable: true,
      });
      setAppState("error");
    }
  }, []);

  // ── Comparison mode submit ───────────────────────────────
  const handleCompare = useCallback(async (textA: string, textB: string) => {
    lastSubmissionRef.current = { kind: "compare", textA, textB };
    setAppState("loading");
    setResult(null);
    setComparisonResult(null);
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "comparison", textA, textB }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorPayload = data?.error || {};
        setError({
          code: errorPayload.code || "ANALYSIS_FAILED",
          message:
            errorPayload.message ||
            "We were unable to complete the comparison. Please check your inputs and try again.",
          retryable: response.status >= 500 || response.status === 429,
        });
        setAppState("error");
        return;
      }

      setComparisonResult(data as ComparisonResult);
      setAppState("result");
    } catch (err) {
      console.error("Comparison request error:", err);
      setError({
        code: "NETWORK_ERROR",
        message:
          "Unable to connect to the ClauseLens service. Please check your network connection and try again.",
        retryable: true,
      });
      setAppState("error");
    }
  }, []);

  const handleReset = useCallback(() => {
    setAppState("idle");
    setResult(null);
    setComparisonResult(null);
    setError(null);
    lastSubmissionRef.current = null;
    setResetKey((k) => k + 1);

    const elem = document.getElementById("workspace");
    if (elem) elem.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleRetry = useCallback(() => {
    const last = lastSubmissionRef.current;
    if (!last) {
      handleReset();
      return;
    }
    if (last.kind === "understand") {
      handleSubmit(last.mode, last.text);
    } else {
      handleCompare(last.textA, last.textB);
    }
  }, [handleSubmit, handleCompare, handleReset]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)] font-sans">
      {/* ── 1. Restrained Private Desk Header ───────────────── */}
      <SiteNavbar
        activeMode={activeMode}
        onNavigateToUnderstand={() => setActiveMode("understand")}
        onNavigateToCompare={() => setActiveMode("compare")}
      />

      <main id="main-content" className="flex-1">
        {/* ── 2. Compact Editorial Product Introduction ───────── */}
        <HeroSection />

        {/* ── 3. Main Analysis Workspace ─────────────────────── */}
        <section
          id="workspace"
          aria-label="ClauseLens Analysis Workspace"
          className="pb-10 px-4 sm:px-8 max-w-[1240px] mx-auto w-full"
        >
          <InputWorkspace
            onSubmit={handleSubmit}
            onCompare={handleCompare}
            isLoading={appState === "loading"}
            resetKey={resetKey}
            initialMode={activeMode}
            onModeChange={setActiveMode}
          />

          {/* Inline Trust Note directly below workspace */}
          <div className="mt-6 max-w-[880px] mx-auto">
            <Disclaimer variant="inline" />
          </div>
        </section>

        {/* ── 4. Results Workspace (Appears when active) ───────── */}
        <div
          ref={resultRef}
          id="results"
          aria-live="polite"
          aria-atomic="false"
          className={cn(
            "max-w-[1240px] mx-auto px-5 sm:px-8 pb-16 scroll-mt-20 w-full",
            appState === "idle" ? "hidden" : "block",
          )}
        >
          {/* Subtle Editorial Divider */}
          <div aria-hidden="true" className="flex items-center gap-4 my-8 max-w-[880px] mx-auto">
            <div className="flex-1 h-px bg-[var(--color-border)]" />
            <span className="text-xs text-[var(--color-text-muted)] font-serif italic">
              {appState === "loading"
                ? "Analyzing text & verifying source excerpts…"
                : comparisonResult !== null
                  ? "Document Comparison Memorandum"
                  : "Legal Analysis Memorandum"}
            </span>
            <div className="flex-1 h-px bg-[var(--color-border)]" />
          </div>

          {/* Loading State */}
          {appState === "loading" && <AnalysisLoadingState />}

          {/* Error State */}
          {appState === "error" && error && (
            <div className="max-w-[880px] mx-auto">
              <ErrorState
                error={error}
                onRetry={handleRetry}
                onReset={handleReset}
              />
            </div>
          )}

          {/* Understand Result */}
          {appState === "result" && result && (
            <div className="space-y-6 animate-in">
              <ResultWorkspace result={result} />

              {/* Action Bar */}
              <div className="max-w-[880px] mx-auto flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={handleReset}
                  aria-label="Start a new analysis"
                  className="rounded-[var(--radius-xs)] text-xs"
                >
                  ← Analyze another clause
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="rounded-[var(--radius-xs)] text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                >
                  Return to top ↑
                </Button>
              </div>
            </div>
          )}

          {/* Comparison Result */}
          {appState === "result" && comparisonResult && (
            <div className="space-y-6 animate-in">
              <ComparisonWorkspace result={comparisonResult} />

              {/* Action Bar */}
              <div className="max-w-[880px] mx-auto flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={handleReset}
                  aria-label="Start a new comparison"
                  className="rounded-[var(--radius-xs)] text-xs"
                >
                  ← Compare other versions
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="rounded-[var(--radius-xs)] text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                >
                  Return to top ↑
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* ── 5. Statutory Trust / Operating Principles ─────────── */}
        <TrustSection />
      </main>

      {/* ── 6. Colophon Footer ────────────────────────────────── */}
      <SiteFooter
        onNavigateToUnderstand={() => setActiveMode("understand")}
        onNavigateToCompare={() => setActiveMode("compare")}
      />
    </div>
  );
}
