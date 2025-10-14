/**
 * This script is taken from https://github.com/nodeca/unhomoglyph.
 * You can find the license details in `licenses/NODECA_UNHOMOGLYPH`.
 */

import fs from "node:fs";
import path from "node:path";

/**
 * The latest confusables.txt file from Unicode.
 */
const CONFUSABLES_URL = "http://www.unicode.org/Public/security/latest/confusables.txt";

/**
 * The path to save the JSON file.
 */
const SAVE_PATH = path.join(import.meta.dirname, "..", "src", "confusables.json");

/**
 * Get the confusables.txt file from Unicode.
 * @returns The confusables.txt file from Unicode.
 */
async function getConfusables() {
  const response = await fetch(CONFUSABLES_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch confusables.txt: ${response.status}`);
  }

  return response.text();
}

/**
 * Parse the confusables.txt file from Unicode.
 * @param str The confusables.txt file from Unicode.
 * @returns The parsed confusables.txt file from Unicode.
 */
function parseConfusables(str: string): Record<string, string> {
  const result: Record<string, string> = {};

  str
    .split(/\r?\n/g)
    .filter((line) => line.length && line[0] !== "#")
    .forEach((line) => {
      if (line.split(";").length < 2) return;

      let [src, dst] = line
        .split(";")
        .slice(0, 2)
        .map((s) => s.trim());

      // If either the source or destination is not defined, skip the line
      if (!src || !dst) return;

      src = String.fromCodePoint(parseInt(src, 16));
      dst = dst
        .replace(/\s+/g, " ")
        .split(" ")
        .map((code) => (!code ? "" : String.fromCodePoint(parseInt(code, 16))))
        .join("");
      result[src] = dst;
    });

  return result;
}

/**
 * Main function to update the confusables.txt file.
 *
 * This will update the `SAVE_PATH` file with the parsed confusables.txt file.
 */
async function main() {
  const str = await getConfusables();
  const result = parseConfusables(str);
  fs.writeFileSync(SAVE_PATH, JSON.stringify(result, null, "  "));
}

await main();
