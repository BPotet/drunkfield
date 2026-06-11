import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import { dbSet, dbDel, dbGetAll } from '../lib/db'


export interface Drink {
  id: string
  memberId: string
  name: string
  alcoholPercent: number
  volumeCl: number
  timestamp: number
}

interface DrinksState {
  drinks: Drink[]
  hydrated: boolean
  addDrink: (data: Omit<Drink, 'id' | 'timestamp'>) => Promise<Drink>
  removeDrink: (id: string) => Promise<void>
}

export const useDrinksStore = create<DrinksState>((set) => ({
  drinks: [],
  hydrated: false,

  addDrink: async (data) => {
    const drink: Drink = { ...data, id: uuidv4(), timestamp: Date.now() }
    await dbSet(`drinks:${drink.id}`, drink)
    set((s) => ({ drinks: [...s.drinks, drink] }))
    return drink
  },

  removeDrink: async (id) => {
    await dbDel(`drinks:${id}`)
    set((s) => ({ drinks: s.drinks.filter((d) => d.id !== id) }))
  },
}))

dbGetAll<Drink>('drinks:').then((drinks) => {
  drinks.sort((a, b) => a.timestamp - b.timestamp)
  useDrinksStore.setState({ drinks, hydrated: true })
})
