import { normalizeConfusables } from "./confusables";
import { levenshteinDistance } from "./levenshtein-distance";

/**
 * Gets the confusable distance between two strings.
 *
 * First, the strings are normalized to their canonical form using Unicode confusables.
 * Then, the Levenshtein distance is calculated between the two normalized strings.
 * @param a - The first string.
 * @param b - The second string.
 * @returns The confusable distance between the two strings.
 */
export function getConfusableDistance(a: string, b: string): number {
  const normA = normalizeConfusables(a);
  const normB = normalizeConfusables(b);

  return levenshteinDistance(normA, normB);
}
