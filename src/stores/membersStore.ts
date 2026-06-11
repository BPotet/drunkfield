import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import { dbSet, dbDel, dbGetAll } from '../lib/db'

export interface Member {
  id: string
  name: string
  emoji: string
  weightKg?: number
  sex?: 'M' | 'F'
  createdAt: number
}

interface MembersState {
  members: Member[]
  hydrated: boolean
  hydrate: () => Promise<void>
  addMember: (data: Omit<Member, 'id' | 'createdAt'>) => Promise<Member>
  updateMember: (id: string, data: Partial<Omit<Member, 'id' | 'createdAt'>>) => Promise<void>
  removeMember: (id: string) => Promise<void>
}

export const useMembersStore = create<MembersState>((set, get) => ({
  members: [],
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return
    const members = await dbGetAll<Member>('members:')
    members.sort((a, b) => a.createdAt - b.createdAt)
    set({ members, hydrated: true })
  },

  addMember: async (data) => {
    const member: Member = { ...data, id: uuidv4(), createdAt: Date.now() }
    await dbSet(`members:${member.id}`, member)
    set((s) => ({ members: [...s.members, member] }))
    return member
  },

  updateMember: async (id, data) => {
    const existing = get().members.find((m) => m.id === id)
    if (!existing) return
    const updated = { ...existing, ...data }
    await dbSet(`members:${id}`, updated)
    set((s) => ({ members: s.members.map((m) => (m.id === id ? updated : m)) }))
  },

  removeMember: async (id) => {
    await dbDel(`members:${id}`)
    set((s) => ({ members: s.members.filter((m) => m.id !== id) }))
  },
}))

// Auto-hydrate on first import
const _init = dbGetAll<Member>('members:').then((members) => {
  members.sort((a, b) => a.createdAt - b.createdAt)
  useMembersStore.setState({ members, hydrated: true })
})
export { _init as membersHydrated }
