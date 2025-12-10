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

/**
 * @function formatCurrency
 * @description Formats a number as currency with proper locale formatting.
 * @param {number} amount - The amount to format.
 * @param {string} currency - The currency code (default: 'USD').
 * @param {string} locale - The locale to use for formatting (default: 'en-US').
 * @returns {string} The formatted currency string.
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'delivered': return 'bg-green-100 text-green-800 hover:bg-green-100';
    case 'shipped': return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
    case 'processing': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
    case 'cancelled': return 'bg-red-100 text-red-800 hover:bg-red-100';
    default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
  }
};

export const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case 'paid': return 'bg-green-100 text-green-800 hover:bg-green-100';
    case 'partial': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
    case 'refunded': return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
    default: return 'bg-red-100 text-red-800 hover:bg-red-100';
  }
};