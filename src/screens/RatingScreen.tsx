import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useMembersStore } from '../stores/membersStore'
import { useRatingsStore } from '../stores/ratingsStore'
import { scoreToEmoji } from '../lib/widmark'

export default function RatingScreen() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const members = useMembersStore((s) => s.members)
  const addRating = useRatingsStore((s) => s.addRating)

  const preselected = params.get('memberId') ?? members[0]?.id ?? ''
  const [memberId, setMemberId] = useState(preselected)
  const [score, setScore] = useState(5)
  const [saved, setSaved] = useState(false)

  const member = members.find((m) => m.id === memberId)

  async function handleSave() {
    if (!memberId) return
    await addRating(memberId, score)
    setSaved(true)
    setTimeout(() => navigate('/'), 700)
  }

  if (members.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-center">
        <div>
          <p className="text-4xl mb-3">👥</p>
          <p className="text-zinc-400">Ajoutez d&apos;abord des membres.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 pt-10 pb-24 flex flex-col items-center">
      <h1 className="text-xl font-bold mb-6">🥴 Mon niveau d&apos;ivresse</h1>

      {/* Member selector */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {members.map((m) => (
          <button
            key={m.id}
            onClick={() => setMemberId(m.id)}
            className={`px-4 py-2 rounded-full flex items-center gap-2 border transition-colors ${
              memberId === m.id
                ? 'bg-green-700 border-green-500 text-white'
                : 'bg-zinc-800 border-zinc-700 text-zinc-300'
            }`}
          >
            {m.emoji} {m.name}
          </button>
        ))}
      </div>

      {/* Score display */}
      <div className="text-center mb-8">
        <div className="text-8xl mb-2">{scoreToEmoji(score)}</div>
        {member && <p className="text-zinc-400 mb-1">{member.name}</p>}
        <p className="text-6xl font-black">
          {score}<span className="text-2xl text-zinc-400">/10</span>
        </p>
      </div>

      {/* Slider */}
      <div className="w-full max-w-xs mb-8">
        <input
          type="range"
          min={0}
          max={10}
          value={score}
          onChange={(e) => setScore(Number(e.target.value))}
          className="w-full accent-green-500 h-2"
        />
        <div className="flex justify-between text-xs text-zinc-500 mt-2">
          <span>Sobre 😊</span>
          <span>HS 💀</span>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={!memberId || saved}
        className="w-full max-w-xs py-4 rounded-2xl bg-green-700 hover:bg-green-600 text-white text-lg font-bold disabled:opacity-50"
      >
        {saved ? '✓ Sauvegardé !' : 'Valider mon état'}
      </button>
    </div>
  )
}
