import { describe, expect, it } from "bun:test";
import { normalizeConfusables } from "../src/confusables";

describe("normalizeConfusables", () => {
  describe("basic ASCII normalization", () => {
    it("should normalize digit 0 to letter O", () => {
      expect(normalizeConfusables("0")).toBe("O");
      expect(normalizeConfusables("00")).toBe("OO");
      expect(normalizeConfusables("l0gin")).toBe("lOgin");
    });

    it("should normalize digit 1 to letter l", () => {
      expect(normalizeConfusables("1")).toBe("l");
      expect(normalizeConfusables("11")).toBe("ll");
      // Note: 'm' also gets normalized to 'rn' in the confusables data
      expect(normalizeConfusables("admin1")).toBe("adrninl");
    });

    it("should normalize both 0 and 1 in the same string", () => {
      expect(normalizeConfusables("10")).toBe("lO");
      expect(normalizeConfusables("01")).toBe("Ol");
      expect(normalizeConfusables("1001")).toBe("lOOl");
    });
  });

  describe("empty and single character strings", () => {
    it("should return empty string for empty input", () => {
      expect(normalizeConfusables("")).toBe("");
    });

    it("should return non-confusable characters unchanged", () => {
      expect(normalizeConfusables("a")).toBe("a");
      expect(normalizeConfusables("Z")).toBe("Z");
      expect(normalizeConfusables("!")).toBe("!");
    });
  });

  describe("canonical characters", () => {
    it("should keep canonical characters unchanged", () => {
      expect(normalizeConfusables("O")).toBe("O");
      expect(normalizeConfusables("l")).toBe("l");
      expect(normalizeConfusables("OOO")).toBe("OOO");
      expect(normalizeConfusables("lll")).toBe("lll");
    });

    it("should normalize confusables to their canonical form", () => {
      // Confusable 0 -> canonical O
      expect(normalizeConfusables("0O0")).toBe("OOO");
      // Confusable 1 -> canonical l
      expect(normalizeConfusables("1l1")).toBe("lll");
    });
  });

  describe("mixed content strings", () => {
    it("should normalize only confusable characters in mixed strings", () => {
      expect(normalizeConfusables("hello")).toBe("hello");
      expect(normalizeConfusables("he1lo")).toBe("hello");
      expect(normalizeConfusables("g00gle")).toBe("gOOgle");
    });

    it("should handle strings with punctuation and confusables", () => {
      expect(normalizeConfusables("test@1.0")).toBe("test@l.O");
      expect(normalizeConfusables("user_1")).toBe("user_l");
    });

    it("should handle strings with spaces", () => {
      expect(normalizeConfusables("l0gin page")).toBe("lOgin page");
    });
  });

  describe("real-world homoglyph scenarios", () => {
    it("should normalize common brand impersonation attempts", () => {
      expect(normalizeConfusables("paypa1")).toBe("paypal");
      // 'm' -> 'rn' in confusables data
      expect(normalizeConfusables("amaz0n")).toBe("arnazOn");
      expect(normalizeConfusables("micr0s0ft")).toBe("rnicrOsOft");
    });

    it("should normalize login/admin variations", () => {
      // 'm' -> 'rn' in confusables data
      expect(normalizeConfusables("adm1n")).toBe("adrnln");
      expect(normalizeConfusables("r00t")).toBe("rOOt");
    });

    it("should normalize email addresses with confusables", () => {
      // Note: 'm' -> 'rn' in confusables data
      expect(normalizeConfusables("user1@example.c0m")).toBe("userl@exarnple.cOrn");
    });
  });

  describe("special characters and unicode", () => {
    it("should handle strings with regular special characters", () => {
      // Note: '%' -> 'º/₀' in confusables data
      expect(normalizeConfusables("test!@#$%")).toBe("test!@#$º/₀");
      expect(normalizeConfusables("1+1=2")).toBe("l+l=2");
    });

    it("should handle strings with emojis (non-confusable)", () => {
      expect(normalizeConfusables("hello🙂")).toBe("hello🙂");
      expect(normalizeConfusables("test1🎉")).toBe("testl🎉");
    });

    it("should handle strings with accented characters", () => {
      expect(normalizeConfusables("café")).toBe("café");
      expect(normalizeConfusables("naïve")).toBe("naïve");
    });
  });

  describe("case sensitivity", () => {
    it("should preserve case for non-confusable characters", () => {
      expect(normalizeConfusables("Hello")).toBe("Hello");
      expect(normalizeConfusables("WORLD")).toBe("WORLD");
    });

    it("should normalize confusables regardless of surrounding case", () => {
      expect(normalizeConfusables("HELL0")).toBe("HELLO");
      expect(normalizeConfusables("hell0")).toBe("hellO");
    });
  });

  describe("repeated confusables", () => {
    it("should handle repeated confusable characters", () => {
      expect(normalizeConfusables("000")).toBe("OOO");
      expect(normalizeConfusables("111")).toBe("lll");
      expect(normalizeConfusables("0000000")).toBe("OOOOOOO");
    });

    it("should handle alternating confusables", () => {
      expect(normalizeConfusables("010101")).toBe("OlOlOl");
      expect(normalizeConfusables("101010")).toBe("lOlOlO");
    });
  });

  describe("long strings", () => {
    it("should handle long strings efficiently", () => {
      const longString = `${"a".repeat(1000)}0${"b".repeat(1000)}`;
      const expected = `${"a".repeat(1000)}O${"b".repeat(1000)}`;
      expect(normalizeConfusables(longString)).toBe(expected);
    });

    it("should handle long strings with many confusables", () => {
      const input = "test1".repeat(100);
      const expected = "testl".repeat(100);
      expect(normalizeConfusables(input)).toBe(expected);
    });
  });

  describe("idempotency", () => {
    it("should be idempotent (normalizing twice gives same result)", () => {
      const test = (str: string) => {
        const normalized = normalizeConfusables(str);
        expect(normalizeConfusables(normalized)).toBe(normalized);
      };

      test("paypa1");
      test("1234567890");
      test("hello world");
    });
  });

  describe("edge cases", () => {
    it("should handle strings with no confusables", () => {
      expect(normalizeConfusables("abcdefg")).toBe("abcdefg");
      expect(normalizeConfusables("ABCDEFG")).toBe("ABCDEFG");
    });

    it("should handle numeric strings", () => {
      expect(normalizeConfusables("123")).toBe("l23");
      expect(normalizeConfusables("456")).toBe("456");
      expect(normalizeConfusables("0123456789")).toBe("Ol23456789");
    });
  });

  describe("comparison scenarios", () => {
    it("should make confusably similar strings identical after normalization", () => {
      const variant1 = "1ove";
      const variant2 = "love";
      expect(normalizeConfusables(variant1)).toBe(normalizeConfusables(variant2));
    });

    it("should help detect confusable-based phishing", () => {
      const legitimate = "admin";
      const phishing1 = "adm1n";

      // Note: Both will have 'm' -> 'rn', so they'll match after normalization
      // phishing1 "adm1n" becomes "adrnln" (1->l), legitimate "admin" becomes "adrnin"
      expect(normalizeConfusables(legitimate)).toBe("adrnin");
      // They differ by the '1' -> 'l' substitution
      expect(normalizeConfusables(phishing1)).toBe("adrnln");
    });
  });
});
