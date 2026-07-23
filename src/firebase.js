import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// The app runs fine without Firebase configured — it just falls back to
// this device only, so a fresh `git clone` isn't broken before setup.
export const firebaseReady = Boolean(config.apiKey && config.projectId);

const app = firebaseReady ? (getApps()[0] || initializeApp(config)) : null;

export const db = firebaseReady ? getFirestore(app) : null;
