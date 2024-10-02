import { faker } from '@faker-js/faker';
import { describe, expect, it, vi } from 'vitest';
import { unique, uniqueFactory } from '../main';

describe('unique', () => {
  describe('uniqueFactory', () => {
    it('should generate unique fake names', () => {
      const uniqueNameGen = uniqueFactory(faker.person.firstName);

      expect(uniqueNameGen()).not.toBe(uniqueNameGen());
      expect(uniqueNameGen()).not.toBe(uniqueNameGen());
      expect(uniqueNameGen()).not.toBe(uniqueNameGen());
      expect(uniqueNameGen()).not.toBe(uniqueNameGen());
      expect(uniqueNameGen()).not.toBe(uniqueNameGen());
    });

    it('should return unique values', () => {
      const mockFn = vi
        .fn()
        .mockReturnValueOnce(1)
        .mockReturnValueOnce(2)
        .mockReturnValueOnce(3);

      const uniqueGen = uniqueFactory(mockFn);

      const result1 = uniqueGen();
      const result2 = uniqueGen();
      const result3 = uniqueGen();

      expect(result1).toBe(1);
      expect(result2).toBe(2);
      expect(result3).toBe(3);
      expect(mockFn).toHaveBeenCalledTimes(3);
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

    it('should add values to the store', () => {
      const mockFn = vi
        .fn()
        .mockReturnValueOnce('a')
        .mockReturnValueOnce('b')
        .mockReturnValueOnce('c');

      const store = new Set();
      const uniqueGen = uniqueFactory(mockFn, { store });

      uniqueGen();
      uniqueGen();
      uniqueGen();

      expect(store.size).toBe(3);
      expect(store.has('a')).toBe(true);
      expect(store.has('b')).toBe(true);
      expect(store.has('c')).toBe(true);
    });
  });

  describe('uniqueFactory with exclude option', () => {
    it('should exclude specified values from results', () => {
      const mockFn = vi
        .fn()
        .mockReturnValueOnce('a')
        .mockReturnValueOnce('b')
        .mockReturnValueOnce('c');

      const exclude = ['a', 'b'];

      const uniqueGen = uniqueFactory(mockFn, { exclude });

      const result = uniqueGen();

      expect(result).toBe('c');
    });

    it('should not add excluded values to the store', () => {
      const mockFn = vi
        .fn()
        .mockReturnValueOnce('x')
        .mockReturnValueOnce('y')
        .mockReturnValueOnce('z');

      const exclude = ['x', 'y'];
      const store = new Set();

      const uniqueGen = uniqueFactory(mockFn, { store, exclude });

      const result = uniqueGen();

      expect(store.has('x')).toBe(false);
      expect(store.has('y')).toBe(false);
      expect(store.has(result)).toBe(true);
    });

    it('should retry until a non-excluded value is found', () => {
      const mockFn = vi
        .fn()
        .mockReturnValueOnce('excluded')
        .mockReturnValueOnce('excluded')
        .mockReturnValueOnce('allowed');

      const exclude = ['excluded'];

      const uniqueGen = uniqueFactory(mockFn, { exclude });

      const result = uniqueGen();

      expect(result).toBe('allowed');
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should throw error after max retries with excluded values', () => {
      const mockFn = vi.fn().mockReturnValue('excluded');

      const exclude = ['excluded'];

      const uniqueGen = uniqueFactory(mockFn, { maxRetries: 3, exclude });

      expect(() => uniqueGen()).toThrow('Exceeded maxTries: 3');
      expect(mockFn).toHaveBeenCalledTimes(3);
    });
  });

  describe('global', () => {
    it('should return a unique value with default store', () => {
      const mockFn = vi.fn().mockReturnValueOnce(1).mockReturnValueOnce(2);

      const result1 = unique(mockFn);
      const result2 = unique(mockFn);

      expect(result1).toBe(1);
      expect(result2).toBe(2);
    });

    it('should work with custom arguments', () => {
      const mockFn = vi.fn((x: number) => x * 2);

      const result = unique(mockFn, [5]);

      expect(result).toBe(10);
      expect(mockFn).toHaveBeenCalledWith(5);
    });
  });
});
