import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * @function getProductImageUrl
 * @description Constructs the full URL for a product image.
 *              This function centralizes image URL resolution for easy migration to external storage.
 * @param {string} path - The relative path of the image as stored in the database (e.g., '/images/products/image.jpg').
 * @returns {string} The full URL to the product image.
 */
export function getProductImageUrl(path: string): string {
  // In the current implementation, images are served from the public directory,
  // so the relative path is sufficient.
  // For future migration to external storage (e.g., S3), this function would be updated
  // to prepend the external storage URL.
  return path;
}
