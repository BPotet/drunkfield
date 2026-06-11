import { Member } from '../stores/membersStore'
import { DrunkRating } from '../stores/ratingsStore'
import { bacToEmoji, scoreToEmoji } from '../lib/widmark'

interface Props {
  member: Member
  bac: number | null
  lastRating: DrunkRating | undefined
  rank: number
}

export default function MemberCard({ member, bac, lastRating, rank }: Props) {
  const bacDisplay = bac !== null ? bac.toFixed(2) : null

  return (
    <div className="bg-zinc-900 rounded-2xl p-4 flex items-center gap-4 border border-zinc-800">
      <div className="relative flex-shrink-0">
        <span className="text-4xl">{member.emoji}</span>
        <span className="absolute -top-1 -left-1 text-xs bg-green-700 rounded-full w-5 h-5 flex items-center justify-center font-bold">
          {rank}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white truncate">{member.name}</p>

        {bacDisplay ? (
          <p className="text-sm text-zinc-300">
            {bacToEmoji(bac!)} {bacDisplay} g/L
          </p>
        ) : (
          <p className="text-sm text-zinc-500 italic">
            {member.weightKg ? '0.00 g/L' : 'Ajoutez votre poids →'}
          </p>
        )}

        {lastRating && (
          <p className="text-xs text-zinc-400 mt-0.5">
            Auto-éval : {scoreToEmoji(lastRating.score)} {lastRating.score}/10
          </p>
        )}
      </div>

      <div className="text-right text-xs text-zinc-500">
        <p>⚠️ indicatif</p>
      </div>
    </div>
  )
}
