import { createContext, useContext, useEffect, useState } from "react";
import crypto from "crypto-js";
import { Account as EthAccount, SignedTransaction } from "web3-core";
import { User as FirebaseUser } from "firebase/auth";
import {
  createFirebaseUser,
  deleteFirebaseUser,
  fetchUserData,
  loginFirebaseUser,
  logoutFirebaseUser,
  setUserData,
} from "../util/firebase";
import { useWidget } from "./widget";
import { CONNECTION_REFRESH, useConnection, useNetwork } from "./connection";
import { useTokenContracts } from "../util/transactions";

// Ethier context
export interface EthierUser {
  ethAccount: EthAccount | null;
  tokenBalances: Record<string, number>;
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
  transactionRefresh: boolean;
  setTransactionRefresh: (refresh: boolean) => void;
}
const EthierContext = createContext<Ethier>({
  // For client use
  user: null,
  signTransaction: async () => undefined,
  signAndSendTransaction: async () => undefined,
  // For internal widget use
  createAccountOrLogin: async () => "",
  deleteAccountOrLogout: async () => {},
  transactionRefresh: false,
  setTransactionRefresh: () => {},
});

// Ethier context provider
export function EthierProvider(props: { children: any }) {
  const { network } = useNetwork();
  const connection = useConnection();
  const tokenContracts = useTokenContracts();
  const { setCurrentPage } = useWidget();
  const [user, setUser] = useState<EthierUser | null>(null);
  const [transactionRefresh, setTransactionRefresh] = useState(false);

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

    try {
      // Check for keypair in db
      const keypair = await fetchUserData(user.uid);
      if (keypair) {
        const bytes = crypto.AES.decrypt(keypair.privateKeyEncrypted, salt);
        const privateKey = bytes.toString(crypto.enc.Utf8);
        ethAccount = connection.eth.accounts.privateKeyToAccount(
          privateKey,
          true
        );
      } else {
        // Otherwise, add a new one to db
        ethAccount = connection.eth.accounts.create();
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
    } catch (err) {
      console.error(err);
    }

    const tokenBalances = await getTokenBalances(ethAccount);
    return {
      ethAccount,
      tokenBalances,
      email: user.email,
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
      const weiBalance = await connection.eth.getBalance(ethAccount?.address);
      const ethBalance = connection.utils.fromWei(weiBalance, "ether");
      tokenBalances.ETH = parseFloat(ethBalance);

      // Get non-Eth balances **only on testnet for now**
      if (network === "Görli") {
        for (const token of Object.keys(tokenContracts)) {
          // @ts-ignore
          const weiBalance = await tokenContracts[token].methods
            .balanceOf(ethAccount.address)
            .call();
          const balance = connection.utils.fromWei(weiBalance);
          tokenBalances[token] = parseFloat(balance);
        }
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
    const signedTransaction = await signTransaction(tx);

    try {
      if (signedTransaction?.rawTransaction) {
        const { transactionHash } = await connection.eth.sendSignedTransaction(
          signedTransaction.rawTransaction
        );

        return transactionHash;
      }
    } catch (err) {
      console.error(err);
      return;
    }
  }

  // Once we login, continually refresh account data (or on network change/tx refresh)
  useEffect(() => {
    async function getBalances() {
      if (!user) return;
      const tokenBalances = await getTokenBalances(user.ethAccount);
      user.tokenBalances = tokenBalances;
      setUser({ ...user });
    }

    // Token balances
    const balancesInterval = setInterval(getBalances, CONNECTION_REFRESH);
    getBalances();
    return () => clearInterval(balancesInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network, user?.ethAccount?.address, transactionRefresh]);

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
        transactionRefresh,
        setTransactionRefresh,
      }}
    >
      {props.children}
    </EthierContext.Provider>
  );
}

// User account interactions hook (internal)
export function useUser() {
  const {
    user,
    createAccountOrLogin,
    deleteAccountOrLogout,
    transactionRefresh,
    setTransactionRefresh,
  } = useContext(EthierContext);
  return {
    user,
    createAccountOrLogin,
    deleteAccountOrLogout,
    transactionRefresh,
    setTransactionRefresh,
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
      setCurrentPage("login");
      setWidgetOpen(true);
    },
    logout: () => deleteAccountOrLogout(false),
    email: user?.email,
    ethAddress: user?.ethAccount?.address,
    tokens: Object.keys(user?.tokenBalances ?? {}),
    getTokenBalance: (tokenSymbol: string) => user?.tokenBalances[tokenSymbol],
    signTransaction,
    signAndSendTransaction,
  };
}
