import { createContext, useContext, useState } from "react";
import Web3 from "web3";

// Network context
export const CONNECTION_REFRESH = 20000;
export type Network = "Mainnet" | "Görli";
export const networks: Network[] = ["Mainnet", "Görli"];
const NetworkContext = createContext<{
  network: Network;
  setNetwork: (network: Network) => void;
}>({
  network: "Görli",
  setNetwork: () => {},
});

// Network provider
export function NetworkProvider(props: { children: any }) {
  const [network, setNetwork] = useState<Network>("Görli");

  return (
    <NetworkContext.Provider
      value={{
        network,
        setNetwork,
      }}
    >
      {props.children}
    </NetworkContext.Provider>
  );
}

// Network hook
export function useNetwork() {
  const context = useContext(NetworkContext);
  return context;
}

// Connection hook
export function useConnection() {
  const { network } = useContext(NetworkContext);
  const mainnetEndpoint =
    "https://mainnet.infura.io/v3/b8e513d193714353a389314c169aed39";
  const testnetEndpoint =
    "https://goerli.infura.io/v3/b8e513d193714353a389314c169aed39";
  const endpoint = network === "Mainnet" ? mainnetEndpoint : testnetEndpoint;
  const provider = new Web3.providers.HttpProvider(endpoint);
  return new Web3(provider);
}
