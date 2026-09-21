// ============================================================
// ClauseLens — Gemini API Integration Pipeline
// Uses official @google/genai SDK with gemini-3.8-flash
// ============================================================

import { GoogleGenAI, Type } from "@google/genai";
import {
  CLAUSELENS_SYSTEM_INSTRUCTION,
  CLAUSELENS_COMPARISON_SYSTEM_INSTRUCTION,
  buildUserPrompt,
  buildComparisonPrompt,
} from "@/lib/prompt";
import {
  ClauseLensAnalysisSchema,
  ClauseLensComparisonSchema,
  type ClauseLensAnalysis,
  type ClauseLensComparison,
} from "@/lib/schema";

export type { ClauseLensAnalysis, ClauseLensComparison };
export const GEMINI_MODEL = "gemini-3.8-flash";

/**
 * Checks if an error is a genuine transient, retryable error (rate limit, service overload, network drop)
 */
export function isRetryableError(error: unknown): boolean {
  if (!error) return false;

  const errorObj = error as Record<string, unknown>;
  const message = String(errorObj.message || error || "").toLowerCase();
  const status = Number(errorObj.status || (errorObj.response as Record<string, unknown>)?.status);
  const statusStr = String(errorObj.status || "").toUpperCase();

  // Explicit HTTP status codes for transient service/rate issues
  if (status === 429 || status === 503 || status === 502 || status === 504) {
    return true;
  }

  // gRPC status code UNAVAILABLE
  if (statusStr === "UNAVAILABLE" || message.includes('"status":"unavailable"')) {
    return true;
  }

  // Common transient error strings
  const transientPatterns = [
    "resource_exhausted",
    "rate limit",
    "too many requests",
    "service unavailable",
    "high demand",
    "overloaded",
    "econnreset",
    "etimedout",
    "network error",
    "fetch failed",
    "socket hang up",
  ];

  return transientPatterns.some((pattern) => message.includes(pattern));
}

/**
 * Checks if an error indicates content safety or policy refusal
 */
export function isContentSafetyError(error: unknown): boolean {
  if (!error) return false;
  const message = String((error as Record<string, unknown>)?.message || error || "").toLowerCase();
  return (
    message.includes("safety") ||
    message.includes("blocked") ||
    message.includes("blocklist") ||
    message.includes("prohibited_content") ||
    message.includes("harm_category")
  );
}

/**
 * Initializes GoogleGenAI client with the server-side API key.
 * Throws if the key is missing.
 */
export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    throw new Error("GEMINI_API_KEY is not configured on the server.");
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * Executes a structured content generation call with bounded retry-once on transient errors.
 */
export async function generateAnalysisWithGemini(
  mode: "situation" | "document" | "paste",
  inputText: string,
  client?: GoogleGenAI,
): Promise<ClauseLensAnalysis> {
  const ai = client || getGeminiClient();
  const prompt = buildUserPrompt(mode, inputText);

  const callModel = async (): Promise<string> => {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction: CLAUSELENS_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            simple_terms: {
              type: Type.STRING,
              description: "Plain-language summary of what the document or situation means.",
            },
            important_points: {
              type: Type.ARRAY,
              description: "The key facts, clauses, or rights you should be aware of.",
              items: {
                type: Type.OBJECT,
                properties: {
                  point: {
                    type: Type.STRING,
                    description: "The key finding or fact.",
                  },
                  why_it_matters: {
                    type: Type.STRING,
                    description: "Concise practical explanation of why this finding may deserve attention. Use cautious, non-definitive phrasing.",
                  },
                  evidence: {
                    type: Type.STRING,
                    nullable: true,
                    description: "Verbatim excerpt (≤200 characters) from the user-supplied text that grounds this finding. Null if unavailable, uncertain, or in situation mode.",
                  },
                  source_location: {
                    type: Type.STRING,
                    nullable: true,
                    description: "Explicit section/clause label that appears verbatim in the supplied text (e.g. 'Section 4', 'Payment Terms'). Null if not explicitly present.",
                  },
                },
                required: ["point", "why_it_matters", "evidence", "source_location"],
              },
            },
            review_points: {
              type: Type.ARRAY,
              description: "Areas of ambiguity, risk, or clauses that require closer attention.",
              items: {
                type: Type.OBJECT,
                properties: {
                  point: {
                    type: Type.STRING,
                    description: "The area of concern or ambiguity.",
                  },
                  why_it_matters: {
                    type: Type.STRING,
                    description: "Concise practical explanation of why this warrants review. Use cautious, non-definitive phrasing.",
                  },
                  evidence: {
                    type: Type.STRING,
                    nullable: true,
                    description: "Verbatim excerpt (≤200 characters) from the user-supplied text. Null if unavailable, uncertain, or in situation mode.",
                  },
                  source_location: {
                    type: Type.STRING,
                    nullable: true,
                    description: "Explicit section/clause label that appears verbatim in the supplied text. Null if not explicitly present.",
                  },
                },
                required: ["point", "why_it_matters", "evidence", "source_location"],
              },
            },
            next_steps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Practical, non-definitive actions you may want to consider.",
            },
            checklist: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Practical checklist items to verify or gather.",
            },
            lawyer_questions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Targeted questions to ask a qualified legal professional.",
            },
            sources: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Legal principles, standard frameworks, or relevant regulatory context.",
            },
            confidence_note: {
              type: Type.STRING,
              description: "Explicit statements about jurisdiction, missing facts, and limitations.",
            },
          },
          required: [
            "simple_terms",
            "important_points",
            "review_points",
            "next_steps",
            "checklist",
            "lawyer_questions",
            "sources",
            "confidence_note",
          ],
        },
      },
    });

    const candidate = response.candidates?.[0];
    if (candidate?.finishReason && candidate.finishReason !== "STOP") {
      const reason = candidate.finishReason.toUpperCase();
      if (reason === "SAFETY" || reason === "BLOCKLIST" || reason === "PROHIBITED_CONTENT") {
        throw new Error("Content blocked: The input or response triggered content safety filters.");
      }
    }

    const text = response.text;
    if (!text || text.trim().length === 0) {
      throw new Error("Empty response received from the Gemini model.");
    }
    return text;
  };

  let rawJsonText: string;

  try {
    rawJsonText = await callModel();
  } catch (initialError) {
    if (isRetryableError(initialError)) {
      // Bounded retry-once with a short backoff (500ms)
      await new Promise((resolve) => setTimeout(resolve, 500));
      try {
        rawJsonText = await callModel();
      } catch (retryError) {
        // Only classify as persistent high demand if the retry error is genuinely transient
        if (isRetryableError(retryError)) {
          throw new Error(
            "The AI service is temporarily experiencing high demand. Please wait a moment and try again.",
          );
        }
        // Preserve actual non-transient error if the second failure was different
        throw retryError;
      }
    } else {
      throw initialError;
    }
  }

  // Parse JSON and enforce strict runtime validation
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawJsonText);
  } catch {
    throw new Error("The AI model returned an invalid response format.");
  }

  const validationResult = ClauseLensAnalysisSchema.safeParse(parsedJson);
  if (!validationResult.success) {
    const errorDetails = validationResult.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Schema validation failed: ${errorDetails}`);
  }

  return validationResult.data;
}

/**
 * Executes a structured comparison call with bounded retry-once on transient errors.
 *
 * Both textA and textB are user-supplied and treated as untrusted data.
 * The Gemini model performs the semantic comparison; the server-side verifier
 * independently checks that evidence_a appears in textA and evidence_b appears in textB.
 */
export async function generateComparisonWithGemini(
  textA: string,
  textB: string,
  client?: GoogleGenAI,
): Promise<ClauseLensComparison> {
  const ai = client || getGeminiClient();
  const prompt = buildComparisonPrompt(textA, textB);

  const callModel = async (): Promise<string> => {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction: CLAUSELENS_COMPARISON_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description:
                "A brief overall summary of the relationship between the two texts and the key nature of their differences.",
            },
            similarities: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description:
                "Meaningful provisions, obligations, or language that appear substantially the same in both texts.",
            },
            differences: {
              type: Type.ARRAY,
              description:
                "Meaningful differences between the two texts. Only include substantive differences that may affect obligations, rights, or key terms — not trivial wording or punctuation changes.",
              items: {
                type: Type.OBJECT,
                properties: {
                  topic: {
                    type: Type.STRING,
                    description:
                      "Short label for the topic or area where the texts differ (e.g., 'Payment deadline', 'Termination notice period').",
                  },
                  version_a: {
                    type: Type.STRING,
                    description:
                      "What Text A states about this topic. Use cautious, descriptive phrasing.",
                  },
                  version_b: {
                    type: Type.STRING,
                    description:
                      "What Text B states about this topic. Use cautious, descriptive phrasing.",
                  },
                  why_it_may_matter: {
                    type: Type.STRING,
                    description:
                      "A concise explanation of why this difference may be significant or worth reviewing. Use cautious, non-definitive language. Do NOT assert legal outcomes.",
                  },
                  evidence_a: {
                    type: Type.STRING,
                    nullable: true,
                    description:
                      "A verbatim excerpt (at most 200 characters) from TEXT A ONLY that supports the version_a description. Null if unavailable or uncertain. NEVER use content from Text B here.",
                  },
                  evidence_b: {
                    type: Type.STRING,
                    nullable: true,
                    description:
                      "A verbatim excerpt (at most 200 characters) from TEXT B ONLY that supports the version_b description. Null if unavailable or uncertain. NEVER use content from Text A here.",
                  },
                  source_location_a: {
                    type: Type.STRING,
                    nullable: true,
                    description:
                      "An explicit heading or label that appears verbatim in Text A near this difference (e.g., 'Payment Terms', 'Section 3'). Null if not explicitly present.",
                  },
                  source_location_b: {
                    type: Type.STRING,
                    nullable: true,
                    description:
                      "An explicit heading or label that appears verbatim in Text B near this difference. Null if not explicitly present.",
                  },
                },
                required: [
                  "topic",
                  "version_a",
                  "version_b",
                  "why_it_may_matter",
                  "evidence_a",
                  "evidence_b",
                  "source_location_a",
                  "source_location_b",
                ],
              },
            },
            review_points: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description:
                "Points that may deserve closer attention or review given the differences identified. Use cautious language.",
            },
            questions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description:
                "Questions the user may want to discuss with a qualified legal professional regarding these texts.",
            },
            confidence_note: {
              type: Type.STRING,
              description:
                "Explicit statement about the limitations of this comparison, including jurisdiction uncertainty, missing context, and the recommendation to consult a legal professional.",
            },
          },
          required: [
            "summary",
            "similarities",
            "differences",
            "review_points",
            "questions",
            "confidence_note",
          ],
        },
      },
    });

    const candidate = response.candidates?.[0];
    if (candidate?.finishReason && candidate.finishReason !== "STOP") {
      const reason = candidate.finishReason.toUpperCase();
      if (reason === "SAFETY" || reason === "BLOCKLIST" || reason === "PROHIBITED_CONTENT") {
        throw new Error("Content blocked: The input or response triggered content safety filters.");
      }
    }

    const text = response.text;
    if (!text || text.trim().length === 0) {
      throw new Error("Empty response received from the Gemini model.");
    }
    return text;
  };

  let rawJsonText: string;

  try {
    rawJsonText = await callModel();
  } catch (initialError) {
    if (isRetryableError(initialError)) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      try {
        rawJsonText = await callModel();
      } catch (retryError) {
        if (isRetryableError(retryError)) {
          throw new Error(
            "The AI service is temporarily experiencing high demand. Please wait a moment and try again.",
          );
        }
        throw retryError;
      }
    } else {
      throw initialError;
    }
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawJsonText);
  } catch {
    throw new Error("The AI model returned an invalid response format.");
  }

  const validationResult = ClauseLensComparisonSchema.safeParse(parsedJson);
  if (!validationResult.success) {
    const errorDetails = validationResult.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Schema validation failed: ${errorDetails}`);
  }

  return validationResult.data;
}
