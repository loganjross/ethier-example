import { createContext, useContext, useState } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  User,
} from 'firebase/auth';
import { useModal } from './modal';

// Firebase
const firebaseApp = initializeApp({
  apiKey: 'AIzaSyAT2zrH91wB_G66YOjzxwo2rkWK2RBBc1M',
  projectId: 'ethier-e0044',
});
const auth = getAuth(firebaseApp);

// Firebase context
interface Firebase {
  user: User | null;
  createAccountOrSignIn: (
    email: string,
    password: string,
    creatingAccount: boolean
  ) => Promise<boolean>;
}
const FirebaseContext = createContext<Firebase>({
  user: null,
  createAccountOrSignIn: async () => false,
});

// Firebase context provider
export function FirebaseProvider(props: { children: any }) {
  const { setCurrentPage } = useModal();
  const [user, setUser] = useState<User | null>(null);

  // Creates a new user or signs in an existing one
  async function createAccountOrSignIn(
    email: string,
    password: string,
    creatingAccount: boolean
  ) {
    try {
      const { user } = creatingAccount
        ? await createUserWithEmailAndPassword(auth, email, password)
        : await signInWithEmailAndPassword(auth, email, password);

      setUser(user);
      setCurrentPage(user.providerId ? 'balances' : 'login');
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  return (
    <FirebaseContext.Provider
      value={{
        user,
        createAccountOrSignIn,
      }}
    >
      {props.children}
    </FirebaseContext.Provider>
  );
}

// Firebase context hook
export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  return context;
};
