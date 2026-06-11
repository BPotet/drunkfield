import '@testing-library/jest-dom'
import { vi } from 'vitest'

vi.mock('idb-keyval', () => {
  const store: Record<string, unknown> = {}
  return {
    get: vi.fn((key: string) => Promise.resolve(store[key])),
    set: vi.fn((key: string, value: unknown) => {
      store[key] = value
      return Promise.resolve()
    }),
    del: vi.fn((key: string) => {
      delete store[key]
      return Promise.resolve()
    }),
    keys: vi.fn(() => Promise.resolve(Object.keys(store))),
    clear: vi.fn(() => {
      Object.keys(store).forEach((k) => delete store[k])
      return Promise.resolve()
    }),
  }
})

vi.mock('virtual:pwa-register', () => ({
  registerSW: vi.fn(),
}))
