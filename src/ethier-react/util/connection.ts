import { default as Web3 } from "web3";
import { Contract } from "web3-eth-contract";
import { Token } from "../contexts/tokenPrices";

// Web3
export const CONNECTION_REFRESH = 10000;
const endpoint =
  "https://mainnet.infura.io/v3/b8e513d193714353a389314c169aed39";
const provider = new Web3.providers.HttpProvider(endpoint);
export const web3 = new Web3(provider);

// Token contracts
const minAbi = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    outputs: [{ name: "balance", type: "uint256" }],
    name: "balanceOf",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "from", type: "address" },
      { indexed: true, name: "to", type: "address" },
      { indexed: false, name: "value", type: "uint256" },
    ],
    name: "transfer",
    type: "event",
  },
];
export const usdcContract = new web3.eth.Contract(
  minAbi as any,
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
);
export const uniswapContract = new web3.eth.Contract(
  minAbi as any,
  "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"
);
export const wrappedBtcContract = new web3.eth.Contract(
  minAbi as any,
  "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599"
);
export const tokenContracts: Record<string, Contract> = {
  USDC: usdcContract,
  UNI: uniswapContract,
  wBTC: wrappedBtcContract,
};

// Transfer tokens to an Ethereum address
  async function getTransferTransaction(
    token: Token,
    fromAccount: string,
    toAccount: string,
    amount: number
  ) {
    const nonce = await web3.eth.getTransactionCount(
      fromAccount,
      'latest'
    );

    const tx = {
      to: toAccount,
      value: amount,
      gas: 30000,
      maxFeePerGas: 1000000000,
      nonce: nonce,
      data:
        token !== 'ETH'
          ? tokenContracts[token].methods
              .transfer(fromAccount, toAccount, amount)
              .encodeABI()
          : undefined,
    };
    return tx;
  }