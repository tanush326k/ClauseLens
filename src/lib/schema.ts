import { z } from "zod";

// ============================================================
// ClauseLens — Structured Schemas & Runtime Validation
// ============================================================

export const MAX_INPUT_CHARACTERS = 8000;
export const MIN_COMPARISON_CHARACTERS = 20;

/** Client request schema for /api/analyze (understand modes) */
export const AnalyzeRequestSchema = z.object({
  mode: z.enum(["situation", "document", "paste"]),
  text: z
    .string()
    .transform((val) => val.trim())
    .refine((val) => val.length > 0, {
      message: "Input text cannot be empty or whitespace only.",
    })
    .refine((val) => val.length <= MAX_INPUT_CHARACTERS, {
      message: `Input exceeds the maximum allowed size of ${MAX_INPUT_CHARACTERS.toLocaleString()} characters. Please reduce the length of your text.`,
    }),
});

export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;

/**
 * A single grounded finding from the structured AI response.
 *
 * evidence: verbatim excerpt ≤ 200 chars from the supplied text, or null.
 * source_location: explicit section/clause identifier from the supplied text, or null.
 *
 * Both fields are validated again by the server-side verifier before being
 * returned to the client; an unverifiable excerpt is silently set to null.
 */
export const GroundedFindingSchema = z.object({
  point: z.string().min(1, "point must not be empty"),
  why_it_matters: z.string().min(1, "why_it_matters must not be empty"),
  // Max 200 chars enforced here as first-layer defense; server verifier applies additionally
  evidence: z.string().max(200, "evidence exceeds maximum 200 characters").nullable(),
  source_location: z.string().max(100, "source_location exceeds maximum length").nullable(),
});

export type GroundedFinding = z.infer<typeof GroundedFindingSchema>;

/** Real GenAI Structured Response Schema */
export const ClauseLensAnalysisSchema = z.object({
  simple_terms: z
    .string()
    .min(1, "simple_terms must not be empty"),
  important_points: z
    .array(GroundedFindingSchema)
    .min(1, "important_points must contain at least one item"),
  review_points: z
    .array(GroundedFindingSchema)
    .default([]),
  next_steps: z
    .array(z.string())
    .min(1, "next_steps must contain at least one item"),
  checklist: z
    .array(z.string())
    .default([]),
  lawyer_questions: z
    .array(z.string())
    .default([]),
  sources: z
    .array(z.string())
    .default([]),
  confidence_note: z
    .string()
    .default(""),
});

export type ClauseLensAnalysis = z.infer<typeof ClauseLensAnalysisSchema>;

// ============================================================
// Comparison Mode Schemas
// ============================================================

/**
 * Client request schema for comparison mode.
 * Validates textA and textB independently — different error messages per field.
 */
export const CompareRequestSchema = z.object({
  mode: z.literal("comparison"),
  textA: z
    .string()
    .transform((val) => val.trim())
    .refine((val) => val.length > 0, {
      message: "Text A cannot be empty.",
    })
    .refine((val) => val.length >= MIN_COMPARISON_CHARACTERS, {
      message: `Text A must be at least ${MIN_COMPARISON_CHARACTERS} characters.`,
    })
    .refine((val) => val.length <= MAX_INPUT_CHARACTERS, {
      message: `Text A exceeds the maximum allowed size of ${MAX_INPUT_CHARACTERS.toLocaleString()} characters.`,
    }),
  textB: z
    .string()
    .transform((val) => val.trim())
    .refine((val) => val.length > 0, {
      message: "Text B cannot be empty.",
    })
    .refine((val) => val.length >= MIN_COMPARISON_CHARACTERS, {
      message: `Text B must be at least ${MIN_COMPARISON_CHARACTERS} characters.`,
    })
    .refine((val) => val.length <= MAX_INPUT_CHARACTERS, {
      message: `Text B exceeds the maximum allowed size of ${MAX_INPUT_CHARACTERS.toLocaleString()} characters.`,
    }),
});

export type CompareRequest = z.infer<typeof CompareRequestSchema>;

/**
 * Zod schema for a single comparison difference.
 *
 * evidence_a: verbatim excerpt (≤200 chars) from textA; null when unavailable.
 * evidence_b: verbatim excerpt (≤200 chars) from textB; null when unavailable.
 * source_location_a: explicit heading/label from textA; null when absent.
 * source_location_b: explicit heading/label from textB; null when absent.
 *
 * Server-side verifier enforces that evidence_a comes from textA and
 * evidence_b comes from textB. Cross-contamination is rejected.
 */
export const ComparisonDifferenceSchema = z.object({
  topic: z.string().min(1, "topic must not be empty"),
  version_a: z.string().min(1, "version_a must not be empty"),
  version_b: z.string().min(1, "version_b must not be empty"),
  why_it_may_matter: z.string().min(1, "why_it_may_matter must not be empty"),
  evidence_a: z.string().max(200, "evidence_a exceeds 200 characters").nullable(),
  evidence_b: z.string().max(200, "evidence_b exceeds 200 characters").nullable(),
  source_location_a: z.string().max(100).nullable(),
  source_location_b: z.string().max(100).nullable(),
});

export type ComparisonDifference = z.infer<typeof ComparisonDifferenceSchema>;

/** Structured comparison output from Gemini */
export const ClauseLensComparisonSchema = z.object({
  summary: z.string().min(1, "summary must not be empty"),
  similarities: z.array(z.string()).default([]),
  differences: z.array(ComparisonDifferenceSchema).default([]),
  review_points: z.array(z.string()).default([]),
  questions: z.array(z.string()).default([]),
  confidence_note: z.string().default(""),
});

export type ClauseLensComparison = z.infer<typeof ClauseLensComparisonSchema>;

