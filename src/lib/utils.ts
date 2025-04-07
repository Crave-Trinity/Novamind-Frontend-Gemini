import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Conditionally joins class names together using clsx and merges Tailwind CSS classes using tailwind-merge.
 * @param inputs - A list of class values to merge.
 * @returns A string of merged class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}