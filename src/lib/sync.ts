import { ref, set, remove, onValue, get as dbGet } from 'firebase/database'
import { db } from './firebase'
import type { Member } from '../stores/membersStore'
import type { Drink } from '../stores/drinksStore'
import type { DrunkRating } from '../stores/ratingsStore'
import { dbSet } from './db'

// Guard against write loops when receiving remote updates
let isSyncingFromFirebase = false

export async function syncMemberToFirebase(sessionCode: string, member: Member): Promise<void> {
  await set(ref(db, `sessions/${sessionCode}/members/${member.id}`), member)
}

export async function deleteMemberFromFirebase(
  sessionCode: string,
  memberId: string,
): Promise<void> {
  await remove(ref(db, `sessions/${sessionCode}/members/${memberId}`))
}

export async function syncDrinkToFirebase(sessionCode: string, drink: Drink): Promise<void> {
  await set(ref(db, `sessions/${sessionCode}/drinks/${drink.id}`), drink)
}

export async function deleteDrinkFromFirebase(
  sessionCode: string,
  drinkId: string,
): Promise<void> {
  await remove(ref(db, `sessions/${sessionCode}/drinks/${drinkId}`))
}

export async function syncRatingToFirebase(
  sessionCode: string,
  rating: DrunkRating,
): Promise<void> {
  await set(ref(db, `sessions/${sessionCode}/ratings/${rating.id}`), rating)
}

export function subscribeToSession(sessionCode: string): () => void {
  const sessionRef = ref(db, `sessions/${sessionCode}`)

  const unsubscribe = onValue(sessionRef, async (snapshot) => {
    const data = snapshot.val() as {
      members?: Record<string, Member>
      drinks?: Record<string, Drink>
      ratings?: Record<string, DrunkRating>
    } | null

    if (!data) return

    // Set flag to prevent local mutations from echoing back to Firebase
    isSyncingFromFirebase = true

    try {
      const { useMembersStore } = await import('../stores/membersStore')
      const { useDrinksStore } = await import('../stores/drinksStore')
      const { useRatingsStore } = await import('../stores/ratingsStore')

      if (data.members) {
        const members = Object.values(data.members)
        members.sort((a, b) => a.createdAt - b.createdAt)
        for (const member of members) {
          await dbSet(`members:${member.id}`, member)
        }
        useMembersStore.setState({ members })
      }

      if (data.drinks) {
        const drinks = Object.values(data.drinks)
        drinks.sort((a, b) => a.timestamp - b.timestamp)
        for (const drink of drinks) {
          await dbSet(`drinks:${drink.id}`, drink)
        }
        useDrinksStore.setState({ drinks })
      }

      if (data.ratings) {
        const ratings = Object.values(data.ratings)
        ratings.sort((a, b) => a.timestamp - b.timestamp)
        for (const rating of ratings) {
          await dbSet(`ratings:${rating.id}`, rating)
        }
        useRatingsStore.setState({ ratings })
      }
    } finally {
      isSyncingFromFirebase = false
    }
  })

  return unsubscribe
}

export async function pushLocalDataToFirebase(sessionCode: string): Promise<void> {
  const { useMembersStore } = await import('../stores/membersStore')
  const { useDrinksStore } = await import('../stores/drinksStore')
  const { useRatingsStore } = await import('../stores/ratingsStore')

  const { members } = useMembersStore.getState()
  const { drinks } = useDrinksStore.getState()
  const { ratings } = useRatingsStore.getState()

  await Promise.all([
    ...members.map((m) => syncMemberToFirebase(sessionCode, m)),
    ...drinks.map((d) => syncDrinkToFirebase(sessionCode, d)),
    ...ratings.map((r) => syncRatingToFirebase(sessionCode, r)),
  ])
}

export async function pullFirebaseDataToLocal(sessionCode: string): Promise<void> {
  const snapshot = await dbGet(ref(db, `sessions/${sessionCode}`))
  const data = snapshot.val() as {
    members?: Record<string, Member>
    drinks?: Record<string, Drink>
    ratings?: Record<string, DrunkRating>
  } | null

  if (!data) return

  const { useMembersStore } = await import('../stores/membersStore')
  const { useDrinksStore } = await import('../stores/drinksStore')
  const { useRatingsStore } = await import('../stores/ratingsStore')

  if (data.members) {
    const members = Object.values(data.members)
    members.sort((a, b) => a.createdAt - b.createdAt)
    for (const member of members) {
      await dbSet(`members:${member.id}`, member)
    }
    useMembersStore.setState({ members })
  }

  if (data.drinks) {
    const drinks = Object.values(data.drinks)
    drinks.sort((a, b) => a.timestamp - b.timestamp)
    for (const drink of drinks) {
      await dbSet(`drinks:${drink.id}`, drink)
    }
    useDrinksStore.setState({ drinks })
  }

  if (data.ratings) {
    const ratings = Object.values(data.ratings)
    ratings.sort((a, b) => a.timestamp - b.timestamp)
    for (const rating of ratings) {
      await dbSet(`ratings:${rating.id}`, rating)
    }
    useRatingsStore.setState({ ratings })
  }
}

export function isSyncingFromRemote(): boolean {
  return isSyncingFromFirebase
}

