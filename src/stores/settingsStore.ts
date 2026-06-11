import { create } from 'zustand'
import { dbGet, dbSet } from '../lib/db'

export interface Settings {
  reminderIntervalMin: number
  pushPermissionGranted: boolean
}

const DEFAULTS: Settings = {
  reminderIntervalMin: 30,
  pushPermissionGranted: false,
}

interface SettingsState {
  settings: Settings
  hydrated: boolean
  updateSettings: (partial: Partial<Settings>) => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULTS,
  hydrated: false,

  updateSettings: async (partial) => {
    const updated = { ...get().settings, ...partial }
    await dbSet('settings', updated)
    set({ settings: updated })
  },
}))

dbGet<Settings>('settings').then((stored) => {
  useSettingsStore.setState({
    settings: stored ?? DEFAULTS,
    hydrated: true,
  })
})
