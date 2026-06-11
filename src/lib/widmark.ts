export interface DrinkInput {
  alcoholPercent: number
  volumeCl: number
  timestamp: number
}

export interface MemberInput {
  weightKg?: number
  sex?: 'M' | 'F'
}

export const R_MALE = 0.68
export const R_FEMALE = 0.55

/** Returns estimated BAC in g/L, or null if weight is unknown. */
export function computeBAC(
  drinks: DrinkInput[],
  member: MemberInput,
  nowMs: number,
): number | null {
  if (!member.weightKg) return null

  const r = member.sex === 'F' ? R_FEMALE : R_MALE

  let totalBac = 0
  for (const drink of drinks) {
    const hoursElapsed = (nowMs - drink.timestamp) / 3_600_000
    if (hoursElapsed < 0) continue

    // grams of pure alcohol in this drink
    const pureAlcoholG = (drink.volumeCl / 10) * (drink.alcoholPercent / 100) * 789

    // peak BAC contribution from this drink
    const peakBac = pureAlcoholG / (member.weightKg * r * 10)

    // subtract elimination since drink was consumed
    const eliminated = 0.15 * hoursElapsed
    const contribution = Math.max(0, peakBac - eliminated)
    totalBac += contribution
  }

  return Math.max(0, totalBac)
}

/** Maps a BAC value to a drunkenness emoji. */
export function bacToEmoji(bac: number): string {
  if (bac < 0.3) return '😊'
  if (bac < 0.6) return '😄'
  if (bac < 1.0) return '🥴'
  if (bac < 1.5) return '😵'
  return '💀'
}

/** Maps a self-rated score (0–10) to an emoji. */
export function scoreToEmoji(score: number): string {
  if (score <= 2) return '😊'
  if (score <= 4) return '😄'
  if (score <= 6) return '🥴'
  if (score <= 8) return '😵'
  return '💀'
}
