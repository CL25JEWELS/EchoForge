/**
 * Tests for validation utilities
 */

import { ensureExists, requireValue } from '../validation';

// Mock console.warn to avoid polluting test output
const originalConsoleWarn = console.warn;
beforeAll(() => {
  console.warn = jest.fn();
});

afterAll(() => {
  console.warn = originalConsoleWarn;
});

describe('Validation Utilities', () => {
  describe('ensureExists', () => {
    it('should return true for non-null values', () => {
      expect(ensureExists('test', 'Error message')).toBe(true);
      expect(ensureExists(123, 'Error message')).toBe(true);
      expect(ensureExists(false, 'Error message')).toBe(true);
      expect(ensureExists(0, 'Error message')).toBe(true);
      expect(ensureExists('', 'Error message')).toBe(true);
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('should return false and log warning for null', () => {
      const result = ensureExists(null, 'Value is null');
      
      expect(result).toBe(false);
      expect(console.warn).toHaveBeenCalledWith(' Value is null');
    });

    it('should return false and log warning for undefined', () => {
      const result = ensureExists(undefined, 'Value is undefined');
      
      expect(result).toBe(false);
      expect(console.warn).toHaveBeenCalledWith(' Value is undefined');
    });

    it('should include log prefix in warning message', () => {
      ensureExists(null, 'Value is null', '[TestModule]');
      
      expect(console.warn).toHaveBeenCalledWith('[TestModule] Value is null');
    });

    it('should work with type guards', () => {
      const value: string | null = 'test';
      
      if (ensureExists(value, 'Value should exist')) {
        // TypeScript should know value is string here
        const length: number = value.length;
        expect(length).toBe(4);
      }
    });
  });

  describe('requireValue', () => {
    it('should return value for non-null values', () => {
      expect(requireValue('test', 'Error message')).toBe('test');
      expect(requireValue(123, 'Error message')).toBe(123);
      expect(requireValue(false, 'Error message')).toBe(false);
      expect(requireValue(0, 'Error message')).toBe(0);
      expect(requireValue('', 'Error message')).toBe('');
    });

    it('should throw error for null', () => {
      expect(() => requireValue(null, 'Value is required')).toThrow('Value is required');
    });

    it('should throw error for undefined', () => {
      expect(() => requireValue(undefined, 'Value is required')).toThrow('Value is required');
    });

    it('should work with type narrowing', () => {
      const value: string | null = 'test';
      
      // After requireValue, TypeScript knows it's not null
      const result = requireValue(value, 'Value should exist');
      const length: number = result.length;
      expect(length).toBe(4);
    });

    it('should handle objects correctly', () => {
      const obj = { key: 'value' };
      const result = requireValue(obj, 'Object is required');
      
      expect(result).toBe(obj);
      expect(result.key).toBe('value');
    });
  });
});
