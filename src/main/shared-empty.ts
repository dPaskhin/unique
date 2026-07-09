import type { IOptions } from './types';

/**
 * Shared, never-mutated empty defaults reused wherever a caller omits args/options, instead of
 * allocating a fresh `[]`/`{}` on every call. Safe to share because every consumer only reads from
 * these (property access, iteration, `.apply`) and never mutates them.
 */
export const EMPTY_ARRAY: never[] = [];
export const EMPTY_OPTIONS: IOptions<any> = {};
