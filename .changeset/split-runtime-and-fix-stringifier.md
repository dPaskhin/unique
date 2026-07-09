---
'@dpaskhin/unique': patch
---

Fixed the default stringifier: `null`, `NaN`, `Infinity`, and `-Infinity` no longer collide as duplicates of each other, and values that stringify to `undefined` (e.g. `undefined` results) now always produce a real string key. Internal implementation was also split across multiple files for readability; the public API is unchanged.
