import confusablesData from "./confusables.json";

/**
 * The normalization map for the confusables.
 */
let normalizationMap: Map<string, string> | null = null;

/**
 * Get the normalization map for the confusables.
 * @returns The normalization map for the confusables.
 */
function getNormalizationMap(): Map<string, string> {
  if (!normalizationMap) {
    normalizationMap = new Map();

    for (const [confusable, canonical] of Object.entries(confusablesData)) {
      normalizationMap.set(confusable, canonical);
    }

    for (const canonical of Object.values(confusablesData)) {
      if (!normalizationMap.has(canonical)) {
        normalizationMap.set(canonical, canonical);
      }
    }
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
