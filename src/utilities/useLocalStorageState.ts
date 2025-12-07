'use client'

import { useState, useEffect, useCallback } from 'react'

/**
 * A hook that syncs state with localStorage, compatible with Next.js SSR.
 * 
 * During SSR, returns the initial value.
 * On the client, hydrates from localStorage after mount.
 * 
 * @param key - The localStorage key
 * @param initialValue - Default value when no stored value exists
 * @returns [value, setValue] - State and setter (like useState)
 */
export function useLocalStorageState<T>(
  key: string,
  initialValue: T, 
  options?: {
    serialize?: (value: T) => Promise<string>;
    deserialize?: (value: string) => Promise<T>;
  }
): [T, (value: T | ((prev: T) => T)) => void] {
  // Always start with initialValue for SSR consistency
  const [state, setState] = useState<T>(initialValue)
  const serialize = options?.serialize ?? JSON.stringify;
  const deserialize = options?.deserialize ?? JSON.parse;
  const [isHydrated, setIsHydrated] = useState(false)

  // Hydrate from localStorage on mount (client-side only)
  useEffect(() => {
    async function process() {
    try {
        const stored = localStorage.getItem(key)
        if (stored !== null) {
          setState(await deserialize(stored))
        }
      } catch (error) {
        console.warn(`Error reading localStorage key "${key}":`, error)
      }
      setIsHydrated(true)
    }
    process();
  }, [key])

  // Persist to localStorage when state changes (after hydration)
  useEffect(() => {
    async function process() {
    if (!isHydrated) return
        try {
          localStorage.setItem(key, await serialize(state))
        } catch (error) {
          console.warn(`Error writing localStorage key "${key}":`, error)
        }
      }
      process();
    }, [key, state, isHydrated])

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setState((prev) => {
      const nextValue = value instanceof Function ? value(prev) : value
      return nextValue
    })
  }, [])

  return [state, setValue]
}


