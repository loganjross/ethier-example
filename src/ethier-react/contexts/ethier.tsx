import { createContext, useContext, useEffect, useState } from 'react';
import crypto from 'crypto-js';
import { Account as EthAccount, SignedTransaction } from 'web3-core';
import { web3, tokenContracts, CONNECTION_REFRESH } from '../util/web3';
import { User as FirebaseUser } from 'firebase/auth';
import {
  createFirebaseUser,
  deleteFirebaseUser,
  fetchUserData,
  loginFirebaseUser,
  logoutFirebaseUser,
  setUserData,
} from '../util/firebase';
import { nonEthTokens, Token } from './tokenPrices';
import { useWidget } from './widget';

// Ethier context
export interface EthierUser {
  ethAccount: EthAccount | null;
  tokenBalances: Record<Token, number>;
  email: string | null;
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

    try {
      // Check for keypair in db
      const keypair = await fetchUserData(user.uid);
      if (keypair) {
        const bytes = crypto.AES.decrypt(keypair.privateKeyEncrypted, salt);
        const privateKey = bytes.toString();
        ethAccount = web3.eth.accounts.privateKeyToAccount(privateKey, true);
      } else {
        // Otherwise, add a new one to db
        ethAccount = web3.eth.accounts.create();
        if (ethAccount) {
          const privateKeyEncrypted = crypto.AES.encrypt(
            ethAccount.privateKey,
            salt
          );

          await setUserData(user.uid, {
            publicKey: ethAccount.address,
            privateKeyEncrypted,
          });
        }
      }
    } catch (err) {
      console.error(err);
    }

    console.log(ethAccount?.privateKey.length);

    const tokenBalances = await getTokenBalances(ethAccount);
    return {
      ethAccount,
      tokenBalances,
      email: user.displayName ?? user.email,
      firebaseId: user.uid,
      deleteFirebase: user.delete,
    };
  }

  // Get token balances for user
  async function getTokenBalances(
    ethAccount: EthAccount | null
  ): Promise<Record<string, number>> {
    let tokenBalances: Record<string, number> = {};

    if (ethAccount) {
      // Get ETH balance
      const weiBalance = await web3.eth.getBalance(ethAccount?.address);
      const ethBalance = web3.utils.fromWei(weiBalance, 'ether');
      tokenBalances.ETH = parseFloat(ethBalance);

      // Get non-Eth balances
      for (const token of nonEthTokens) {
        const weiBalance = await tokenContracts[token].methods
          .balanceOf(ethAccount.address)
          .call();
        const balance = web3.utils.fromWei(weiBalance);
        tokenBalances[token] = parseFloat(balance);
      }
    }

    return tokenBalances;
  }

  // Sign a transaction
  async function signTransaction(
    tx: any
  ): Promise<SignedTransaction | undefined> {
    if (!user?.ethAccount) return;
    const signedTransaction = await user.ethAccount.signTransaction(tx);
    return signedTransaction;
  }

  // Sign and send a transaction
  async function signAndSendTransaction(tx: any): Promise<string | undefined> {
    if (!user?.ethAccount) return;
    const signedTx = await signTransaction(tx);

    if (signedTx?.rawTransaction) {
      web3.eth.sendSignedTransaction(
        signedTx.rawTransaction,
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

  // Once we login, continually refresh account data
  useEffect(() => {
    if (!user) return;

    // Token balances
    const balancesInterval = setInterval(
      () =>
        getTokenBalances(user.ethAccount).then((tokenBalances) => {
          user.tokenBalances = tokenBalances;
          setUser({ ...user });
        }),
      CONNECTION_REFRESH
    );
    return () => clearInterval(balancesInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.ethAccount?.address]);

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
  const { deleteAccountOrLogout } = useUser();
  const { user, signTransaction, signAndSendTransaction } =
    useContext(EthierContext);
  return {
    isLoggedIn: user !== null,
    promptLogin: () => {
      if (user) return;
      setCurrentPage('login');
      setWidgetOpen(true);
    },
    logout: () => deleteAccountOrLogout(false),
    email: user?.email,
    getTokenBalance: (tokenSymbol: string) =>
      user?.tokenBalances[tokenSymbol as Token],
    signTransaction,
    signAndSendTransaction,
  };
}
