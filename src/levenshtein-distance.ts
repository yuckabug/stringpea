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
  // Optimization 1: If strings are identical, distance is 0
  if (a === b) {
    return 0;
  }

  // Optimization 2: Ensure 'a' is the shorter string to minimize vector size
  // This reduces memory usage and improves cache locality
  if (a.length > b.length) {
    const tmp = a;
    a = b;
    b = tmp;
  }

  // Store the effective lengths (will be reduced by trimming prefix/suffix)
  let la = a.length;
  let lb = b.length;

  // Optimization 3a: Strip common suffix
  // Characters that match at the end don't need to be processed
  while (la > 0 && a.charCodeAt(la - 1) === b.charCodeAt(lb - 1)) {
    la--;
    lb--;
  }

  // Track the offset where the actual comparison starts
  let offset = 0;

  // Optimization 3b: Strip common prefix
  // Characters that match at the beginning don't need to be processed
  while (offset < la && a.charCodeAt(offset) === b.charCodeAt(offset)) {
    offset++;
  }

  // Adjust lengths to exclude the common prefix
  la -= offset;
  lb -= offset;

  // Edge case: If one string is now empty or very short, the distance is just
  // the length of the remaining part of the longer string
  if (la === 0 || lb < 3) {
    return lb;
  }

  // Variables for the dynamic programming calculation
  // x, y: loop counters for iterating through strings b and a
  let x = 0;
  let y: number;

  // d0, d1, d2, d3: hold distances for the current and previous cells in the DP matrix
  // These represent the costs from different positions as we build up the solution
  let d0: number;
  let d1: number;
  let d2: number;
  let d3: number;

  // dd: holds the final distance result being calculated
  let dd = 0;

  // dy, ay: temporary variables for values from the vector (distances and character codes)
  let dy: number;
  let ay: number;

  // bx0, bx1, bx2, bx3: character codes from string b at positions x, x+1, x+2, x+3
  // Processing 4 characters at a time is an optimization for better performance
  let bx0: number;
  let bx1: number;
  let bx2: number;
  let bx3: number;

  // The vector stores alternating values: [distance, charCode, distance, charCode, ...]
  // This represents one row of the traditional 2D DP matrix, but compressed to save space
  // Even indices store distances, odd indices store character codes from string a
  const vector: number[] = [];

  // Initialize the vector with the first row of the DP matrix
  // For each character in 'a', store the edit distance (y+1) and the character code
  for (y = 0; y < la; y++) {
    vector.push(y + 1); // Distance: transforming empty string to substring of 'a'
    vector.push(a.charCodeAt(offset + y)); // Character code for comparison
  }

  // Length of the vector minus 1, used as loop boundary
  const len = vector.length - 1;

  // Main loop: Process 4 characters from string b at a time for optimization
  // This unrolled loop improves performance by reducing loop overhead
  for (; x < lb - 3; ) {
    // Initialize distances for the current column (represents position in string b)
    d0 = x;
    d1 = x + 1;
    d2 = x + 2;
    d3 = x + 3;

    // Get character codes for 4 consecutive characters from string b
    bx0 = b.charCodeAt(offset + d0);
    bx1 = b.charCodeAt(offset + d1);
    bx2 = b.charCodeAt(offset + d2);
    bx3 = b.charCodeAt(offset + d3);

    // Move x forward by 4 positions
    x += 4;
    dd = x;

    // Inner loop: Iterate through the vector (representing string a)
    // Step by 2 because vector alternates between distances and character codes
    for (y = 0; y < len; y += 2) {
      const vectorY = vector[y];
      const vectorYPlus1 = vector[y + 1];
      if (vectorY === undefined || vectorYPlus1 === undefined) continue;

      dy = vectorY; // Previous distance value
      ay = vectorYPlus1; // Character code from string a

      // Calculate distances for 4 cells at once using the min helper
      // Each call compares costs of insertion, deletion, and substitution
      d0 = min(dy, d0, d1, bx0, ay);
      d1 = min(d0, d1, d2, bx1, ay);
      d2 = min(d1, d2, d3, bx2, ay);
      dd = min(d2, d3, dd, bx3, ay);

      // Update the vector with the newly calculated distance
      vector[y] = dd;

      // Shift distances for the next iteration
      d3 = d2;
      d2 = d1;
      d1 = d0;
      d0 = dy;
    }
  }
  // Cleanup loop: Process remaining characters from string b (fewer than 4 left)
  // This handles the tail end when string b's length isn't divisible by 4
  for (; x < lb; ) {
    d0 = x;
    bx0 = b.charCodeAt(offset + d0);
    x++;
    dd = x;

    // Process one character at a time for the remaining positions
    for (y = 0; y < len; y += 2) {
      const vectorY = vector[y];
      const vectorYPlus1 = vector[y + 1];
      if (vectorY === undefined || vectorYPlus1 === undefined) continue;

      dy = vectorY; // Previous distance value
      // Calculate distance for this single cell
      dd = min(dy, d0, dd, bx0, vectorYPlus1);
      vector[y] = dd;
      d0 = dy;
    }
  }

  // The final distance is stored in dd, representing the minimum edits needed
  // to transform string a into string b
  return dd;
}
