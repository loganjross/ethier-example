import { createContext, useContext, useState } from 'react';
import crypto from 'crypto-js';
import { Account as EthAccount, SignedTransaction } from 'web3-core';
import { web3, tokenContracts } from '../util/connection';
import { User as FirebaseUser } from 'firebase/auth';
import {
  createFirebaseUser,
  deleteFirebaseUser,
  fetchUserData,
  loginFirebaseUser,
  logoutFirebaseUser,
  setUserData,
} from '../util/firebase';
import { nonEthTokenOptions, Token } from './tokenPrices';
import { useWidget } from './widget';

// Ethier context
export interface EthierUser {
  ethAccount: EthAccount | null;
  tokenBalances: Record<string, number>;
  username: string | null;
  firebaseId: string;
  deleteFirebase: () => Promise<void>;
}
export interface Ethier {
  // For client use
  user: EthierUser | null;
  signTransaction: (tx: any) => Promise<SignedTransaction | undefined>;
  signAndSendTransaction: (tx: any) => Promise<string | undefined>;
  // For internal widget use
  createAccountOrLogin: (
    email: string,
    password: string,
    createAccount: boolean
  ) => Promise<string>;
  deleteAccountOrLogout: (deleteAccount: boolean) => Promise<void>;
}
const EthierContext = createContext<Ethier>({
  // For client use
  user: null,
  signTransaction: async () => undefined,
  signAndSendTransaction: async () => undefined,
  // For internal widget use
  createAccountOrLogin: async () => '',
  deleteAccountOrLogout: async () => {},
});

// Ethier context provider
export function EthierProvider(props: { children: any }) {
  const { setCurrentPage } = useWidget();
  const [user, setUser] = useState<EthierUser | null>(null);

  // Create account or login
  async function createAccountOrLogin(
    email: string,
    password: string,
    createAccount: boolean
  ) {
    try {
      const user = createAccount
        ? await createFirebaseUser(email, password)
        : await loginFirebaseUser(email, password);

      // Create or get current Ethereum account keypair
      const ethierUser = await getOrCreateKeypair(user, email + password);
      // Log user in and redirect
      setUser(ethierUser);
      setCurrentPage('balances');
      return '';
    } catch (err: any) {
      console.error(err);
      return err.toString();
    }
  }

  // Delete account or logout
  async function deleteAccountOrLogout(deleteAccount: boolean) {
    if (user && deleteAccount) {
      await deleteFirebaseUser(user);
    } else {
      await logoutFirebaseUser();
    }

    setUser(null);
    setCurrentPage('login');
  }

  // Fetch/add an Ethereum keypair from/to db
  async function getOrCreateKeypair(
    user: FirebaseUser,
    salt: string
  ): Promise<EthierUser> {
    let ethAccount: EthAccount | null = null;
    let tokenBalances: Record<string, number> = {};

    try {
      // Check for keypair in db
      const keypair = await fetchUserData(user.uid);
      if (keypair) {
        const bytes = crypto.AES.decrypt(keypair.privateKeyEncrypted, salt);
        const privateKey = bytes.toString();
        ethAccount = web3.eth.accounts.privateKeyToAccount(privateKey, true);
      } else {
        // Otherwise, add a new one to db
        ethAccount = web3.eth.accounts.create(user.uid);
        if (ethAccount) {
          const privateKeyEncrypted = crypto.AES.encrypt(
            ethAccount.privateKey,
            salt
          ).toString();
          await setUserData(user.uid, {
            publicKey: ethAccount.address,
            privateKeyEncrypted,
          });
        }
      }

      // Get ETH balance
      const weiBalance = await web3.eth.getBalance(ethAccount?.address);
      const ethBalance = web3.utils.fromWei(weiBalance);
      tokenBalances.ETH = parseFloat(ethBalance);

      // Get non-Eth balances
      nonEthTokenOptions.forEach(async (token) => {
        if (!ethAccount) return;

        const weiBalance = await tokenContracts[token].methods.getBalance(
          ethAccount.address
        );
        const balance = web3.utils.fromWei(weiBalance);
        tokenBalances[token] = parseFloat(balance);
      });
    } catch (err) {
      console.error(err);
    }

    return {
      ethAccount,
      tokenBalances,
      username: user.displayName ?? user.email,
      firebaseId: user.uid,
      deleteFirebase: user.delete,
    };
  }

  // Sign a transaction
  async function signTransaction(
    tx: any
  ): Promise<SignedTransaction | undefined> {
    if (!user?.ethAccount) return;
    const signedTransaction = await web3.eth.accounts.signTransaction(
      tx,
      user.ethAccount.privateKey
    );

    return signedTransaction;
  }

  // Sign and send a transaction
  async function signAndSendTransaction(tx: any): Promise<string | undefined> {
    if (!user?.ethAccount) return;
    const { rawTransaction } = await web3.eth.accounts.signTransaction(
      tx,
      user.ethAccount.privateKey
    );

    if (rawTransaction) {
      web3.eth.sendSignedTransaction(
        rawTransaction,
        (err: any, hash: string) => {
          if (err) {
            console.error(err);
            return err.toString();
          } else {
            console.log(`Transaction successful: ${hash}`);
            return hash;
          }
        }
      );
    }
  }

  return (
    <EthierContext.Provider
      value={{
        // For client use
        user,
        signTransaction,
        signAndSendTransaction,
        // For internal widget use
        createAccountOrLogin,
        deleteAccountOrLogout,
      }}
    >
      {props.children}
    </EthierContext.Provider>
  );
}

// User account interactions hook (internal)
export function useUser() {
  const { user, createAccountOrLogin, deleteAccountOrLogout } =
    useContext(EthierContext);
  return {
    user,
    createAccountOrLogin,
    deleteAccountOrLogout,
  };
}

// Ethier context hook (client)
export function useEthier() {
  const { setWidgetOpen, setCurrentPage } = useWidget();
  const { user, signTransaction, signAndSendTransaction } =
    useContext(EthierContext);
  return {
    isLoggedIn: user !== null,
    promptLogin: () => {
      if (user) return;
      setCurrentPage('login');
      setWidgetOpen(true);
    },
    username: user?.username,
    getTokenBalance: (tokenSymbol: Token) => user?.tokenBalances[tokenSymbol],
    signTransaction,
    signAndSendTransaction,
  };
}
