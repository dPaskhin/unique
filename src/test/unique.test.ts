import { faker } from '@faker-js/faker';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GLOBAL_STORE, unique, uniqueFactory } from '../main';

describe('unique', () => {
  beforeEach(() => {
    GLOBAL_STORE.clear();
  });

  describe('uniqueFactory', () => {
    it('should generate unique fake names', () => {
      const store = new Set();

      const uniqueNameGen = uniqueFactory(faker.person.firstName, { store });

      expect(uniqueNameGen()).not.toBe(uniqueNameGen());
      expect(uniqueNameGen()).not.toBe(uniqueNameGen());
      expect(uniqueNameGen()).not.toBe(uniqueNameGen());
      expect(uniqueNameGen()).not.toBe(uniqueNameGen());
      expect(uniqueNameGen()).not.toBe(uniqueNameGen());

      expect(store.size).toBe(10);
    });

    it('should return unique values', () => {
      const mockFn = vi.fn<() => number>().mockImplementation(() => {
        return faker.helpers.arrayElement([1, 2, 3, 4, 5, 6, 7]);
      });

      const store = new Set();

      const uniqueGen = uniqueFactory(mockFn, { store });

      invokeNTimes(uniqueGen, 3);

      expect(store.size).toBe(3);
      expect(mockFn.mock.calls.length).toBeGreaterThanOrEqual(3);
    });

    it('should add values to the store', () => {
      const mockFn = vi.fn<() => string>().mockImplementation(() => {
        return faker.helpers.arrayElement(['a', 'b', 'c']);
      });

      const store = new Set();

      const uniqueGen = uniqueFactory(mockFn, { store });

      invokeNTimes(uniqueGen, 3);

      expect(store.size).toBe(3);
      expect(store.has('"a"')).toBe(true);
      expect(store.has('"b"')).toBe(true);
      expect(store.has('"c"')).toBe(true);
      expect(mockFn.mock.calls.length).toBeGreaterThanOrEqual(3);
    });

    it('should return unique object values', () => {
      const user1 = {
        firstName: unique(faker.person.firstName),
        lastName: unique(faker.person.lastName),
      };
      const user2 = {
        firstName: unique(faker.person.firstName),
        lastName: unique(faker.person.lastName),
      };
      const user3 = {
        firstName: unique(faker.person.firstName),
        lastName: unique(faker.person.lastName),
      };

      const mockFn = vi
        .fn<() => { firstName: string; lastName: string }>()
        .mockImplementation(() => {
          return faker.helpers.arrayElement([user1, user2, user3]);
        });

      const store = new Set();

      const uniqueGen = uniqueFactory(mockFn, { store });

      invokeNTimes(uniqueGen, 3);

      expect(store.size).toBe(3);
      expect(store.has(JSON.stringify(user1))).toBe(true);
      expect(store.has(JSON.stringify(user2))).toBe(true);
      expect(store.has(JSON.stringify(user3))).toBe(true);
      expect(mockFn.mock.calls.length).toBeGreaterThanOrEqual(3);
    });

    it('should throw error after max retries exceeded', () => {
      const mockFn = vi.fn<() => number>().mockReturnValue(1);

      const uniqueGen = uniqueFactory(mockFn, {
        maxRetries: 3,
        store: new Set(['1']),
      });

      expect(() => uniqueGen()).toThrow(
        'Exceeded maxTries (3) - store size: 1, retried: 3, duration: 0ms'
      );
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should throw error after max time exceeded', () => {
      vi.useFakeTimers();

      const uniqueGen = uniqueFactory(
        () => {
          vi.advanceTimersByTime(10);
          return 1;
        },
        {
          maxTime: 100,
          store: new Set(['1']),
        }
      );

      expect(() => uniqueGen()).toThrow(
        'Exceeded maxTime (100) - store size: 1, retried: 10, duration: 100ms'
      );

      vi.useRealTimers();
    });
  });

  describe('uniqueFactory with exclude option', () => {
    it('should exclude specified values from results', () => {
      const mockFn = vi.fn<() => string>().mockImplementation(() => {
        return faker.helpers.arrayElement(['a', 'b', 'c']);
      });

      const exclude = ['a', 'b'];
      const store = new Set();

      const uniqueGen = uniqueFactory(mockFn, { exclude, store });

      const result = uniqueGen();

      expect(store.has('"a"')).toBe(false);
      expect(store.has('"b"')).toBe(false);
      expect(store.has('"c"')).toBe(true);
      expect(result).toBe('c');
    });

    it('should throw error after max retries with excluded values', () => {
      const mockFn = vi.fn<() => string>().mockReturnValue('excluded');

      const exclude = ['excluded'];

      const uniqueGen = uniqueFactory(mockFn, { maxRetries: 3, exclude });

      expect(() => uniqueGen()).toThrow(
        'Exceeded maxTries (3) - store size: 0, retried: 3, duration: 0ms'
      );
      expect(mockFn).toHaveBeenCalledTimes(3);
    });
  });

  describe('unique with and without stringifier', () => {
    it('ensures uniqueness of stringified objects', () => {
      const objectGen = (): { key: string } => {
        return faker.helpers.arrayElement([
          { key: 'a' },
          { key: 'b' },
          { key: 'c' },
        ]);
      };

      const store = new Set();

      const uniqueObjGen = uniqueFactory(objectGen, {
        store,
        // Here we use the identity function to replace the default stringifier.
        stringifier: value => value as unknown as string,
      });

      invokeNTimes(uniqueObjGen, 10);

      expect(store.size).toBe(10);

      const stringifiedStore = new Set();

      const uniqueObjGenWithStringifier = uniqueFactory(objectGen, {
        store: stringifiedStore,
      });

      const result1 = uniqueObjGenWithStringifier();
      const result2 = uniqueObjGenWithStringifier();
      const result3 = uniqueObjGenWithStringifier();

      expect(result1).not.toEqual(result2);
      expect(result1).not.toEqual(result3);
      expect(result2).not.toEqual(result3);
      expect(stringifiedStore.size).toBe(3);

      expect(() => uniqueObjGenWithStringifier()).toThrow();
    });

    it('respects the exclude list when using a stringifier', () => {
      const objectGen = (): { key: string } => {
        return faker.helpers.arrayElement([
          { key: 'a' },
          { key: 'b' },
          { key: 'c' },
        ]);
      };

      const exclude = [{ key: 'a' }];

      const result = uniqueFactory(objectGen, { exclude });

      const result1 = result();
      const result2 = result();

      expect(result1).not.toEqual(exclude[0]);
      expect(result2).not.toEqual(exclude[0]);

      expect(() => result()).toThrow();
    });
  });

  describe('unique with global (default) store', () => {
    it('should return a unique value', () => {
      const mockFn = () => {
        return faker.helpers.arrayElement(['a', 'b', 'c']);
      };

      const a = unique(mockFn);
      const b = unique(mockFn);
      const c = unique(mockFn);

      expect(a !== b && a !== c && b !== c).toBe(true);
      expect(GLOBAL_STORE.has('"a"')).toBe(true);
      expect(GLOBAL_STORE.has('"b"')).toBe(true);
      expect(GLOBAL_STORE.has('"c"')).toBe(true);
      expect(GLOBAL_STORE.size).toBe(3);
    });

    it('should work with custom arguments', () => {
      const mockFn = vi
        .fn<(x: number) => number>()
        .mockImplementation(x => x * 2);

      const result = unique(mockFn, [5]);

      expect(result).toBe(10);
      expect(mockFn).toHaveBeenCalledWith(5);
    });
  });

  describe('unique with plain (non function) values', () => {
    it('returns the plain value as unique', () => {
      expect(unique('plain value')).toBe('plain value');
      expect(() => unique('plain value')).toThrow(
        'Exceeded maxTries (1) - store size: 1, retried: 1, duration: 0ms'
      );
    });

    it('enforces uniqueness for plain values with a custom store', () => {
      const store = new Set();
      const uniqueValue = unique('plain value', { store });

      expect(uniqueValue).toBe('plain value');
      expect(store.size).toBe(1);
      expect(store.has('"plain value"')).toBe(true);
    });
  });
});

function invokeNTimes(fn: Function, n: number) {
  for (let i = 0; i < n; i++) {
    fn();
  }
}
