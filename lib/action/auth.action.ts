'use server'

import { auth, db } from '../../firebase/client';
import { adminAuth, adminDb } from '../../firebase/admin';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export async function signUp(params: { name: string; email: string; password: string }) {
  try {
    const { user } = await createUserWithEmailAndPassword(auth, params.email, params.password);
    
    await setDoc(doc(db, 'users', user.uid), {
      name: params.name,
      email: params.email,
      createdAt: new Date().toISOString(),
    });

    return { success: true, userId: user.uid };
  } catch (error: any) {
    console.error('Sign up error:', error);
    return { success: false, error: error.message };
  }
}

export async function signIn(params: { email: string; password: string }) {
  try {
    const { user } = await signInWithEmailAndPassword(auth, params.email, params.password);
    return { success: true, userId: user.uid };
  } catch (error: any) {
    console.error('Sign in error:', error);
    return { success: false, error: error.message };
  }
}

export async function logout() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    console.error('Logout error:', error);
    return { success: false, error: error.message };
  }
}