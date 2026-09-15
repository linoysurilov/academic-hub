import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

export const firebaseConfig = {
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBPFkcDeoPe6jILzV6bzpbVrIlhJegaU').replace(/\s/g, ''),
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'personal-ai-hub-490df.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'personal-ai-hub-490df',
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'personal-ai-hub-490df.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '959485317312',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:959485317312:web:6e4de03015751de02a5d25',
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)

export function waitForAuth(): Promise<void> {
  if (auth.currentUser) return Promise.resolve()
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        unsubscribe()
        resolve()
        return
      }
      signInAnonymously(auth)
        .then(() => {
          unsubscribe()
          resolve()
        })
        .catch(() => {
          unsubscribe()
          resolve()
        })
    })
  })
}

export const COLLECTIONS = {
  calendar: 'calendar_events',
  schedule: 'schedule',
  scheduleNotes: 'schedule_notes',
  tasks: 'academic_courses',
  exams: 'exams',
} as const
