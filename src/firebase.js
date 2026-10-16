import { initializeApp, getApps, getApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCjmFzYZ8QzSQt64mRBmUl7UB_GMl6TxCk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "moto-pubstreet.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "moto-pubstreet",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "moto-pubstreet.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "337254162434",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:337254162434:web:f88679d61b3a5bb46e071b",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-FJ2RN6RF4P",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const storage = getStorage(app);
export const db = getFirestore(app);
export default app;
