import { useNavigate } from 'react-router-dom'
import { useDrinksStore } from '../stores/drinksStore'
import { useMembersStore } from '../stores/membersStore'
import DrinkForm from '../components/DrinkForm'

function startOfDay(): number {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export default function DrinkLogScreen() {
  const navigate = useNavigate()
  const drinks = useDrinksStore((s) => s.drinks)
  const removeDrink = useDrinksStore((s) => s.removeDrink)
  const members = useMembersStore((s) => s.members)

  const todayDrinks = drinks
    .filter((d) => d.timestamp >= startOfDay())
    .sort((a, b) => b.timestamp - a.timestamp)

  function memberName(id: string) {
    const m = members.find((m) => m.id === id)
    return m ? `${m.emoji} ${m.name}` : '?'
  }

  function formatTime(ts: number) {
    return new Date(ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="min-h-screen px-4 pt-6 pb-24">
      <h1 className="text-xl font-bold mb-5">🍺 Logger une binche</h1>

      <DrinkForm onAdded={() => navigate('/')} />

      {todayDrinks.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm text-zinc-400 font-semibold uppercase tracking-wider mb-3">
            Aujourd&apos;hui
          </h2>
          <div className="space-y-2">
            {todayDrinks.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between bg-zinc-900 rounded-xl px-3 py-2.5 border border-zinc-800"
              >
                <div>
                  <p className="text-sm font-medium">{d.name}</p>
                  <p className="text-xs text-zinc-500">
                    {memberName(d.memberId)} · {d.alcoholPercent}% · {d.volumeCl} cL · {formatTime(d.timestamp)}
                  </p>
                </div>
                <button
                  onClick={() => removeDrink(d.id)}
                  className="text-zinc-600 hover:text-red-400 text-lg ml-2"
                  aria-label="Supprimer"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
