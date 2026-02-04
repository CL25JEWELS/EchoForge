/**
 * Tests for error handler utilities
 */

import { handleAsyncError, handleAsyncErrorWithFinally } from '../error-handler';

// Mock console.error to avoid polluting test output
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('Error Handler Utilities', () => {
  describe('handleAsyncError', () => {
    it('should return the result when function succeeds', async () => {
      const mockFn = jest.fn(async () => 'success');
      const result = await handleAsyncError(mockFn, 'Test error message');
      
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should catch error and return null', async () => {
      const mockError = new Error('Test error');
      const mockFn = jest.fn(async () => {
        throw mockError;
      });
      
      const result = await handleAsyncError(mockFn, 'Test error message');
      
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Test error message', mockError);
    });

    it('should handle async functions that return null', async () => {
      const mockFn = jest.fn(async () => null);
      const result = await handleAsyncError(mockFn, 'Test error message');
      
      expect(result).toBeNull();
      expect(console.error).not.toHaveBeenCalled();
    });
  });

  describe('handleAsyncErrorWithFinally', () => {
    it('should return result and call finally function on success', async () => {
      const mockFn = jest.fn(async () => 'success');
      const finallyFn = jest.fn();
      
      const result = await handleAsyncErrorWithFinally(
        mockFn,
        'Test error message',
        finallyFn
      );
      
      expect(result).toBe('success');
      expect(finallyFn).toHaveBeenCalledTimes(1);
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should catch error, return null, and call finally function', async () => {
      const mockError = new Error('Test error');
      const mockFn = jest.fn(async () => {
        throw mockError;
      });
      const finallyFn = jest.fn();
      
      const result = await handleAsyncErrorWithFinally(
        mockFn,
        'Test error message',
        finallyFn
      );
      
      expect(result).toBeNull();
      expect(finallyFn).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Test error message', mockError);
    });

    it('should work without finally function', async () => {
      const mockFn = jest.fn(async () => 'success');
      
      const result = await handleAsyncErrorWithFinally(
        mockFn,
        'Test error message'
      );
      
      expect(result).toBe('success');
    });

    it('should call finally even if error occurs', async () => {
      const mockFn = jest.fn(async () => {
        throw new Error('Test error');
      });
      const finallyFn = jest.fn();
      
      await handleAsyncErrorWithFinally(mockFn, 'Test error message', finallyFn);
      
      expect(finallyFn).toHaveBeenCalledTimes(1);
    });
  });
});
