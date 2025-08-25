/**
 * Utility Functions
 * 
 * This file contains common utility functions used throughout the application.
 * These utilities provide helper functionality for common operations like
 * CSS class name merging and conditional styling.
 * 
 * Purpose:
 * - Provide reusable utility functions
 * - Handle CSS class name merging and conflicts
 * - Support conditional styling and theming
 * - Improve code reusability and maintainability
 * 
 * Dependencies:
 * - clsx: For conditional class name joining
 * - tailwind-merge: For merging Tailwind CSS classes and resolving conflicts
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Class Name Utility Function (cn)
 * 
 * A utility function that combines clsx and tailwind-merge to create
 * conditional class names while properly merging Tailwind CSS classes
 * and resolving conflicts.
 * 
 * This function is commonly used throughout the application for:
 * - Conditional styling based on props or state
 * - Merging default styles with custom styles
 * - Resolving Tailwind CSS class conflicts
 * - Creating dynamic class names
 * 
 * @param inputs - Variable number of class values (strings, objects, arrays, etc.)
 * @returns string - Merged and resolved class name string
 * 
 * Usage Examples:
 * - cn('base-class', condition && 'conditional-class')
 * - cn('p-4', 'bg-blue-500', 'hover:bg-blue-600')
 * - cn('text-sm', { 'font-bold': isBold, 'text-red-500': hasError })
 * 
 * Expected Result:
 * - Returns a single string with all class names merged
 * - Resolves Tailwind CSS conflicts (e.g., p-4 p-6 becomes p-6)
 * - Handles conditional classes and falsy values
 * - Maintains proper class name formatting
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
