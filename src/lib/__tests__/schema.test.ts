import { describe, it, expect } from "vitest";
import {
  AnalyzeRequestSchema,
  CompareRequestSchema,
  ClauseLensAnalysisSchema,
  ClauseLensComparisonSchema,
  GroundedFindingSchema,
  ComparisonDifferenceSchema,
  MIN_COMPARISON_CHARACTERS,
  MAX_INPUT_CHARACTERS,
} from "../schema";

describe("Schema Constants", () => {
  it("defines expected character bounds", () => {
    expect(MIN_COMPARISON_CHARACTERS).toBe(20);
    expect(MAX_INPUT_CHARACTERS).toBe(8000);
  });
});

describe("AnalyzeRequestSchema", () => {
  it("accepts valid situation mode input", () => {
    const input = {
      mode: "situation",
      text: "I signed a commercial lease and the landlord wants to increase rent without notice.",
    };
    const result = AnalyzeRequestSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("accepts valid paste/document mode input", () => {
    const input = {
      mode: "paste",
      text: "The Tenant shall pay a security deposit of $1,000 upon execution of this Lease.",
    };
    const result = AnalyzeRequestSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("rejects empty text", () => {
    const input = {
      mode: "paste",
      text: "",
    };
    const result = AnalyzeRequestSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("cannot be empty");
    }
  });

  it("rejects text exceeding MAX_INPUT_CHARACTERS", () => {
    const input = {
      mode: "paste",
      text: "A".repeat(8001),
    };
    const result = AnalyzeRequestSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("maximum allowed size");
    }
  });

  it("rejects whitespace-only text", () => {
    const input = {
      mode: "situation",
      text: "   ".repeat(10),
    };
    const result = AnalyzeRequestSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects invalid mode value", () => {
    const input = {
      mode: "invalid_mode",
      text: "This is valid length text for legal analysis testing.",
    };
    const result = AnalyzeRequestSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

describe("CompareRequestSchema", () => {
  it("accepts valid comparison input", () => {
    const input = {
      mode: "comparison",
      textA: "Either party may terminate upon 30 days prior written notice.",
      textB: "The company may terminate immediately with 7 days written notice.",
    };
    const result = CompareRequestSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("rejects when textA is below MIN_COMPARISON_CHARACTERS", () => {
    const input = {
      mode: "comparison",
      textA: "Too short",
      textB: "The company may terminate immediately with 7 days written notice.",
    };
    const result = CompareRequestSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("at least 20 characters");
    }
  });

  it("rejects when textB is missing or too short", () => {
    const input = {
      mode: "comparison",
      textA: "Either party may terminate upon 30 days prior written notice.",
      textB: "",
    };
    const result = CompareRequestSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects when either text exceeds 8,000 characters", () => {
    const input = {
      mode: "comparison",
      textA: "A".repeat(8001),
      textB: "The company may terminate immediately with 7 days written notice.",
    };
    const result = CompareRequestSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

describe("GroundedFindingSchema", () => {
  it("validates finding with non-null evidence and location", () => {
    const finding = {
      point: "Payment is required within 30 days.",
      why_it_matters: "Late payment triggers statutory interest.",
      evidence: "within 30 days of receiving the invoice",
      source_location: "Section 4 - Payment",
    };
    const result = GroundedFindingSchema.safeParse(finding);
    expect(result.success).toBe(true);
  });

  it("validates finding with null evidence and null location (situation mode)", () => {
    const finding = {
      point: "No explicit notice period provided.",
      why_it_matters: "Subject to local statutory tenancy protections.",
      evidence: null,
      source_location: null,
    };
    const result = GroundedFindingSchema.safeParse(finding);
    expect(result.success).toBe(true);
  });

  it("rejects finding when required fields are missing", () => {
    const finding = {
      why_it_matters: "Missing the point field.",
      evidence: null,
      source_location: null,
    };
    const result = GroundedFindingSchema.safeParse(finding);
    expect(result.success).toBe(false);
  });
});

describe("ComparisonDifferenceSchema", () => {
  it("validates difference structure with dual-source citations", () => {
    const diff = {
      topic: "Notice period duration",
      version_a: "Requires 30 days prior written notice.",
      version_b: "Requires 7 days prior written notice.",
      why_it_may_matter: "Significantly reduces preparation time before exit.",
      evidence_a: "30 days prior written notice",
      evidence_b: "7 days written notice",
      source_location_a: "Clause 12",
      source_location_b: "Section 8",
    };
    const result = ComparisonDifferenceSchema.safeParse(diff);
    expect(result.success).toBe(true);
  });
});

describe("ClauseLensAnalysisSchema", () => {
  it("validates complete structured analysis payload", () => {
    const payload = {
      simple_terms: "Plain terms explanation.",
      important_points: [
        {
          point: "Point 1",
          why_it_matters: "Why 1",
          evidence: "Excerpt",
          source_location: "Section 1",
        },
      ],
      review_points: [
        {
          point: "Review 1",
          why_it_matters: "Why review 1",
          evidence: null,
          source_location: null,
        },
      ],
      next_steps: ["Step 1", "Step 2"],
      checklist: ["Item 1", "Item 2"],
      lawyer_questions: ["Question 1", "Question 2"],
      sources: ["Contract Principles"],
      confidence_note: "Jurisdiction not specified.",
    };
    const result = ClauseLensAnalysisSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it("fails if any core section is missing", () => {
    const payload = {
      simple_terms: "Plain terms.",
      // missing important_points
      review_points: [],
      next_steps: [],
      checklist: [],
      lawyer_questions: [],
      sources: [],
      confidence_note: "Note",
    };
    const result = ClauseLensAnalysisSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });
});

describe("ClauseLensComparisonSchema", () => {
  it("validates complete structured comparison payload", () => {
    const payload = {
      summary: "Comparison summary.",
      similarities: ["Both require written notice."],
      differences: [
        {
          topic: "Notice length",
          version_a: "30 days",
          version_b: "7 days",
          why_it_may_matter: "Short window",
          evidence_a: "30 days",
          evidence_b: "7 days",
          source_location_a: null,
          source_location_b: null,
        },
      ],
      review_points: ["Check local minimums."],
      questions: ["Is 7 days legal under state law?"],
      confidence_note: "Informational comparison only.",
    };
    const result = ClauseLensComparisonSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });
});
