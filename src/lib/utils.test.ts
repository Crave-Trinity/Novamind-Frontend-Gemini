import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('utils', () => {
  describe('cn function', () => {
    it('should merge class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2');
      expect(cn('class1', 'class2', 'class3')).toBe('class1 class2 class3');
    });

    it('should filter out falsy values', () => {
      expect(cn('class1', false && 'class2', 'class3')).toBe('class1 class3');
      expect(cn('class1', undefined, 'class3')).toBe('class1 class3');
      expect(cn('class1', null, 'class3')).toBe('class1 class3');
      expect(cn('class1', '', 'class3')).toBe('class1 class3');
      expect(cn('class1', 0 && 'class2', 'class3')).toBe('class1 class3');
    });

    it('should handle conditional expressions', () => {
      const condition = true;
      expect(cn('class1', condition ? 'class2' : 'class3')).toBe('class1 class2');

      const condition2 = false;
      expect(cn('class1', condition2 ? 'class2' : 'class3')).toBe('class1 class3');

      expect(cn('class1', condition && 'class2')).toBe('class1 class2');
      expect(cn('class1', condition2 && 'class2')).toBe('class1');
    });

    it('should merge Tailwind classes correctly', () => {
      // Identical classes should be merged, with the latter taking precedence
      expect(cn('p-4 p-5')).toBe('p-5');
      
      // Different variants of the same property
      expect(cn('p-2 px-4')).toBe('p-2 px-4');
      
      // Classes with the same property should be merged
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
      
      // Different but conflicting properties
      expect(cn('text-sm font-bold', 'text-lg font-normal')).toBe('text-lg font-normal');
      
      // Classes from different sources with conflicts
      expect(cn('w-full bg-red-500', 'bg-blue-500')).toBe('w-full bg-blue-500');
    });

    it('should handle complex combinations of class merging', () => {
      const baseClasses = 'rounded-md p-2 text-sm';
      const primaryClasses = 'bg-blue-500 text-white';
      const secondaryClasses = 'bg-gray-200 text-gray-800';
      const disabledClasses = 'opacity-50 cursor-not-allowed';
      
      // Simple combination
      expect(cn(baseClasses, primaryClasses)).toBe('rounded-md p-2 text-sm bg-blue-500 text-white');
      
      // With conditional - enabled, primary
      const isPrimary = true;
      const isDisabled = false;
      expect(cn(
        baseClasses,
        isPrimary ? primaryClasses : secondaryClasses,
        isDisabled && disabledClasses
      )).toBe('rounded-md p-2 text-sm bg-blue-500 text-white');
      
      // With conditional - disabled, secondary
      const isPrimary2 = false;
      const isDisabled2 = true;
      expect(cn(
        baseClasses,
        isPrimary2 ? primaryClasses : secondaryClasses,
        isDisabled2 && disabledClasses
      )).toBe('rounded-md p-2 text-sm bg-gray-200 text-gray-800 opacity-50 cursor-not-allowed');
    });

    it('should handle empty and edge cases', () => {
      // Empty call
      expect(cn()).toBe('');
      
      // Only falsy values
      expect(cn(false && 'class', null, undefined)).toBe('');
      
      // Mix of empty strings and values
      expect(cn('', 'class1', '')).toBe('class1');
      
      // Array argument (supported by clsx)
      expect(cn(['class1', 'class2'])).toBe('class1 class2');
      
      // Object syntax (supported by clsx)
      expect(cn({ 'class1': true, 'class2': false })).toBe('class1');
    });
  });
});