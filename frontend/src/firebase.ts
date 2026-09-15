import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

import { firebaseConfig, isFirebaseConfigured } from './config'

if (!isFirebaseConfigured) {
  console.warn(
    'Firebase env vars are missing. Copy frontend/.env.example to frontend/.env and fill VITE_FIREBASE_* values.',
  )
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
