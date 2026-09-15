import { useEffect, useState } from 'react'
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
  type DocumentData,
} from 'firebase/firestore'

import { db, waitForAuth } from '../firebase'

function toItems<T extends { id: string }>(docs: { id: string; data: () => DocumentData }[]): T[] {
  return docs.map((entry) => ({ id: entry.id, ...entry.data() }) as T)
}

export function useFirestoreCollection<T extends { id: string }>(name: string) {
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const colRef = collection(db, name)
    let unsub = () => {}
    let cancelled = false

    async function listen() {
      try {
        await waitForAuth()
        if (cancelled) return

        const initial = await getDocs(colRef)
        if (!cancelled) {
          setItems(toItems<T>(initial.docs))
          setLoading(false)
          setError(null)
        }

        unsub = onSnapshot(
          colRef,
          (snapshot) => {
            if (snapshot.metadata.hasPendingWrites) {
              setItems(toItems<T>(snapshot.docs))
              return
            }
            setItems(toItems<T>(snapshot.docs))
            setLoading(false)
            setError(null)
          },
          (err) => {
            console.error(`Firestore ${name}:`, err)
            setError(err.message)
            setLoading(false)
          },
        )
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        console.error(`Firestore ${name}:`, err)
        if (!cancelled) {
          setError(message)
          setLoading(false)
        }
      }
    }

    void listen()
    return () => {
      cancelled = true
      unsub()
    }
  }, [name])

  const add = async (data: Omit<T, 'id'>) => {
    await waitForAuth()
    const colRef = collection(db, name)
    const docRef = doc(colRef)
    await setDoc(docRef, sanitize(data))
    return docRef.id
  }

  const save = async (item: T) => {
    await waitForAuth()
    const { id, ...data } = item
    const docRef = doc(collection(db, name), id)
    await setDoc(docRef, sanitize(data), { merge: true })
  }

  const remove = async (id: string) => {
    await waitForAuth()
    await deleteDoc(doc(collection(db, name), id))
  }

  return { items, loading, error, add, save, remove }
}

function sanitize(data: object): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue
    if (typeof value === 'number' && Number.isNaN(value)) continue
    out[key] = value
  }
  return out
}
