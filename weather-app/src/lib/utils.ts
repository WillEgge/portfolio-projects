/**
 * Utility functions for the application
 * 
 * Contains helper functions that are used across multiple components.
 * 
 * @module utils
 */
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines class names with tailwind-merge for proper class merging
 * 
 * Utility function that combines multiple class values and correctly handles
 * Tailwind CSS class conflicts using tailwind-merge.
 * 
 * @param inputs - Array of class values to be combined
 * @returns Combined and properly merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
