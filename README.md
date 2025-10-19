# @yuckabug/stringpea 🫛✨

[![codecov](https://codecov.io/gh/yuckabug/stringpea/graph/badge.svg?token=a6Q74e9ZzC)](https://codecov.io/gh/yuckabug/stringpea)

A minimal library for detecting confusable strings.

## Installation 📦

```bash
npm install @yuckabug/stringpea
```

## Usage 🚀

```ts
import { getConfusableDistance } from "@yuckabug/stringpea";

// Returns the confusable distance between two strings
console.log(getConfusableDistance("HELL0", "HELLO"));   // 0 - confusably identical
console.log(getConfusableDistance("paypa1", "paypal")); // 0 - '1' looks like 'l'
console.log(getConfusableDistance("admin", "adm1n"));   // 1 - one character different
```

## How It Works 🤔⚙️

1. **Normalize** - Converts confusable characters to their canonical form using [Unicode confusables](https://www.unicode.org/Public/security/latest/confusables.txt) (e.g., `0` → `O`, `1` → `l`)
2. **Calculate Distance** - Computes the Levenshtein (edit) distance between the normalized strings

The returned distance represents the minimum number of single-character edits needed to change one string into another, after accounting for confusable similarity.

## Common Patterns 🎯

### Absolute Distance Threshold
```ts
const distance = getConfusableDistance("admin", "adm1n");
if (distance <= 1) {
  console.log("Strings are very similar");
}
```

### Proportional Threshold (for different length strings)
```ts
const a = "category";
const b = "bategory";
const distance = getConfusableDistance(a, b);
const similarity = 1 - (distance / Math.max(a.length, b.length));

if (similarity >= 0.85) {
  console.log("Strings are 85% similar");
}
```

## Acknowledgments 🙏💚

See the [NOTICE.md](NOTICE.md) file for details.

## License 📜

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
