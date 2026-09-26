import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  isRetryableError,
  isContentSafetyError,
  getGeminiClient,
  GEMINI_MODEL,
  FALLBACK_MODEL,
} from "../gemini";

describe("gemini.ts helpers", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("Model configurations", () => {
    it("defines valid default and fallback model strings", () => {
      expect(typeof GEMINI_MODEL).toBe("string");
      expect(GEMINI_MODEL.length).toBeGreaterThan(0);
      expect(typeof FALLBACK_MODEL).toBe("string");
      expect(FALLBACK_MODEL.length).toBeGreaterThan(0);
    });
  });

  describe("isRetryableError", () => {
    it("returns true for standard HTTP retryable codes (429, 503, 502, 504)", () => {
      expect(isRetryableError({ status: 429 })).toBe(true);
      expect(isRetryableError({ status: 503 })).toBe(true);
      expect(isRetryableError({ status: 502 })).toBe(true);
      expect(isRetryableError({ status: 504 })).toBe(true);
      expect(isRetryableError({ response: { status: 503 } })).toBe(true);
    });

    it("returns true for gRPC status UNAVAILABLE", () => {
      expect(isRetryableError({ status: "UNAVAILABLE" })).toBe(true);
      expect(isRetryableError(new Error('{"status":"unavailable"}'))).toBe(true);
    });

    it("returns true for high demand and transient network error messages", () => {
      expect(isRetryableError(new Error("This model is currently experiencing high demand"))).toBe(true);
      expect(isRetryableError(new Error("Resource_exhausted: quota exceeded"))).toBe(true);
      expect(isRetryableError(new Error("Rate limit exceeded"))).toBe(true);
      expect(isRetryableError(new Error("ETIMEDOUT connection lost"))).toBe(true);
      expect(isRetryableError(new Error("Fetch failed"))).toBe(true);
      expect(isRetryableError(new Error("ECONNRESET"))).toBe(true);
    });

    it("returns false for non-retryable errors (400, 401, 404, bad input)", () => {
      expect(isRetryableError({ status: 400 })).toBe(false);
      expect(isRetryableError({ status: 401 })).toBe(false);
      expect(isRetryableError({ status: 404 })).toBe(false);
      expect(isRetryableError(new Error("Invalid argument: prompt is required"))).toBe(false);
      expect(isRetryableError(null)).toBe(false);
      expect(isRetryableError(undefined)).toBe(false);
    });
  });

  describe("isContentSafetyError", () => {
    it("returns true for safety filter and blocklist keywords", () => {
      expect(isContentSafetyError(new Error("Content blocked by safety filters"))).toBe(true);
      expect(isContentSafetyError(new Error("Triggered blocklist filter"))).toBe(true);
      expect(isContentSafetyError(new Error("prohibited_content category"))).toBe(true);
      expect(isContentSafetyError(new Error("harm_category detected"))).toBe(true);
    });

    it("returns false for standard errors", () => {
      expect(isContentSafetyError(new Error("Network timeout"))).toBe(false);
      expect(isContentSafetyError(null)).toBe(false);
    });
  });

  describe("getGeminiClient", () => {
    it("throws if GEMINI_API_KEY is not set", () => {
      delete process.env.GEMINI_API_KEY;
      expect(() => getGeminiClient()).toThrow("GEMINI_API_KEY is not configured");
    });

    it("throws if GEMINI_API_KEY is set to placeholder value", () => {
      process.env.GEMINI_API_KEY = "your_gemini_api_key_here";
      expect(() => getGeminiClient()).toThrow("GEMINI_API_KEY is not configured");
    });

    it("returns client instance when key is present", () => {
      process.env.GEMINI_API_KEY = "test_actual_key_12345";
      const client = getGeminiClient();
      expect(client).toBeDefined();
    });
  });
});
