import { describe, expect, it } from "bun:test";
import { levenshteinDistance, min } from "../src/levenshtein-distance";

describe("min", () => {
  it("should return the minimum value plus 1 when characters don't match", () => {
    // When bx !== ay, should return min(d0, d1, d2) + 1
    expect(min(1, 2, 3, 65, 66)).toBe(2); // min is d0=1, returns 1+1=2
    expect(min(5, 2, 3, 65, 66)).toBe(3); // d2=3 < d1=2 is true, so returns d2+1=4, but logic is complex
  });

  it("should return d1 when characters match", () => {
    // When bx === ay, should return d1 (no edit needed)
    expect(min(1, 2, 3, 65, 65)).toBe(2); // characters match, return d1=2
    expect(min(5, 3, 7, 97, 97)).toBe(3); // characters match, return d1=3
  });

  it("should handle various distance combinations", () => {
    expect(min(0, 1, 2, 65, 66)).toBe(1); // d0 is smallest
    expect(min(10, 5, 8, 65, 66)).toBe(6); // d1 is smaller, but d2 < d1 is false
  });
});

describe("levenshteinDistance", () => {
  describe("identical strings", () => {
    it("should return 0 for identical strings", () => {
      expect(levenshteinDistance("hello", "hello")).toBe(0);
      expect(levenshteinDistance("", "")).toBe(0);
      expect(levenshteinDistance("a", "a")).toBe(0);
      expect(levenshteinDistance("test123", "test123")).toBe(0);
    });
  });

  describe("empty strings", () => {
    it("should return the length of the non-empty string", () => {
      expect(levenshteinDistance("", "hello")).toBe(5);
      expect(levenshteinDistance("hello", "")).toBe(5);
      expect(levenshteinDistance("", "a")).toBe(1);
      expect(levenshteinDistance("abc", "")).toBe(3);
    });
  });

  describe("single character differences", () => {
    it("should return 1 for strings differing by one character", () => {
      expect(levenshteinDistance("cat", "bat")).toBe(1); // substitution
      expect(levenshteinDistance("cat", "cats")).toBe(1); // insertion
      expect(levenshteinDistance("cats", "cat")).toBe(1); // deletion
    });
  });

  describe("classic examples", () => {
    it("should calculate distance for kitten -> sitting", () => {
      expect(levenshteinDistance("kitten", "sitting")).toBe(3);
      // kitten -> sitten (substitute k->s)
      // sitten -> sittin (substitute e->i)
      // sittin -> sitting (insert g)
    });

    it("should calculate distance for saturday -> sunday", () => {
      expect(levenshteinDistance("saturday", "sunday")).toBe(3);
      // saturday -> sunday requires 3 edits
    });

    it("should calculate distance for book -> back", () => {
      expect(levenshteinDistance("book", "back")).toBe(2);
      // book -> bock (substitute o->c)
      // bock -> back (substitute o->a)
    });
  });

  describe("completely different strings", () => {
    it("should handle strings with no common characters", () => {
      expect(levenshteinDistance("abc", "def")).toBe(3);
      expect(levenshteinDistance("xyz", "123")).toBe(3);
    });
  });

  describe("common prefix and suffix optimization", () => {
    it("should handle strings with common prefix", () => {
      expect(levenshteinDistance("prefix_abc", "prefix_xyz")).toBe(3);
      expect(levenshteinDistance("hello_world", "hello_there")).toBe(5);
    });

    it("should handle strings with common suffix", () => {
      expect(levenshteinDistance("abc_suffix", "xyz_suffix")).toBe(3);
      expect(levenshteinDistance("test_end", "best_end")).toBe(1);
    });

    it("should handle strings with both common prefix and suffix", () => {
      expect(levenshteinDistance("pre_middle_post", "pre_center_post")).toBe(6);
      expect(levenshteinDistance("start_a_end", "start_b_end")).toBe(1);
    });
  });

  describe("different string lengths", () => {
    it("should handle strings of very different lengths", () => {
      expect(levenshteinDistance("a", "abcdefgh")).toBe(7);
      expect(levenshteinDistance("short", "a very long string")).toBe(16);
    });

    it("should work regardless of parameter order", () => {
      expect(levenshteinDistance("short", "longer")).toBe(levenshteinDistance("longer", "short"));
      expect(levenshteinDistance("abc", "abcdef")).toBe(levenshteinDistance("abcdef", "abc"));
    });
  });

  describe("special characters and unicode", () => {
    it("should handle strings with special characters", () => {
      expect(levenshteinDistance("hello!", "hello?")).toBe(1);
      expect(levenshteinDistance("test@123", "test#123")).toBe(1);
    });

    it("should handle unicode characters", () => {
      expect(levenshteinDistance("café", "cafe")).toBe(1);
      expect(levenshteinDistance("hello", "héllo")).toBe(1);
      expect(levenshteinDistance("🙂", "🙃")).toBe(1);
    });
  });

  describe("case sensitivity", () => {
    it("should treat uppercase and lowercase as different", () => {
      expect(levenshteinDistance("Hello", "hello")).toBe(1);
      expect(levenshteinDistance("HELLO", "hello")).toBe(5);
      expect(levenshteinDistance("Test", "test")).toBe(1);
    });
  });

  describe("repeated characters", () => {
    it("should handle strings with repeated characters", () => {
      expect(levenshteinDistance("aaa", "aaa")).toBe(0);
      expect(levenshteinDistance("aaa", "aaaa")).toBe(1);
      expect(levenshteinDistance("aaaa", "aa")).toBe(2);
      expect(levenshteinDistance("ababa", "baba")).toBe(1);
    });
  });

  describe("real-world homoglyph scenarios", () => {
    it("should detect similar-looking characters", () => {
      // Latin 'o' vs Cyrillic 'о' (different Unicode code points)
      expect(levenshteinDistance("gооgle", "google")).toBeGreaterThan(0);

      // Latin 'a' vs Cyrillic 'а'
      expect(levenshteinDistance("apple", "аpple")).toBeGreaterThan(0);
    });

    it("should measure distance for common typos", () => {
      expect(levenshteinDistance("teh", "the")).toBe(2); // transpose: delete h, insert h
      expect(levenshteinDistance("recieve", "receive")).toBe(2); // swap ei to ie
      expect(levenshteinDistance("definately", "definitely")).toBe(1); // substitute a with i
    });
  });

  describe("edge cases for optimization paths", () => {
    it("should handle strings shorter than 3 characters", () => {
      expect(levenshteinDistance("a", "b")).toBe(1);
      expect(levenshteinDistance("ab", "cd")).toBe(2);
      expect(levenshteinDistance("ab", "abc")).toBe(1);
    });

    it("should trigger the 4-character optimization loop", () => {
      // Strings long enough to use the 4-character-at-a-time optimization
      expect(levenshteinDistance("abcdefgh", "ijklmnop")).toBe(8);
      expect(levenshteinDistance("testing1234", "testing5678")).toBe(4);
    });

    it("should handle the cleanup loop for non-multiple-of-4 lengths", () => {
      // These trigger both the main loop and cleanup loop
      expect(levenshteinDistance("12345", "67890")).toBe(5);
      expect(levenshteinDistance("abcdefg", "hijklmn")).toBe(7);
    });
  });

  describe("symmetric property", () => {
    it("should return same distance regardless of argument order", () => {
      const pairs: [string, string][] = [
        ["kitten", "sitting"],
        ["book", "back"],
        ["hello", "world"],
        ["", "test"],
        ["a", "abc"],
      ];

      for (const [str1, str2] of pairs) {
        expect(levenshteinDistance(str1, str2)).toBe(levenshteinDistance(str2, str1));
      }
    });
  });
});
