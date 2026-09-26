import { describe, it, expect } from "vitest";
import { cn, generateId, truncate, relativeTime, wordCount } from "../utils";

describe("utils.ts helpers", () => {
  describe("cn", () => {
    it("merges class names correctly", () => {
      expect(cn("px-4", "py-2")).toBe("px-4 py-2");
    });

    it("handles falsy and conditional values", () => {
      const condition = false;
      const active = true;
      expect(cn("base-class", condition && "hidden", active && "block", null, undefined)).toBe(
        "base-class block",
      );
    });
  });

  describe("generateId", () => {
    it("generates an id with the requested prefix and hyphen", () => {
      const id = generateId("doc");
      expect(id.startsWith("doc-")).toBe(true);
    });

    it("defaults prefix to cl", () => {
      const id = generateId();
      expect(id.startsWith("cl-")).toBe(true);
    });

    it("generates unique values on subsequent calls", () => {
      const id1 = generateId("item");
      const id2 = generateId("item");
      expect(id1).not.toBe(id2);
    });
  });

  describe("truncate", () => {
    it("returns original text if under limit", () => {
      expect(truncate("Hello world", 20)).toBe("Hello world");
    });

    it("appends ellipsis when text exceeds limit", () => {
      expect(truncate("Hello world from ClauseLens legal assistant", 11)).toBe("Hello world…");
    });
  });

  describe("wordCount", () => {
    it("counts words correctly", () => {
      expect(wordCount("This is a legal clause")).toBe(5);
      expect(wordCount("   Multiple   spaces   between  words  ")).toBe(4);
      expect(wordCount("")).toBe(0);
    });
  });

  describe("relativeTime", () => {
    it("formats dates into readable strings", () => {
      const now = new Date();
      expect(relativeTime(now)).toBe("just now");

      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      expect(relativeTime(tenMinutesAgo)).toBe("10 minutes ago");

      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      expect(relativeTime(twoHoursAgo)).toBe("2 hours ago");
    });
  });
});
