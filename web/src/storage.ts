// Local-storage hook used for the mock-only data boundary.
// The v2 prefix prevents the React shell from resurrecting stale mock data
// shaped for the previous generation (e.g. r-001 resident ids) when users
// reload after the prototype was approved.

import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'

export const STORAGE_KEYS = {
  residents: 'careboard:residents:v2',
  events: 'careboard:events:v2',
  shifts: 'careboard:shifts:v2',
  medications: 'careboard:medications:v2',
  notifications: 'careboard:notifications:v2',
  sosHistory: 'prefs:sos-history:v1',
} as const

const safeStorage = {
  read<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback
    try {
      const raw = window.localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : fallback
    } catch {
      return fallback
    }
  },
  write<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* local-only boundary: storage failures are silent */
    }
  },
}

export function useStoredState<T>(
  key: string,
  initial: T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => safeStorage.read<T>(key, initial))
  useEffect(() => {
    safeStorage.write(key, value)
  }, [key, value])
  return [value, setValue]
}

export const clearStoredState = (key: string): void => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}