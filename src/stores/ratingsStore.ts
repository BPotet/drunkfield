import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import { dbSet, dbGetAll } from '../lib/db'

export interface DrunkRating {
  id: string
  memberId: string
  score: number
  timestamp: number
}

interface RatingsState {
  ratings: DrunkRating[]
  hydrated: boolean
  addRating: (memberId: string, score: number) => Promise<DrunkRating>
}

export const useRatingsStore = create<RatingsState>((set) => ({
  ratings: [],
  hydrated: false,

  addRating: async (memberId, score) => {
    const rating: DrunkRating = { id: uuidv4(), memberId, score, timestamp: Date.now() }
    await dbSet(`ratings:${rating.id}`, rating)
    set((s) => ({ ratings: [...s.ratings, rating] }))
    return rating
  },
}))

dbGetAll<DrunkRating>('ratings:').then((ratings) => {
  ratings.sort((a, b) => a.timestamp - b.timestamp)
  useRatingsStore.setState({ ratings, hydrated: true })
})
