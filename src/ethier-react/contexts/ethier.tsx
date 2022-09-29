import { createContext, useContext, useState } from 'react';
import crypto from 'crypto-js';
import { Account as EthAccount } from 'web3-core';
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
import { useWidget } from './widget';

// Ethier context
export interface EthierUser {
  ethAccount: EthAccount | null;
  tokenBalances: Record<string, number>;
  firebaseId: string;
  deleteFirebase: () => Promise<void>;
}
export interface Ethier {
  isLoggedIn: boolean;
  user: EthierUser | null;
  createAccountOrLogin: (
    email: string,
    password: string,
    createAccount: boolean
  ) => Promise<string>;
  deleteAccountOrLogout: (deleteAccount: boolean) => Promise<void>;
}
const EthierContext = createContext<Ethier>({
  isLoggedIn: false,
  user: null,
  createAccountOrLogin: async () => '',
  deleteAccountOrLogout: async () => {},
});

// Ethier context provider
export function EthierProvider(props: { children: any }) {
  const { setCurrentPage } = useWidget();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
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
      setIsLoggedIn(true);
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
        const privateKeyEncrypted = crypto.AES.encrypt(
          ethAccount.privateKey,
          salt
        ).toString();
        await setUserData(user.uid, {
          publicKey: ethAccount.address,
          privateKeyEncrypted,
        });
      }

      // Get ETH balance
      const weiBalance = await web3.eth.getBalance(ethAccount.address);
      const ethBalance = web3.utils.fromWei(weiBalance);
      tokenBalances.ETH = parseFloat(ethBalance);

      // USDC balance
      const usdcWeiBalance =
        await tokenContracts.usdcContract.methods.getBalance(
          ethAccount.address
        );
      const usdcBalance = web3.utils.fromWei(usdcWeiBalance);
      tokenBalances.USDC = parseFloat(usdcBalance);

      // Uniswap token balance
      const uniswapWeiBalance =
        await tokenContracts.uniswapContract.methods.getBalance(
          ethAccount.address
        );
      const uniswapBalance = web3.utils.fromWei(uniswapWeiBalance);
      tokenBalances.UNI = parseFloat(uniswapBalance);

      // Wrapped Bitcoin token balance
      const wBtcWeiBalance =
        await tokenContracts.wrappedBtcContract.methods.getBalance(
          ethAccount.address
        );
      const wBtcBalance = web3.utils.fromWei(wBtcWeiBalance);
      tokenBalances.wBTC = parseFloat(wBtcBalance);
    } catch (err) {
      console.error(err);
    }

    return {
      ethAccount,
      tokenBalances,
      firebaseId: user.uid,
      deleteFirebase: user.delete,
    };
  }

  return (
    <EthierContext.Provider
      value={{
        isLoggedIn,
        user,
        createAccountOrLogin,
        deleteAccountOrLogout,
      }}
    >
      {props.children}
    </EthierContext.Provider>
  );
}

// Ethier context hook
export const useEthier = () => {
  const context = useContext(EthierContext);
  return context;
};
