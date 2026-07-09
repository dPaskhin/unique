---
'@dpaskhin/unique': minor
---

Export `UniqueError`, with its `storeSize`, `duration`, and `iterations` now exposed as readonly fields, so consumers can catch and inspect uniqueness failures via `instanceof UniqueError` instead of parsing the error message.
