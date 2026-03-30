import { initializeApp, getApps } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  User,
  Auth,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

function assertFirebaseConfigured() {
  if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId || !firebaseConfig.appId) {
    throw new Error("Firebase is not configured. Set VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, and VITE_FIREBASE_APP_ID.");
  }
}

function getFirebaseAuth(): Auth {
  assertFirebaseConfigured();
  const firebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  return getAuth(firebaseApp);
}

export async function firebaseRegisterWithVerification(email: string, password: string): Promise<void> {
  const firebaseAuth = getFirebaseAuth();
  const cred = await createUserWithEmailAndPassword(firebaseAuth, email, password);
  await sendEmailVerification(cred.user);
  await signOut(firebaseAuth);
}

export async function firebaseLoginVerified(email: string, password: string): Promise<{ idToken: string; user: User }> {
  const firebaseAuth = getFirebaseAuth();
  const cred = await signInWithEmailAndPassword(firebaseAuth, email, password);
  await cred.user.reload();

  if (!cred.user.emailVerified) {
    await sendEmailVerification(cred.user);
    await signOut(firebaseAuth);
    throw new Error("Email not verified. We sent a fresh verification link.");
  }

  const idToken = await cred.user.getIdToken(true);
  return { idToken, user: cred.user };
}

export async function firebaseSendReset(email: string): Promise<void> {
  const firebaseAuth = getFirebaseAuth();
  await sendPasswordResetEmail(firebaseAuth, email);
}
