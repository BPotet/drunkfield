import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useMembersStore } from '../stores/membersStore'
import { useDrinksStore } from '../stores/drinksStore'
import { useRatingsStore } from '../stores/ratingsStore'
import { computeBAC } from '../lib/widmark'
import MemberCard from '../components/MemberCard'

export default function HomeScreen() {
  const members = useMembersStore((s) => s.members)
  const drinks = useDrinksStore((s) => s.drinks)
  const ratings = useRatingsStore((s) => s.ratings)
  const now = Date.now()

  const ranked = useMemo(() => {
    return members
      .map((m) => {
        const memberDrinks = drinks.filter((d) => d.memberId === m.id)
        const memberRatings = ratings.filter((r) => r.memberId === m.id)
        const bac = computeBAC(memberDrinks, m, now)
        const lastRating = memberRatings[memberRatings.length - 1]
        return { member: m, bac, lastRating }
      })
      .sort((a, b) => {
        // sort by BAC desc; nulls last; then by self-rating desc
        if (a.bac !== null && b.bac !== null) return b.bac - a.bac
        if (a.bac !== null) return -1
        if (b.bac !== null) return 1
        const aScore = a.lastRating?.score ?? -1
        const bScore = b.lastRating?.score ?? -1
        return bScore - aScore
      })
  }, [members, drinks, ratings, now])

  return (
    <div className="min-h-screen px-4 pt-6 pb-24">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">🍺 DrunkField</h1>
        <Link
          to="/drinks"
          className="bg-green-700 hover:bg-green-600 text-white text-2xl w-10 h-10 rounded-full flex items-center justify-center"
        >
          +
        </Link>
      </div>

      <div className="bg-yellow-900/30 border border-yellow-700/40 rounded-xl px-3 py-2 mb-5 text-xs text-yellow-400">
        ⚠️ Les estimations d&apos;alcoolémie sont indicatives. Ne conduisez jamais après avoir bu.
      </div>

      {members.length === 0 ? (
        <div className="text-center text-zinc-400 py-16">
          <p className="text-4xl mb-3">👥</p>
          <p className="mb-4">Ajoutez votre groupe pour commencer</p>
          <Link
            to="/members"
            className="inline-block bg-green-700 hover:bg-green-600 text-white px-5 py-2 rounded-xl"
          >
            Créer le groupe
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {ranked.map(({ member, bac, lastRating }, i) => (
            <MemberCard
              key={member.id}
              member={member}
              bac={bac}
              lastRating={lastRating}
              rank={i + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
