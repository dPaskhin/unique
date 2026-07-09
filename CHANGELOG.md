# @dpaskhin/unique

## 1.1.0

### Minor Changes

- 6a6b161: Export `UniqueError`, with its `storeSize`, `duration`, and `iterations` now exposed as readonly fields, so consumers can catch and inspect uniqueness failures via `instanceof UniqueError` instead of parsing the error message.

### Patch Changes

- 2af6c5e: Fixed the default stringifier: `null`, `NaN`, `Infinity`, and `-Infinity` no longer collide as duplicates of each other, and values that stringify to `undefined` (e.g. `undefined` results) now always produce a real string key. Internal implementation was also split across multiple files for readability; the public API is unchanged.

## 1.0.0

### Major Changes

- 51b4d0a: FIRST STABLE VERSION: NO BREAKING CHANGES.

  - Added support for checking uniqueness with plain (non-functional) values.
  - Simplified and improved documentation.

## 0.3.0

### Minor Changes

- 9573951: JSON.stringify as a default stringifier

## 0.2.0

### Minor Changes

- e30015d: Added stringifier
- 27a36e9: Made global store available

### Patch Changes

- df3ed06: Added initial docs
- efd8975: better typings

## 0.1.0

### Minor Changes

- 4f7191f: Implemented exclude option
