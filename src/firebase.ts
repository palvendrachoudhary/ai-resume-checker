import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCsrcAJBrq86N97PH88yN0GBllUpphyqbk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ai-resume-checker-91982.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ai-resume-checker-91982",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ai-resume-checker-91982.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "709607935624",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:709607935624:web:3c2e24c854cae13dd2d93d",
  measurementId: "G-2DT7KNJ21J",
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || "(default)",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
