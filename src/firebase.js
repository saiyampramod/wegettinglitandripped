import { initializeApp, getApps } from "firebase/app";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectAuthEmulator, getAuth } from "firebase/auth";

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
export const auth = firebaseReady ? getAuth(app) : null;

// Local development against the Firebase Emulator Suite instead of a real
// project — `firebase emulators:start` + VITE_USE_FIREBASE_EMULATOR=true,
// see the README. Never touches production data.
if (firebaseReady && import.meta.env.VITE_USE_FIREBASE_EMULATOR === "true") {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
}
