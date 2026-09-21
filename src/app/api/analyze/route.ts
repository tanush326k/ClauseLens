import { NextRequest, NextResponse } from "next/server";
import { AnalyzeRequestSchema, CompareRequestSchema } from "@/lib/schema";
import { generateAnalysisWithGemini, generateComparisonWithGemini } from "@/lib/gemini";
import { generateId } from "@/lib/utils";
import type { AnalysisResult, ResultSection, InputMode, GroundedFinding, ComparisonResult, ComparisonDifference } from "@/types";

export const dynamic = "force-dynamic";

// ============================================================
// Evidence Verification Utilities
//
// These functions prove only that the returned text occurs in
// the user's supplied input. They do NOT prove that the finding
// is legally correct, that the document is authentic, or that
// the law applies. Do not describe this as "verified legal evidence."
// ============================================================

/**
 * Normalize text for robust substring comparison.
 *
 * Applied to both the evidence/location string and the source text before
 * comparison. Tolerates common harmless formatting differences:
 *   - Unicode normalization (NFC) to handle composed/decomposed characters
 *   - Lowercase for case-insensitive matching
 *   - Collapse whitespace (spaces, tabs, newlines, carriage returns)
 *   - Normalize common smart/typographic quote variants to straight quotes
 *   - Normalize em-dash, en-dash, figure dash to hyphen
 *
 * Does NOT strip all punctuation — legal text uses punctuation meaningfully.
 * Does NOT use fuzzy/semantic matching — strict substring only.
 */
function normalizeForVerification(text: string): string {
  return (
    text
      // Unicode normalization: ensure composed form (NFC) for consistent codepoints
      .normalize("NFC")
      // Normalize smart/typographic single quotes → straight apostrophe
      .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'")
      // Normalize smart/typographic double quotes → straight double quote
      .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"')
      // Normalize em-dash, en-dash, figure dash, non-breaking hyphen → hyphen
      .replace(/[\u2014\u2013\u2012\u2011]/g, "-")
      // Collapse all whitespace (including newlines and tabs) to a single space
      .replace(/[\s\r\n]+/g, " ")
      // Trim leading/trailing whitespace
      .trim()
      // Lowercase for case-insensitive comparison
      .toLowerCase()
  );
}

/**
 * Verify that an evidence excerpt actually appears in the supplied source text.
 *
 * Returns:
 *   - The original (unnormalized) evidence string if verified
 *   - null if evidence is null, exceeds 200 chars, or cannot be found in the source text
 *
 * Evidence exceeding 200 characters is nulled — NOT truncated. Truncating
 * a model-generated quotation could alter verification semantics.
 */
function verifyEvidence(evidence: string | null, sourceText: string): string | null {
  if (!evidence) return null;

  // Enforce the 200-char limit server-side as a second defense layer.
  // The Zod schema is the first; this catches anything that slips through.
  if (evidence.length > 200) return null;

  const normEvidence = normalizeForVerification(evidence);
  const normSource = normalizeForVerification(sourceText);

  // Empty normalized evidence is not a useful anchor
  if (normEvidence.length === 0) return null;

  return normSource.includes(normEvidence) ? evidence : null;
}

/**
 * Verify that a source_location label actually appears in the supplied source text.
 *
 * Returns the original location string if verified, or null otherwise.
 * This prevents invented section numbers, page numbers, and legal citations
 * from reaching the client.
 */
function verifySourceLocation(location: string | null, sourceText: string): string | null {
  if (!location) return null;

  const normLocation = normalizeForVerification(location);
  const normSource = normalizeForVerification(sourceText);

  if (normLocation.length === 0) return null;

  return normSource.includes(normLocation) ? location : null;
}

/**
 * Apply evidence sanitization for a single finding based on input mode.
 *
 * Situation mode: forces evidence and source_location to null server-side
 * regardless of what Gemini returned. This is enforced here, not only through
 * prompting, because server-side enforcement is the reliable safety layer.
 *
 * Paste/document mode: runs verifyEvidence and verifySourceLocation.
 * Unverifiable fields are silently set to null — the analysis is NOT failed.
 */
function sanitizeFinding(
  finding: GroundedFinding,
  mode: "situation" | "document" | "paste",
  sourceText: string,
): GroundedFinding {
  if (mode === "situation") {
    // No document was supplied; evidence cannot be grounded in a document.
    return { ...finding, evidence: null, source_location: null };
  }

  // Paste/document mode: verify both fields against the supplied text.
  return {
    ...finding,
    evidence: verifyEvidence(finding.evidence, sourceText),
    source_location: verifySourceLocation(finding.source_location, sourceText),
  };
}

/**
 * Apply independent A/B evidence sanitization for a comparison difference.
 *
 * evidence_a and source_location_a are verified against textA ONLY.
 * evidence_b and source_location_b are verified against textB ONLY.
 * Cross-contamination between A and B is impossible at this layer.
 *
 * Note: This confirms only that the excerpt appears in the corresponding
 * user-supplied text — it does NOT prove legal correctness.
 */
function sanitizeComparisonDifference(
  diff: ComparisonDifference,
  textA: string,
  textB: string,
): ComparisonDifference {
  return {
    ...diff,
    // A-side: verified only against textA
    evidence_a: verifyEvidence(diff.evidence_a, textA),
    source_location_a: verifySourceLocation(diff.source_location_a, textA),
    // B-side: verified only against textB
    evidence_b: verifyEvidence(diff.evidence_b, textB),
    source_location_b: verifySourceLocation(diff.source_location_b, textB),
  };
}

// ============================================================
// POST /api/analyze
// ============================================================

export async function POST(req: NextRequest) {
  try {
    // 1. Parse and validate request JSON
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_JSON",
            message: "Malformed request payload. Please provide valid JSON.",
          },
        },
        { status: 400 },
      );
    }

    // ── Branch: Comparison Mode ────────────────────────────────
    //
    // Comparison requests carry mode="comparison" with textA/textB.
    // They are validated and processed entirely separately from
    // Understand-mode requests. The existing Understand pipeline is
    // not touched by this branch.
    const bodyRecord = body as Record<string, unknown>;
    if (bodyRecord?.mode === "comparison") {
      return handleComparisonRequest(body);
    }

    // ── Understand Mode (existing pipeline) ───────────────────
    const validation = AnalyzeRequestSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || "Invalid input parameters.";
      return NextResponse.json(
        {
          error: {
            code: "INVALID_INPUT",
            message: firstError,
          },
        },
        { status: 400 },
      );
    }

    const { mode, text } = validation.data;

    // 2. Verify server-side API key presence
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      return NextResponse.json(
        {
          error: {
            code: "CONFIG_ERROR",
            message:
              "ClauseLens is not configured with a valid Gemini API key on the server. Please set GEMINI_API_KEY.",
          },
        },
        { status: 500 },
      );
    }

    // 3. Call Gemini with strict structured output and bounded retry
    const analysis = await generateAnalysisWithGemini(mode, text);

    // 4. Apply server-side evidence verification pipeline
    //    Sequence: Gemini response → Zod validation (in gemini.ts) → verify evidence
    //    → verify source_location → return sanitized analysis
    //
    //    For situation mode: evidence and source_location are forced to null regardless
    //    of Gemini output — enforced here, not only through prompting.
    //    For paste/document mode: each finding is checked via normalised substring match.
    //    Verification failures silently null the field; the analysis is not failed.
    const sanitizedImportantPoints = analysis.important_points.map((f) =>
      sanitizeFinding(f, mode, text),
    );
    const sanitizedReviewPoints = analysis.review_points.map((f) =>
      sanitizeFinding(f, mode, text),
    );

    // 5. Map structured response to application ResultSection format
    const uiMode: InputMode = mode === "situation" ? "situation" : "paste";

    // Format sources & confidence note into readable text for the Context & Sources card
    const formattedSources = [
      analysis.sources.length > 0
        ? analysis.sources.map((s) => `• ${s}`).join("\n")
        : "Standard principles of general contract, tenancy, and statutory law.",
      analysis.confidence_note
        ? `Scope & Limitations:\n${analysis.confidence_note}`
        : null,
    ]
      .filter(Boolean)
      .join("\n\n");

    const sections: ResultSection[] = [
      {
        id: "simple_terms",
        title: "In simple terms",
        description: "A plain-language summary of what this means",
        content: analysis.simple_terms,
        type: "text",
      },
      {
        id: "important_points",
        title: "Important points",
        description: "The key things you should be aware of",
        content: sanitizedImportantPoints,
        type: "grounded-list",
      },
      {
        id: "review_points",
        title: "Points to review",
        description: "Areas that may need closer attention",
        content: sanitizedReviewPoints,
        type: "grounded-list",
      },
      {
        id: "next_steps",
        title: "Possible next steps",
        description: "Actions you may want to consider",
        content: analysis.next_steps,
        type: "list",
      },
      {
        id: "checklist",
        title: "Your checklist",
        description: "Practical items to work through",
        content: analysis.checklist,
        type: "checklist",
      },
      {
        id: "questions",
        title: "Questions for a legal professional",
        description: "What to ask if you seek professional advice",
        content: analysis.lawyer_questions,
        type: "list",
      },
      {
        id: "sources",
        title: "Context & sources",
        description: "Background information and references",
        content: formattedSources,
        type: "text",
      },
    ];

    const result: AnalysisResult = {
      id: generateId("res"),
      inputMode: uiMode,
      inputText: text,
      timestamp: new Date(),
      sections,
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : String(error);

    // Map errors safely without leaking internal stack traces or secrets
    if (rawMessage.includes("Content blocked") || rawMessage.includes("safety filter")) {
      return NextResponse.json(
        {
          error: {
            code: "CONTENT_FLAGGED",
            message:
              "The submitted text could not be processed due to content safety constraints. Please provide standard legal document text or a factual situation description.",
          },
        },
        { status: 422 },
      );
    }

    if (rawMessage.includes("Schema validation failed")) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_FAILED",
            message:
              "The AI response could not be verified against our legal safety schema. Please try submitting again.",
          },
        },
        { status: 502 },
      );
    }

    if (
      rawMessage.includes("temporarily experiencing high demand") ||
      rawMessage.includes("rate limit") ||
      rawMessage.includes("RESOURCE_EXHAUSTED") ||
      rawMessage.includes("too many requests") ||
      rawMessage.includes('"status":"UNAVAILABLE"') ||
      rawMessage.includes("status: 503") ||
      rawMessage.includes("code: 503")
    ) {
      return NextResponse.json(
        {
          error: {
            code: "SERVICE_BUSY",
            message:
              "The analysis service is currently experiencing high demand. Please try again in a few seconds.",
          },
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      {
        error: {
          code: "ANALYSIS_FAILED",
          message:
            "We were unable to complete the analysis at this time. Please check your text and try again.",
        },
      },
      { status: 500 },
    );
  }
}

// ============================================================
// Comparison Request Handler
// Separated from POST to keep the logic isolated and testable.
// ============================================================

async function handleComparisonRequest(body: unknown): Promise<NextResponse> {
  try {
    // 1. Validate comparison-specific schema (textA + textB)
    const validation = CompareRequestSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || "Invalid comparison input.";
      return NextResponse.json(
        {
          error: {
            code: "INVALID_INPUT",
            message: firstError,
          },
        },
        { status: 400 },
      );
    }

    const { textA, textB } = validation.data;

    // 2. Verify server-side API key presence
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      return NextResponse.json(
        {
          error: {
            code: "CONFIG_ERROR",
            message:
              "ClauseLens is not configured with a valid Gemini API key on the server. Please set GEMINI_API_KEY.",
          },
        },
        { status: 500 },
      );
    }

    // 3. Call Gemini for semantic comparison with bounded retry
    const comparison = await generateComparisonWithGemini(textA, textB);

    // 4. Apply server-side A/B evidence verification
    //    Pipeline: Gemini → Zod (in gemini.ts) → verify evidence_a against textA
    //                                           → verify evidence_b against textB
    //                                           → verify source_location_a against textA
    //                                           → verify source_location_b against textB
    //                                           → sanitized result
    //
    //    Cross-source verification is structurally impossible:
    //    sanitizeComparisonDifference only ever calls verifyEvidence(evidence_a, textA)
    //    and verifyEvidence(evidence_b, textB). The other text is never accessed.
    const sanitizedDifferences = comparison.differences.map((diff) =>
      sanitizeComparisonDifference(diff, textA, textB),
    );

    // 5. Build ComparisonResult — separate type from AnalysisResult
    const result: ComparisonResult = {
      id: generateId("cmp"),
      timestamp: new Date(),
      summary: comparison.summary,
      similarities: comparison.similarities,
      differences: sanitizedDifferences,
      review_points: comparison.review_points,
      questions: comparison.questions,
      confidence_note: comparison.confidence_note,
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : String(error);

    if (rawMessage.includes("Content blocked") || rawMessage.includes("safety filter")) {
      return NextResponse.json(
        {
          error: {
            code: "CONTENT_FLAGGED",
            message:
              "The submitted text could not be processed due to content safety constraints. Please provide standard legal document text.",
          },
        },
        { status: 422 },
      );
    }

    if (rawMessage.includes("Schema validation failed")) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_FAILED",
            message:
              "The AI response could not be verified against our comparison safety schema. Please try submitting again.",
          },
        },
        { status: 502 },
      );
    }

    if (
      rawMessage.includes("temporarily experiencing high demand") ||
      rawMessage.includes("rate limit") ||
      rawMessage.includes("RESOURCE_EXHAUSTED") ||
      rawMessage.includes("too many requests") ||
      rawMessage.includes('"status":"UNAVAILABLE"') ||
      rawMessage.includes("status: 503") ||
      rawMessage.includes("code: 503")
    ) {
      return NextResponse.json(
        {
          error: {
            code: "SERVICE_BUSY",
            message:
              "The comparison service is currently experiencing high demand. Please try again in a few seconds.",
          },
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      {
        error: {
          code: "ANALYSIS_FAILED",
          message:
            "We were unable to complete the comparison at this time. Please check your texts and try again.",
        },
      },
      { status: 500 },
    );
  }
}
