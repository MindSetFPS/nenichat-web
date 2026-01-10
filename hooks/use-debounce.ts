
import { useState, useEffect } from 'react';
/**
 * `useDebounce` is a custom React hook that debounces a value.
 * This means it delays updating the value until a certain amount of time has passed
 * without any further changes to the input `value`.
 *
 * This is useful for scenarios like search inputs, where you want to wait for the user
 * to stop typing before making an API call, preventing excessive calls.
 *
 * @template T The type of the value being debounced.
 * @param {T} value The value to debounce.
 * @param {number} delay The delay in milliseconds before the debounced value is updated.
 * @returns {T} The debounced value.
 */

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
