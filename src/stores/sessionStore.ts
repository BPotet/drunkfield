import { create } from 'zustand'
import { dbGet, dbSet, dbDel } from '../lib/db'

interface SessionState {
  sessionCode: string | null
  isHost: boolean
  syncActive: boolean

  createSession: () => Promise<string>
  joinSession: (code: string) => Promise<void>
  leaveSession: () => Promise<void>
}

let _unsubscribe: (() => void) | null = null

export const useSessionStore = create<SessionState>((set) => ({
  sessionCode: null,
  isHost: false,
  syncActive: false,

  createSession: async () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    await dbSet('session:code', code)
    await dbSet('session:isHost', true)
    set({ sessionCode: code, isHost: true, syncActive: false })

    const { pushLocalDataToFirebase, subscribeToSession } = await import('../lib/sync')
    await pushLocalDataToFirebase(code)
    _unsubscribe = subscribeToSession(code)
    set({ syncActive: true })

    return code
  },

  joinSession: async (code) => {
    const normalized = code.trim().toUpperCase()
    await dbSet('session:code', normalized)
    await dbSet('session:isHost', false)
    set({ sessionCode: normalized, isHost: false, syncActive: false })

    const { pullFirebaseDataToLocal, subscribeToSession } = await import('../lib/sync')
    await pullFirebaseDataToLocal(normalized)
    _unsubscribe = subscribeToSession(normalized)
    set({ syncActive: true })
  },

  leaveSession: async () => {
    if (_unsubscribe) {
      _unsubscribe()
      _unsubscribe = null
    }
    await dbDel('session:code')
    await dbDel('session:isHost')
    set({ sessionCode: null, isHost: false, syncActive: false })
  },
}))

// Auto-hydrate on import — reconnect if session was active
Promise.all([dbGet<string>('session:code'), dbGet<boolean>('session:isHost')]).then(
  async ([code, isHost]) => {
    if (code) {
      useSessionStore.setState({ sessionCode: code, isHost: isHost ?? false, syncActive: false })
      const { subscribeToSession } = await import('../lib/sync')
      _unsubscribe = subscribeToSession(code)
      useSessionStore.setState({ syncActive: true })
    }
  },
)
