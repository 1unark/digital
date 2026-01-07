import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// This function allows for clean conditional classes 
// and merges Tailwind conflicts automatically.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}