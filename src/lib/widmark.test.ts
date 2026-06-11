import { describe, it, expect } from 'vitest'
import { computeBAC, R_MALE, R_FEMALE } from './widmark'

const NOW = 1_700_000_000_000

describe('computeBAC', () => {
  it('returns null when weight is unknown', () => {
    expect(computeBAC([], {}, NOW)).toBeNull()
  })

  it('returns 0 with no drinks', () => {
    expect(computeBAC([], { weightKg: 70 }, NOW)).toBe(0)
  })

  it('uses male r factor by default', () => {
    const drink = { alcoholPercent: 5, volumeCl: 33, timestamp: NOW - 100 }
    const bac = computeBAC([drink], { weightKg: 70 }, NOW)
    expect(bac).not.toBeNull()
    // pureAlcoholG = 3.3 * 0.05 * 789 = ~130.2, peakBac = 130.2 / (70 * 0.68 * 10) ≈ 0.274
    expect(bac!).toBeGreaterThan(0.2)
    expect(bac!).toBeLessThan(0.4)
  })

  it('uses female r factor when sex is F', () => {
    const drink = { alcoholPercent: 5, volumeCl: 33, timestamp: NOW - 100 }
    const bacM = computeBAC([drink], { weightKg: 70, sex: 'M' }, NOW)
    const bacF = computeBAC([drink], { weightKg: 70, sex: 'F' }, NOW)
    expect(bacF!).toBeGreaterThan(bacM!)
  })

  it('applies elimination for drinks consumed 2h ago', () => {
    const drink = {
      alcoholPercent: 5,
      volumeCl: 33,
      timestamp: NOW - 2 * 3_600_000,
    }
    const bacFresh = computeBAC(
      [{ ...drink, timestamp: NOW - 100 }],
      { weightKg: 70 },
      NOW,
    )
    const bacOld = computeBAC([drink], { weightKg: 70 }, NOW)
    expect(bacOld!).toBeLessThan(bacFresh!)
  })

  it('floors BAC at 0 (no negative values)', () => {
    const drink = {
      alcoholPercent: 2,
      volumeCl: 10,
      timestamp: NOW - 10 * 3_600_000,
    }
    expect(computeBAC([drink], { weightKg: 70 }, NOW)).toBe(0)
  })

  it('r constants are correct', () => {
    expect(R_MALE).toBe(0.68)
    expect(R_FEMALE).toBe(0.55)
  })
})
