import { useState, FormEvent } from 'react'
import { useMembersStore } from '../stores/membersStore'
import { useDrinksStore } from '../stores/drinksStore'

interface Props {
  onAdded?: () => void
}

const PRESET_DRINKS = [
  { name: 'Bière pression', percent: 5, volume: 25 },
  { name: 'Leffe Blonde', percent: 6.6, volume: 33 },
  { name: 'Duvel', percent: 8.5, volume: 33 },
  { name: 'Vin rouge', percent: 12.5, volume: 15 },
  { name: 'Shot', percent: 40, volume: 4 },
]

export default function DrinkForm({ onAdded }: Props) {
  const members = useMembersStore((s) => s.members)
  const addDrink = useDrinksStore((s) => s.addDrink)

  const [memberId, setMemberId] = useState(members[0]?.id ?? '')
  const [name, setName] = useState('')
  const [percent, setPercent] = useState('')
  const [volume, setVolume] = useState('')
  const [error, setError] = useState('')

  function applyPreset(preset: (typeof PRESET_DRINKS)[0]) {
    setName(preset.name)
    setPercent(String(preset.percent))
    setVolume(String(preset.volume))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (!memberId) return setError('Sélectionnez un membre')
    if (!name.trim()) return setError('Nom de la boisson requis')
    const p = parseFloat(percent)
    const v = parseFloat(volume)
    if (isNaN(p) || p < 0 || p > 100) return setError('% alcool invalide (0–100)')
    if (isNaN(v) || v <= 0) return setError('Volume invalide (> 0 cL)')

    await addDrink({ memberId, name: name.trim(), alcoholPercent: p, volumeCl: v })
    setName('')
    setPercent('')
    setVolume('')
    onAdded?.()
  }

  if (members.length === 0) {
    return (
      <p className="text-zinc-400 text-center py-8">
        Ajoutez d&apos;abord des membres dans l&apos;onglet Groupe.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Member selector */}
      <div>
        <label className="block text-sm text-zinc-400 mb-1">Qui boit ?</label>
        <div className="flex flex-wrap gap-2">
          {members.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMemberId(m.id)}
              className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 border transition-colors ${
                memberId === m.id
                  ? 'bg-green-700 border-green-500 text-white'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-300'
              }`}
            >
              {m.emoji} {m.name}
            </button>
          ))}
        </div>
      </div>

      {/* Presets */}
      <div>
        <label className="block text-sm text-zinc-400 mb-1">Raccourcis</label>
        <div className="flex flex-wrap gap-2">
          {PRESET_DRINKS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => applyPreset(p)}
              className="px-2 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 hover:bg-zinc-700"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Fields */}
      <div>
        <label className="block text-sm text-zinc-400 mb-1">Boisson</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ex: Leffe Blonde"
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-green-500"
        />
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-sm text-zinc-400 mb-1">% Alcool</label>
          <input
            type="number"
            value={percent}
            onChange={(e) => setPercent(e.target.value)}
            placeholder="5"
            min="0"
            max="100"
            step="0.1"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-green-500"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm text-zinc-400 mb-1">Volume (cL)</label>
          <input
            type="number"
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            placeholder="33"
            min="0"
            step="1"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-green-500"
          />
        </div>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        className="w-full bg-green-700 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors"
      >
        🍺 Logger la binche
      </button>
    </form>
  )
}
