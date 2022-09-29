import { createContext, useContext, useState } from "react";
import crypto from "crypto-js";
import { Account as EthAccount } from "web3-core";
import { web3, tokenContracts } from "../util/connection";
import { User as FirebaseUser } from "firebase/auth";
import {
  createFirebaseUser,
  deleteFirebaseUser,
  fetchUserData,
  loginFirebaseUser,
  logoutFirebaseUser,
  setUserData,
} from "../util/firebase";
import { nonEthTokenOptions, Token } from "./tokenPrices";
import { useWidget } from "./widget";

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
  signAndSendTx: (tx: any) => Promise<string | undefined>;
  transferTokens: (
    token: Token,
    toAccount: string,
    amount: number
  ) => Promise<string | undefined>;
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
  signAndSendTx: async () => "",
  transferTokens: async () => "",
  createAccountOrLogin: async () => "",
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
      setCurrentPage("balances");
      return "";
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
    setCurrentPage("login");
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
      firebaseId: user.uid,
      deleteFirebase: user.delete,
    };
  }

  // Sign and send a transaction
  async function signAndSendTx(tx: any): Promise<string | undefined> {
    if (!user?.ethAccount) return;
    const { rawTransaction } = await web3.eth.accounts.signTransaction(
      tx,
      user.ethAccount.privateKey
    );

    if (rawTransaction) {
      web3.eth.sendSignedTransaction(rawTransaction, (err, hash) => {
        if (err) {
          console.error(err);
          return err.toString();
        } else {
          console.log(`Transaction successful: ${hash}`);
          return hash;
        }
      });
    }
  }

  // Transfer tokens to an Ethereum address
  async function transferTokens(
    token: Token,
    toAccount: string,
    amount: number
  ) {
    if (!user?.ethAccount) return;
    const nonce = await web3.eth.getTransactionCount(
      user.ethAccount.address,
      "latest"
    );

    const tx = {
      to: toAccount,
      value: amount,
      gas: 30000,
      maxFeePerGas: 1000000000,
      nonce: nonce,
      data:
        token !== "ETH"
          ? tokenContracts[token].methods
              .transfer(user.ethAccount.address, toAccount, amount)
              .encodeABI()
          : undefined,
    };
    return await signAndSendTx(tx);
  }

  return (
    <EthierContext.Provider
      value={{
        isLoggedIn,
        user,
        signAndSendTx,
        transferTokens,
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
