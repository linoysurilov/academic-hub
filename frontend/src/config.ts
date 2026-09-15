const env = (key: keyof ImportMetaEnv, fallback = '') =>
  (import.meta.env[key] || fallback).trim()

export const apiBase = env('VITE_API_BASE', '/api')

export const firebaseConfig = {
  apiKey: env('VITE_FIREBASE_API_KEY', 'AIzaSyBPFkcDeoPe6jILzV6bzpbVrIlhJegaU').replace(/\s/g, ''),
  authDomain: env('VITE_FIREBASE_AUTH_DOMAIN', 'personal-ai-hub-490df.firebaseapp.com'),
  projectId: env('VITE_FIREBASE_PROJECT_ID', 'personal-ai-hub-490df'),
  storageBucket: env(
    'VITE_FIREBASE_STORAGE_BUCKET',
    'personal-ai-hub-490df.firebasestorage.app',
  ),
  messagingSenderId: env('VITE_FIREBASE_MESSAGING_SENDER_ID', '959485317312'),
  appId: env('VITE_FIREBASE_APP_ID', '1:959485317312:web:6e4de03015751de02a5d25'),
}

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)
