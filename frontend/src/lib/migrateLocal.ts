import { collection, doc, getDocs, setDoc } from 'firebase/firestore'

import { db } from '../firebase'

export async function migrateLocalArray(localKey: string, collectionName: string) {
  try {
    const raw = localStorage.getItem(localKey)
    if (!raw) return

    const existing = await getDocs(collection(db, collectionName))
    if (!existing.empty) {
      localStorage.removeItem(localKey)
      return
    }

    const parsed = JSON.parse(raw) as Array<{ id: string } & Record<string, unknown>>
    if (!Array.isArray(parsed) || parsed.length === 0) return

    await Promise.all(
      parsed.map((item) => {
        const { id, ...data } = item
        return setDoc(doc(db, collectionName, id || crypto.randomUUID()), data)
      }),
    )
    localStorage.removeItem(localKey)
  } catch (error) {
    console.error(`Could not migrate ${localKey}:`, error)
  }
}
