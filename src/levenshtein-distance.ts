/**
 * Although not a direct port, this is based on the `js-levenshtein` implementation.
 * See `licenses/GUSTF_JS_LEVENSHTEIN` for the license details.
 */

/**
 * Helper function to find the minimum of five values, used in the Levenshtein distance calculation.
 * This optimized version calculates the cost of edit operations (insertion, deletion, substitution)
 * and returns the minimum cost plus 1, unless characters match (bx === ay), in which case no
 * operation is needed and the diagonal value (d1) is returned.
 *
 * @param d0 - Distance from diagonal (represents substitution from previous row/column).
 * @param d1 - Distance from left (represents insertion).
 * @param d2 - Distance from top (represents deletion).
 * @param bx - Character code from string b at current position.
 * @param ay - Character code from string a at current position.
 * @returns The minimum edit distance for this cell in the dynamic programming matrix.
 */
export function min(d0: number, d1: number, d2: number, bx: number, ay: number): number {
  return d0 < d1 || d2 < d1 ? (d0 > d2 ? d2 + 1 : d0 + 1) : bx === ay ? d1 : d1 + 1;
}

/**
 * Calculates the Levenshtein distance between two strings using an optimized algorithm.
 *
 * The Levenshtein distance is the minimum number of single-character edits (insertions,
 * deletions, or substitutions) required to transform one string into another. This
 * implementation uses several optimizations:
 *
 * 1. Early exit for identical strings
 * 2. Ensures the shorter string is always `a` to minimize memory usage
 * 3. Strips common prefix and suffix to reduce the problem size
 * 4. Uses a 1D vector instead of a 2D matrix for space efficiency
 * 5. Processes 4 characters at a time in the main loop for better performance
 *
 * @param a - The first string to compare.
 * @param b - The second string to compare.
 * @returns The Levenshtein distance (minimum edit distance) between the two strings.
 *
 * @example
 * levenshteinDistance("kitten", "sitting") // returns 3
 * levenshteinDistance("hello", "hello") // returns 0
 * levenshteinDistance("abc", "def") // returns 3
 */
export function levenshteinDistance(a: string, b: string): number {
  if (a === b) {
    return 0;
  }

  if (a.length > b.length) {
    const tmp = a;
    a = b;
    b = tmp;
  }

  let la = a.length;
  let lb = b.length;

  while (la > 0 && a.charCodeAt(la - 1) === b.charCodeAt(lb - 1)) {
    la--;
    lb--;
  }

  let offset = 0;

  while (offset < la && a.charCodeAt(offset) === b.charCodeAt(offset)) {
    offset++;
  }

  la -= offset;
  lb -= offset;

  if (la === 0 || lb < 3) {
    return lb;
  }

  let x = 0;
  let y: number;

  let d0: number;
  let d1: number;
  let d2: number;
  let d3: number;

  let dd = 0;

  let dy: number;
  let ay: number;

  let bx0: number;
  let bx1: number;
  let bx2: number;
  let bx3: number;

  const vector: number[] = [];

  for (y = 0; y < la; y++) {
    vector.push(y + 1);
    vector.push(a.charCodeAt(offset + y));
  }

  const len = vector.length - 1;

  for (; x < lb - 3; ) {
    d0 = x;
    d1 = x + 1;
    d2 = x + 2;
    d3 = x + 3;

    bx0 = b.charCodeAt(offset + d0);
    bx1 = b.charCodeAt(offset + d1);
    bx2 = b.charCodeAt(offset + d2);
    bx3 = b.charCodeAt(offset + d3);

    x += 4;
    dd = x;

    for (y = 0; y < len; y += 2) {
      const vectorY = vector[y];
      const vectorYPlus1 = vector[y + 1];
      if (vectorY === undefined || vectorYPlus1 === undefined) continue;

      dy = vectorY;
      ay = vectorYPlus1;

      d0 = min(dy, d0, d1, bx0, ay);
      d1 = min(d0, d1, d2, bx1, ay);
      d2 = min(d1, d2, d3, bx2, ay);
      dd = min(d2, d3, dd, bx3, ay);

      vector[y] = dd;

      d3 = d2;
      d2 = d1;
      d1 = d0;
      d0 = dy;
    }
  }
  for (; x < lb; ) {
    d0 = x;
    bx0 = b.charCodeAt(offset + d0);
    x++;
    dd = x;

    for (y = 0; y < len; y += 2) {
      const vectorY = vector[y];
      const vectorYPlus1 = vector[y + 1];
      if (vectorY === undefined || vectorYPlus1 === undefined) continue;

      dy = vectorY;
      dd = min(dy, d0, dd, bx0, vectorYPlus1);
      vector[y] = dd;
      d0 = dy;
    }
  }

  return dd;
}
