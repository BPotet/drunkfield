import { get, set, del, keys } from 'idb-keyval'

export async function dbGet<T>(key: string): Promise<T | undefined> {
  return get<T>(key)
}

export async function dbSet<T>(key: string, value: T): Promise<void> {
  return set(key, value)
}

export async function dbDel(key: string): Promise<void> {
  return del(key)
}

export async function dbGetAll<T>(prefix: string): Promise<T[]> {
  const allKeys = await keys()
  const matching = (allKeys as string[]).filter((k) => k.startsWith(prefix))
  const values = await Promise.all(matching.map((k) => get<T>(k)))
  return values.filter((v): v is Awaited<T> => v !== undefined)
}
