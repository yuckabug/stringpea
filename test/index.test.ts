import { describe, expect, it } from "bun:test";
import { getConfusableDistance } from "../src/index";

describe("getConfusableDistance", () => {
  describe("identical strings", () => {
    it("should return 0 for identical strings", () => {
      expect(getConfusableDistance("hello", "hello")).toBe(0);
      expect(getConfusableDistance("test", "test")).toBe(0);
      expect(getConfusableDistance("", "")).toBe(0);
    });
  });

  describe("confusable normalization", () => {
    it("should normalize confusables reducing distance", () => {
      // 0 normalizes to O (uppercase), creates case difference with lowercase 'o'
      expect(getConfusableDistance("hello", "hell0")).toBe(1); // distance 1
      expect(getConfusableDistance("g00gle", "gOOgle")).toBe(0); // distance 0

      // 1 normalizes to l (lowercase), creates case difference with uppercase 'L'
      expect(getConfusableDistance("love", "1ove")).toBe(0); // distance 0
      expect(getConfusableDistance("hello", "he1lo")).toBe(0); // distance 0
    });

    it("should return distance for strings with confusables", () => {
      expect(getConfusableDistance("l0gin", "login")).toBe(1); // distance 1
      expect(getConfusableDistance("v1.0", "vl.O")).toBe(0); // distance 0
      expect(getConfusableDistance("1001", "lOOl")).toBe(0); // distance 0
    });

    it("should handle mixed confusables and real differences", () => {
      // "hell0" -> "hellO", "world" -> "world", distance = 4
      expect(getConfusableDistance("hell0", "world")).toBe(4);
    });
  });

  describe("basic edit operations", () => {
    it("should return distance of 1 for single character operations", () => {
      expect(getConfusableDistance("cat", "bat")).toBe(1); // substitution
      expect(getConfusableDistance("cat", "cats")).toBe(1); // insertion
      expect(getConfusableDistance("cats", "cat")).toBe(1); // deletion
    });

    it("should return distance > 1 for multiple differences", () => {
      expect(getConfusableDistance("cat", "dog")).toBe(3);
      expect(getConfusableDistance("test", "testing")).toBe(3);
    });

    it("should handle empty strings", () => {
      expect(getConfusableDistance("a", "")).toBe(1); // distance 1
      expect(getConfusableDistance("", "a")).toBe(1); // distance 1
      expect(getConfusableDistance("ab", "")).toBe(2); // distance 2
    });
  });

  describe("various distances", () => {
    it("should return distance of 2", () => {
      expect(getConfusableDistance("book", "back")).toBe(2); // distance 2
    });

    it("should return distance of 3", () => {
      expect(getConfusableDistance("kitten", "sitting")).toBe(3); // distance 3
      expect(getConfusableDistance("saturday", "sunday")).toBe(3); // distance 3
    });

    it("should handle large distances", () => {
      expect(getConfusableDistance("short", "a very long string")).toBe(16);
    });
  });

  describe("confusables with Levenshtein distance", () => {
    it("should combine normalization and distance checking", () => {
      // "g00gle" -> "gOOgle", "google" -> "google", distance 2 (O->o twice)
      expect(getConfusableDistance("g00gle", "google")).toBe(2);
    });

    it("should detect similar phishing attempts", () => {
      // "paypa1" -> "paypal", "paypal" -> "paypal", distance 0
      expect(getConfusableDistance("paypa1", "paypal")).toBe(0);

      // "paypai" -> "paypai", "paypal" -> "paypal", distance 1
      expect(getConfusableDistance("paypai", "paypal")).toBe(1);

      // "paypaz" -> "paypaz", "paypal" -> "paypal", distance 1
      expect(getConfusableDistance("paypaz", "paypal")).toBe(1);
    });

    it("should handle confusables that create additional differences", () => {
      // "test1ng" -> "testlng", "testing" -> "testing", distance 1 (l->i)
      expect(getConfusableDistance("test1ng", "testing")).toBe(1);

      // "h3ll0" -> "h3llO", "hello" -> "hello", distance 2 (3->e, O->o)
      expect(getConfusableDistance("h3ll0", "hello")).toBe(2);
    });
  });

  describe("real-world security scenarios", () => {
    it("should detect brand impersonation with confusables", () => {
      expect(getConfusableDistance("micr0s0ft", "microsoft")).toBe(2); // 'm' -> 'rn', 0->O
      expect(getConfusableDistance("amaz0n", "amazon")).toBe(1); // 'm' -> 'rn', 0->O

      // Allow for typos with maxDistance
      expect(getConfusableDistance("microsoft", "microsft")).toBe(1); // missing 'o'
      expect(getConfusableDistance("amazon", "amazom")).toBe(1); // n->m typo
    });

    it("should detect similar usernames", () => {
      // "admin" -> "adrnin", "adm1n" -> "adrnln", distance 1
      expect(getConfusableDistance("admin", "adm1n")).toBe(1);
      // "root" -> "root", "r00t" -> "rOOt", distance 2 (O->o twice)
      expect(getConfusableDistance("root", "r00t")).toBe(2);
      expect(getConfusableDistance("admin", "adrnin")).toBe(0); // both normalize to adrnin
    });

    it("should handle domain name variations", () => {
      // "example.com" -> "exarnple.corn", "examp1e.com" -> "exarnple.corn", distance 0
      expect(getConfusableDistance("example.com", "examp1e.com")).toBe(0);
      // "test.io" -> "test.io", "test.i0" -> "test.iO", distance 1
      expect(getConfusableDistance("test.io", "test.i0")).toBe(1);
      expect(getConfusableDistance("site.org", "site.com")).toBe(2);
    });
  });

  describe("case sensitivity", () => {
    it("should treat case differences as distance", () => {
      expect(getConfusableDistance("Hello", "hello")).toBe(1); // distance 1
      expect(getConfusableDistance("HELLO", "hello")).toBe(5); // distance 5
    });

    it("should handle case with confusables", () => {
      expect(getConfusableDistance("HELL0", "HELLO")).toBe(0); // 0->O
      expect(getConfusableDistance("hell0", "hello")).toBe(1); // 0->O
    });
  });

  describe("unicode and special characters", () => {
    it("should handle unicode characters", () => {
      expect(getConfusableDistance("café", "cafe")).toBe(1); // distance 1
      expect(getConfusableDistance("naïve", "naive")).toBe(1); // distance 1
      expect(getConfusableDistance("π", "p")).toBe(1); // distance 1
    });

    it("should handle punctuation", () => {
      expect(getConfusableDistance("hello!", "hello?")).toBe(1); // distance 1
      expect(getConfusableDistance("test@123", "test#123")).toBe(1); // distance 1
      expect(getConfusableDistance("v1.0.0", "vl.O.O")).toBe(0); // confusables
    });
  });

  describe("symmetric property", () => {
    it("should return same result regardless of argument order", () => {
      const pairs: [string, string][] = [
        ["g00gle", "google"],
        ["test", "testing"],
        ["", "a"],
      ];

      for (const [str1, str2] of pairs) {
        expect(getConfusableDistance(str1, str2)).toBe(getConfusableDistance(str2, str1));
      }
    });
  });

  describe("edge cases", () => {
    it("should handle long strings", () => {
      const longStr1 = "a".repeat(1000);
      const longStr2 = `${"a".repeat(999)}b`;
      expect(getConfusableDistance(longStr1, longStr2)).toBe(1); // distance 1

      const longStr3 = `${"a".repeat(998)}bc`;
      expect(getConfusableDistance(longStr1, longStr3)).toBe(2); // distance 2
    });

    it("should handle strings with only confusables", () => {
      expect(getConfusableDistance("0101", "OlOl")).toBe(0);
      expect(getConfusableDistance("1111", "llll")).toBe(0);
      expect(getConfusableDistance("0000", "OOOO")).toBe(0);
    });

    it("should handle very different strings", () => {
      expect(getConfusableDistance("short", "a very long string")).toBe(16);
    });
  });

  describe("performance edge cases", () => {
    it("should efficiently handle strings with common prefix/suffix", () => {
      expect(getConfusableDistance("prefix_a_suffix", "prefix_b_suffix")).toBe(1); // distance 1
      expect(getConfusableDistance("start_abc_end", "start_xyz_end")).toBe(3);
    });

    it("should handle repeated characters", () => {
      expect(getConfusableDistance("aaaa", "aaa")).toBe(1); // distance 1
      expect(getConfusableDistance("aaaa", "aa")).toBe(2); // distance 2
      expect(getConfusableDistance("0000", "OOO")).toBe(1); // confusables, distance 1
    });
  });

  describe("boundary conditions", () => {
    it("should return exact distances", () => {
      expect(getConfusableDistance("test", "fest")).toBe(1);
      expect(getConfusableDistance("test", "test")).toBe(0);
    });
  });

  describe("usage patterns", () => {
    it("should support absolute distance threshold checks", () => {
      // Pattern: distance <= maxDistance
      const maxDistance = 1;
      expect(getConfusableDistance("cat", "bat") <= maxDistance).toBe(true);
      expect(getConfusableDistance("cat", "dog") <= maxDistance).toBe(false);
    });

    it("should support proportional threshold checks", () => {
      // Pattern: distance / maxLength <= threshold
      const threshold = 0.15; // 15%

      // "testing" (7 chars) allows distance of ~1
      const str1 = "testing";
      const str2 = "testinx";
      const dist1 = getConfusableDistance(str1, str2);
      const ratio1 = dist1 / Math.max(str1.length, str2.length);
      expect(ratio1 <= threshold).toBe(true); // 1/7 ≈ 0.143

      // "cat" (3 chars), distance 1, ratio 0.333 > 0.15
      const str3 = "cat";
      const str4 = "bat";
      const dist2 = getConfusableDistance(str3, str4);
      const ratio2 = dist2 / Math.max(str3.length, str4.length);
      expect(ratio2 <= threshold).toBe(false); // 1/3 ≈ 0.333
    });

    it("should support custom scoring", () => {
      // Pattern: 1 - (distance / maxLength) for similarity score
      const a = "category";
      const b = "bategory";
      const distance = getConfusableDistance(a, b);
      const maxLen = Math.max(a.length, b.length);
      const similarityScore = 1 - distance / maxLen;

      expect(similarityScore).toBeCloseTo(0.875, 3); // 1 - 1/8 = 0.875
      expect(similarityScore >= 0.8).toBe(true);
    });
  });
});
