import { useState } from 'react'
import { useRatingsStore } from '../stores/ratingsStore'
import { scoreToEmoji } from '../lib/widmark'

interface Props {
  memberId: string
  memberName: string
  memberEmoji: string
  onClose: () => void
}

export default function RatingModal({ memberId, memberName, memberEmoji, onClose }: Props) {
  const addRating = useRatingsStore((s) => s.addRating)
  const [score, setScore] = useState(5)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    await addRating(memberId, score)
    setSaved(true)
    setTimeout(onClose, 600)
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
      <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-sm border border-zinc-700 space-y-5">
        <div className="text-center">
          <span className="text-5xl">{memberEmoji}</span>
          <h2 className="text-xl font-bold mt-2">{memberName}</h2>
          <p className="text-zinc-400 text-sm">Comment tu te sens ?</p>
        </div>

        <div className="text-center">
          <span className="text-5xl">{scoreToEmoji(score)}</span>
          <p className="text-4xl font-bold mt-1">{score}<span className="text-xl text-zinc-400">/10</span></p>
        </div>

        <div className="px-2">
          <input
            type="range"
            min={0}
            max={10}
            value={score}
            onChange={(e) => setScore(Number(e.target.value))}
            className="w-full accent-green-500"
          />
          <div className="flex justify-between text-xs text-zinc-500 mt-1">
            <span>Sobre 😊</span>
            <span>HS 💀</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saved}
            className="flex-1 py-2.5 rounded-xl bg-green-700 hover:bg-green-600 text-white font-semibold disabled:opacity-60"
          >
            {saved ? '✓ Sauvé' : 'Valider'}
          </button>
        </div>
      </div>
    </div>
  )
}
