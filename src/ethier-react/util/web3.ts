import BN from "bn.js";
import Web3 from "web3";

// Units
export const WEI_PER_ETH = new BN("1000000000000000000");

// Transfer tokens to an Ethereum address
export async function getTransferTransaction(
  connection: Web3,
  fromAccount: string,
  toAccount: string,
  amount: number
) {
  const gasPrice = await connection.eth.getGasPrice();
  const nonce = await connection.eth.getTransactionCount(fromAccount, "latest");

  const weiString = WEI_PER_ETH.muln(amount).toString();
  return {
    to: toAccount,
    value: weiString,
    gas: "2000000",
    gasPrice,
    nonce,
  };
}
