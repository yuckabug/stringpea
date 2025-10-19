import confusablesData from "./confusables.json";

/**
 * The normalization map for the confusables.
 */
let normalizationMap: Map<string, string> | null = null;

/**
 * Decode the compact confusables format into a normalization map.
 *
 * The compact format is an array of [canonical, confusables] pairs where confusables is a string of characters that all
 * map to the same canonical form.
 * @param compact The compact confusables data.
 * @returns A Map from confusable characters to their canonical forms.
 */
function decodeCompact(compact: [string, string][]): Map<string, string> {
  const map = new Map<string, string>();

  for (const [canonical, confusables] of compact) {
    // Map each confusable character to its canonical form
    for (const char of confusables) {
      map.set(char, canonical);
    }

    // Also map the canonical character to itself
    if (!map.has(canonical)) {
      map.set(canonical, canonical);
    }
  }

  return map;
}

/**
 * Get the normalization map for the confusables.
 * @returns The normalization map for the confusables.
 */
function getNormalizationMap(): Map<string, string> {
  if (!normalizationMap) {
    // Decode the compact format on first access
    normalizationMap = decodeCompact(confusablesData as [string, string][]);
  }

  return normalizationMap;
}

/**
 * Normalize the string by replacing confusable Unicode characters with their canonical form.
 * @param str - The string to normalize.
 * @returns The normalized string.
 */
export function normalizeConfusables(str: string): string {
  const map = getNormalizationMap();
  return [...str].map((char) => map.get(char) ?? char).join("");
}
