import { faker } from '@faker-js/faker';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GLOBAL_STORE, unique, uniqueFactory } from '../main';

describe('unique', () => {
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
      const mockFn = vi.fn().mockImplementation(() => {
        return faker.helpers.arrayElement([1, 2, 3, 4, 5, 6, 7]);
      });

      const store = new Set();

      const uniqueGen = uniqueFactory(mockFn, { store });

      invokeNTimes(uniqueGen, 3);

      expect(store.size).toBe(3);
      expect(mockFn.mock.calls.length).toBeGreaterThanOrEqual(3);
    });

    it('should add values to the store', () => {
      const mockFn = vi.fn().mockImplementation(() => {
        return faker.helpers.arrayElement(['a', 'b', 'c']);
      });

      const store = new Set();

      const uniqueGen = uniqueFactory(mockFn, { store });

      invokeNTimes(uniqueGen, 3);

      expect(store.size).toBe(3);
      expect(store.has('a')).toBe(true);
      expect(store.has('b')).toBe(true);
      expect(store.has('c')).toBe(true);
      expect(mockFn.mock.calls.length).toBeGreaterThanOrEqual(3);
    });

    it('should return unique object values', () => {
      const user1 = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      };
      const user2 = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      };
      const user3 = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      };

      const mockFn = vi.fn().mockImplementation(() => {
        return faker.helpers.arrayElement([user1, user2, user3]);
      });

      const store = new Set();

      const uniqueGen = uniqueFactory(mockFn, { store });

      invokeNTimes(uniqueGen, 3);

      expect(store.size).toBe(3);
      expect(store.has(user1)).toBe(true);
      expect(store.has(user2)).toBe(true);
      expect(store.has(user3)).toBe(true);
      expect(mockFn.mock.calls.length).toBeGreaterThanOrEqual(3);
    });

    it('should throw error after max retries exceeded', () => {
      const mockFn = vi.fn().mockReturnValue(1);

      const uniqueGen = uniqueFactory(mockFn, {
        maxRetries: 3,
        store: new Set([1]),
      });

      expect(() => uniqueGen()).toThrow('Exceeded maxTries: 3');
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
          store: new Set([1]),
        }
      );

      expect(() => uniqueGen()).toThrow('Exceeded maxTime: 100');

      vi.useRealTimers();
    });
  });

  describe('uniqueFactory with exclude option', () => {
    it('should exclude specified values from results', () => {
      const mockFn = vi.fn().mockImplementation(() => {
        return faker.helpers.arrayElement(['a', 'b', 'c']);
      });

      const exclude = ['a', 'b'];
      const store = new Set();

      const uniqueGen = uniqueFactory(mockFn, { exclude, store });

      const result = uniqueGen();

      expect(store.has('a')).toBe(false);
      expect(store.has('b')).toBe(false);
      expect(store.has('c')).toBe(true);
      expect(result).toBe('c');
    });

    it('should throw error after max retries with excluded values', () => {
      const mockFn = vi.fn().mockReturnValue('excluded');

      const exclude = ['excluded'];

      const uniqueGen = uniqueFactory(mockFn, { maxRetries: 3, exclude });

      expect(() => uniqueGen()).toThrow('Exceeded maxTries: 3');
      expect(mockFn).toHaveBeenCalledTimes(3);
    });
  });

  describe('unique with global (default) store', () => {
    afterEach(() => {
      GLOBAL_STORE.clear();
    });

    it('should return a unique value', () => {
      const mockFn = vi.fn().mockImplementation(() => {
        return faker.helpers.arrayElement(['a', 'b', 'c']);
      });

      unique(mockFn);
      unique(mockFn);
      unique(mockFn);

      expect(GLOBAL_STORE.has('a')).toBe(true);
      expect(GLOBAL_STORE.has('b')).toBe(true);
      expect(GLOBAL_STORE.has('c')).toBe(true);
    });

    it('should work with custom arguments', () => {
      const mockFn = vi.fn((x: number) => x * 2);

      const result = unique(mockFn, [5]);

      expect(result).toBe(10);
      expect(mockFn).toHaveBeenCalledWith(5);
    });
  });
});

function invokeNTimes(fn: Function, n: number) {
  for (let i = 0; i < n; i++) {
    fn();
  }
}
