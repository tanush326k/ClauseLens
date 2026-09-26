import { describe, it, expect } from "vitest";
import {
  CLAUSELENS_SYSTEM_INSTRUCTION,
  CLAUSELENS_COMPARISON_SYSTEM_INSTRUCTION,
  buildUserPrompt,
  buildComparisonPrompt,
} from "../prompt";

describe("prompt.ts builders and safety instructions", () => {
  describe("CLAUSELENS_SYSTEM_INSTRUCTION", () => {
    it("contains clear educational and non-definitive phrasing directives", () => {
      expect(CLAUSELENS_SYSTEM_INSTRUCTION.toLowerCase()).toContain("educational");
      expect(CLAUSELENS_SYSTEM_INSTRUCTION).toContain("NEVER make definitive legal conclusions");
      expect(CLAUSELENS_SYSTEM_INSTRUCTION).toContain("DO NOT hallucinate or invent");
    });

    it("prohibits fabricating evidence or section numbers", () => {
      expect(CLAUSELENS_SYSTEM_INSTRUCTION).toContain("evidence");
      expect(CLAUSELENS_SYSTEM_INSTRUCTION).toContain("verbatim");
    });
  });

  describe("CLAUSELENS_COMPARISON_SYSTEM_INSTRUCTION", () => {
    it("instructs balanced, neutral comparison between Version A and Version B", () => {
      expect(CLAUSELENS_COMPARISON_SYSTEM_INSTRUCTION).toContain("TEXT A");
      expect(CLAUSELENS_COMPARISON_SYSTEM_INSTRUCTION).toContain("TEXT B");
      expect(CLAUSELENS_COMPARISON_SYSTEM_INSTRUCTION).toContain("You do NOT decide which version is legally better");
    });
  });

  describe("buildUserPrompt", () => {
    it("wraps situation text in strict security delimiters", () => {
      const prompt = buildUserPrompt("situation", "Landlord demanded an unexpected fee.");
      expect(prompt).toContain("<<<USER_LEGAL_CONTENT>>>");
      expect(prompt).toContain("<<<END_USER_LEGAL_CONTENT>>>");
      expect(prompt).toContain("Landlord demanded an unexpected fee.");
      expect(prompt).toContain("situation");
    });

    it("includes paste mode instructions when mode is paste", () => {
      const prompt = buildUserPrompt("paste", "Tenant must surrender premises clean.");
      expect(prompt).toContain("<<<USER_LEGAL_CONTENT>>>");
      expect(prompt).toContain("Tenant must surrender premises clean.");
      expect(prompt).toContain("Quote the text verbatim");
    });
  });

  describe("buildComparisonPrompt", () => {
    it("wraps both textA and textB in distinct isolated delimiters", () => {
      const prompt = buildComparisonPrompt(
        "Notice must be 30 days.",
        "Notice must be 7 days."
      );
      expect(prompt).toContain("<<<TEXT_A>>>");
      expect(prompt).toContain("Notice must be 30 days.");
      expect(prompt).toContain("<<<END_TEXT_A>>>");
      expect(prompt).toContain("<<<TEXT_B>>>");
      expect(prompt).toContain("Notice must be 7 days.");
      expect(prompt).toContain("<<<END_TEXT_B>>>");
    });
  });
});
