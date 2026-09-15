import { useEffect, useState } from 'react'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
  type DocumentData,
} from 'firebase/firestore'

import { db } from '../firebase'

export function useFirestoreCollection<T extends { id: string }>(name: string) {
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, name),
      (snapshot) => {
        const next = snapshot.docs.map((entry) => ({
          id: entry.id,
          ...(entry.data() as DocumentData),
        })) as T[]
        setItems(next)
        setLoading(false)
        setError(null)
      },
      (err) => {
        console.error(`Firestore ${name}:`, err)
        setError(err.message)
        setLoading(false)
      },
    )

    return unsubscribe
  }, [name])

  const add = async (data: Omit<T, 'id'>) => {
    await addDoc(collection(db, name), stripUndefined(data))
  }

  const save = async (item: T) => {
    const { id, ...data } = item
    await setDoc(doc(db, name, id), stripUndefined(data))
  }

  const remove = async (id: string) => {
    await deleteDoc(doc(db, name, id))
  }

  return { items, loading, error, add, save, remove }
}

function stripUndefined<T extends object>(data: T): T {
  return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined)) as T
}
