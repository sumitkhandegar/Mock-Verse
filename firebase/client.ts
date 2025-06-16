import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA3AzEn6HyVPb2wYswBuWGw-VLfLPCpUI8",
  authDomain: "mockverse-68cf1.firebaseapp.com",
  projectId: "mockverse-68cf1",
  storageBucket: "mockverse-68cf1.firebasestorage.app",
  messagingSenderId: "130000317922",
  appId: "1:130000317922:web:6f6d7412b80f2cadda5dbb",
  measurementId: "G-MHLED8B3PR"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);