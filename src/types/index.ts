// ============================================================
// ClauseLens — Shared Types
// All core data shapes used throughout the application
// ============================================================

/** Input mode — what the user is providing */
export type InputMode = "situation" | "paste";

/** Application state machine */
export type AppState = "idle" | "loading" | "result" | "error";

/**
 * A single grounded finding from the AI analysis.
 * Used in important_points and review_points cards.
 *
 * evidence and source_location are null when:
 *   - mode is "situation" (no supplied document)
 *   - server-side verification could not confirm the excerpt in the supplied text
 *
 * IMPORTANT: evidence is NOT "proof" or "verified legal evidence".
 * It is text returned by the model that has been confirmed to appear
 * in the user's supplied input. The finding may still be incorrect.
 */
export interface GroundedFinding {
  point: string;
  why_it_matters: string;
  /** Verbatim excerpt from the user's supplied text; null when unavailable or unverifiable */
  evidence: string | null;
  /** Explicit section/clause label from the supplied text; null when absent or unverifiable */
  source_location: string | null;
}

/** A single result section from the AI analysis */
export interface ResultSection {
  id: string;
  title: string;
  description?: string;
  content: string | string[] | GroundedFinding[];
  type: "text" | "list" | "checklist" | "grounded-list";
}

/** Full analysis result shape (populated by AI on Day 2) */
export interface AnalysisResult {
  id: string;
  inputMode: InputMode;
  inputText: string;
  timestamp: Date;
  sections: ResultSection[];
}

/** Follow-up Q&A shape */
export interface FollowUpMessage {
  id: string;
  question: string;
  answer?: string;
  timestamp: Date;
}

/** Topic shortcut */
export interface TopicShortcut {
  id: string;
  label: string;
  icon: string;
  examplePrompt: string;
}

/** Comparison mode inputs */
export interface ComparisonInputs {
  textA: string;
  textB: string;
}

/**
 * A single meaningful difference between two legal texts.
 *
 * evidence_a: verbatim excerpt (≤200 chars) from textA only; null when unavailable/unverifiable.
 * evidence_b: verbatim excerpt (≤200 chars) from textB only; null when unavailable/unverifiable.
 * source_location_a: explicit label from textA only; null when absent or unverifiable.
 * source_location_b: explicit label from textB only; null when absent or unverifiable.
 *
 * IMPORTANT: these evidence fields confirm only that the excerpt appears in the
 * corresponding user-supplied text. They do NOT prove legal correctness.
 */
export interface ComparisonDifference {
  topic: string;
  version_a: string;
  version_b: string;
  why_it_may_matter: string;
  evidence_a: string | null;
  evidence_b: string | null;
  source_location_a: string | null;
  source_location_b: string | null;
}

/**
 * Full comparison result returned by the AI for Comparison Mode.
 * Separate from AnalysisResult — do not conflate or merge.
 */
export interface ComparisonResult {
  id: string;
  timestamp: Date;
  summary: string;
  similarities: string[];
  differences: ComparisonDifference[];
  review_points: string[];
  questions: string[];
  confidence_note: string;
}

/** Error details */
export interface AppError {
  code: string;
  message: string;
  retryable: boolean;
}
