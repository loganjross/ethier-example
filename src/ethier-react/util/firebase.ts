import { initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  getAuth,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
} from 'firebase/firestore';
import { EthierUser } from '../contexts/ethier';

const firebaseApp = initializeApp({
  apiKey: 'AIzaSyAT2zrH91wB_G66YOjzxwo2rkWK2RBBc1M',
  projectId: 'ethier-e0044',
});
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

// Create a new firebase user
export async function createFirebaseUser(email: string, password: string) {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  return user;
}

// Login a firebase user
export async function loginFirebaseUser(email: string, password: string) {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
}

// Logout a firebase user
export async function logoutFirebaseUser() {
  await auth.signOut();
  return;
}

// Delete a firebase user
export async function deleteFirebaseUser(user: EthierUser) {
  await user.deleteFirebase();
  await deleteDoc(doc(db, 'user_keypairs', user.firebaseId));
  return;
}

// Fetch data for user
export async function fetchUserData(uid: string) {
  const docRef = doc(db, 'user_keypairs', uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data();
  }
}

// Set data for user
export async function setUserData(uid: string, data: any) {
  await setDoc(doc(db, 'user_keypairs', uid), data);
  return;
}