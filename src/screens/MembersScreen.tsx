import { useState } from 'react'
import { useMembersStore, Member } from '../stores/membersStore'

const EMOJIS = ['🐶','🐱','🦊','🐺','🐻','🦁','🐯','🐸','🐧','🦉',
                 '🦋','🦄','🐉','👻','💀','🤖','👽','🎃','🎅','🧑‍🎤']

interface FormState {
  name: string
  emoji: string
  weightKg: string
  sex: 'M' | 'F' | ''
}

const EMPTY_FORM: FormState = { name: '', emoji: '🐶', weightKg: '', sex: '' }

export default function MembersScreen() {
  const members = useMembersStore((s) => s.members)
  const addMember = useMembersStore((s) => s.addMember)
  const updateMember = useMembersStore((s) => s.updateMember)
  const removeMember = useMembersStore((s) => s.removeMember)

  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  function startEdit(m: Member) {
    setEditingId(m.id)
    setForm({
      name: m.name,
      emoji: m.emoji,
      weightKg: m.weightKg ? String(m.weightKg) : '',
      sex: m.sex ?? '',
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setError('')
  }

  async function handleSubmit() {
    setError('')
    if (!form.name.trim()) return setError('Prénom requis')
    const weightKg = form.weightKg ? parseFloat(form.weightKg) : undefined
    if (form.weightKg && (isNaN(weightKg!) || weightKg! <= 0))
      return setError('Poids invalide')

    const data = {
      name: form.name.trim(),
      emoji: form.emoji,
      ...(weightKg ? { weightKg } : {}),
      ...(form.sex ? { sex: form.sex as 'M' | 'F' } : {}),
    }

    if (editingId) {
      await updateMember(editingId, data)
    } else {
      await addMember(data)
    }
    cancelEdit()
  }

  return (
    <div className="min-h-screen px-4 pt-6 pb-24">
      <h1 className="text-xl font-bold mb-5">👥 Le groupe</h1>

      {/* Member list */}
      <div className="space-y-2 mb-6">
        {members.length === 0 && (
          <p className="text-zinc-500 text-sm text-center py-4">Aucun membre pour l&apos;instant</p>
        )}
        {members.map((m) => (
          <div
            key={m.id}
            className="flex items-center justify-between bg-zinc-900 rounded-xl px-4 py-3 border border-zinc-800"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{m.emoji}</span>
              <div>
                <p className="font-medium">{m.name}</p>
                <p className="text-xs text-zinc-500">
                  {m.weightKg ? `${m.weightKg} kg` : 'Poids non renseigné'}
                  {m.sex ? ` · ${m.sex === 'M' ? 'Homme' : 'Femme'}` : ''}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => startEdit(m)}
                className="text-zinc-400 hover:text-white text-sm px-2"
              >
                ✏️
              </button>
              <button
                onClick={() => removeMember(m.id)}
                className="text-zinc-600 hover:text-red-400 text-lg px-1"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit form */}
      <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-700">
        <h2 className="font-semibold mb-4">{editingId ? '✏️ Modifier' : '➕ Ajouter'} un membre</h2>

        <div className="mb-3">
          <label className="block text-sm text-zinc-400 mb-1">Prénom</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="ex: Alex"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-green-500"
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm text-zinc-400 mb-2">Avatar</label>
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setForm((f) => ({ ...f, emoji: e }))}
                className={`text-2xl p-1 rounded-lg ${form.emoji === e ? 'bg-green-700 ring-2 ring-green-400' : 'bg-zinc-800'}`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 mb-3">
          <div className="flex-1">
            <label className="block text-sm text-zinc-400 mb-1">Poids (kg) <span className="text-zinc-600">optionnel</span></label>
            <input
              type="number"
              value={form.weightKg}
              onChange={(e) => setForm((f) => ({ ...f, weightKg: e.target.value }))}
              placeholder="70"
              min="1"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-green-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-zinc-400 mb-1">Sexe <span className="text-zinc-600">optionnel</span></label>
            <select
              value={form.sex}
              onChange={(e) => setForm((f) => ({ ...f, sex: e.target.value as 'M' | 'F' | '' }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-green-500"
            >
              <option value="">—</option>
              <option value="M">Homme</option>
              <option value="F">Femme</option>
            </select>
          </div>
        </div>

        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

        <div className="flex gap-2">
          {editingId && (
            <button
              onClick={cancelEdit}
              className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              Annuler
            </button>
          )}
          <button
            onClick={handleSubmit}
            className="flex-1 py-2.5 rounded-xl bg-green-700 hover:bg-green-600 text-white font-semibold"
          >
            {editingId ? 'Sauvegarder' : 'Ajouter'}
          </button>
        </div>
      </div>
    </div>
  )
}
