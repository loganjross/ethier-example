import { useEffect, useState } from "react";
import BN from "bn.js";
import { useConnection } from "../../contexts/connection";
import { useEthier, useUser } from "../../contexts/ethier";
import { useTokenPrices } from "../../contexts/tokenPrices";
import { getTransferTransaction } from "../../util/web3";
import { useCurrencyFormatting } from "../../util/format";
import { TokenLogo } from "../TokenLogo";
import { ReactComponent as Spinner } from "../../assets/spinner.svg";

export function TransferPage() {
  const connection = useConnection();
  const { currencyFormatter } = useCurrencyFormatting();
  const { signAndSendTransaction } = useEthier();
  const { user, transactionRefresh, setTransactionRefresh } = useUser();
  const tokenPrices = useTokenPrices();
  const [token, setToken] = useState("ETH");
  const [amountString, setAmountString] = useState("");
  const [toAccount, setToAccount] = useState("");
  const invalidToAccount =
    !toAccount.length || !connection.utils.isAddress(toAccount);
  const [gas, setGas] = useState(0);
  const [tx, setTx] = useState<any>();
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  // Submit a token transfer
  async function submitTransfer() {
    // Check inputs
    if (!user?.ethAccount) return;
    let error = "";
    if (!amountString.length || amountString === "0") {
      error = "Enter an amount";
    } else if (invalidToAccount) {
      error = "Invalid destination address";
    }
    if (error) {
      setError(error);
      return;
    }

    // Send tx
    setLoading(true);
    const hash = await signAndSendTransaction(tx);
    if (hash) {
      console.log(`tx success: ${hash}`);
      setAmountString("0");
      setToAccount("");
      setFeedback("✔");
      setTransactionRefresh(!transactionRefresh);
    } else {
      setError("Something went wrong");
    }
    setLoading(false);
  }

  // Keep amount within 0 and max range
  function getWithinMaxRange(): number {
    const max = user?.tokenBalances[token] ?? 0;
    const amount = isNaN(parseFloat(amountString))
      ? 0
      : parseFloat(amountString);
    const withinRange = Math.min(amount, max);
    return withinRange;
  }

  // Update tx as inputs change, and estimate gas
  useEffect(() => {
    if (!user?.ethAccount || invalidToAccount) return;
    const amount = getWithinMaxRange();
    setAmountString(amount.toString());

    getTransferTransaction(
      connection,
      user.ethAccount.address,
      toAccount,
      amount
    ).then(async (tx) => {
      const gas = await connection.eth.estimateGas(tx);
      const gasPrice = await connection.eth.getGasPrice();
      const gasBN = new BN(gas * parseFloat(gasPrice));
      const gasNum = parseFloat(connection.utils.fromWei(gasBN));
      setGas(gasNum);
      setTx(tx);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amountString, toAccount, token]);

  if (user) {
    return (
      <div className="ethier-widget-page transfer-page flex-centered column">
        <div className="transfer-select flex align-center justify-between">
          <h1 className="brand-text">Transfer</h1>
          <div className="select-group">
            <select value={token} onChange={(e) => setToken(e.target.value)}>
              {Object.keys(user.tokenBalances).map((token) => (
                <option key={token} value={token}>
                  {token}
                </option>
              ))}
            </select>
            <i className="fa-solid fa-angle-down"></i>
          </div>
          <TokenLogo token={token} />
        </div>
        <div
          className={`input-group ${amountString.length ? "has-value" : ""}`}
        >
          <input
            type="text"
            value={amountString}
            onChange={(e) => {
              let inputString = e.target.value;
              // Check string value of input and adjust if necessary
              while (
                !inputString.includes(".") &&
                inputString.length > 1 &&
                inputString[0] === "0"
              ) {
                inputString = inputString.substring(1);
              }
              // Check if input is invalid (less than 0, or NaN, or too large)
              if (
                isNaN(+inputString) ||
                +inputString < 0 ||
                +inputString > Number.MAX_SAFE_INTEGER
              ) {
                inputString = "0";
              }

              setAmountString(inputString);
            }}
            onBlur={() => {
              const amount = getWithinMaxRange();
              setAmountString(amount.toString());
            }}
            onKeyUp={(e) => (e.code === "Enter" ? submitTransfer() : null)}
          />
          <label className="placeholder">Amount</label>
          <span className="price-estimation">
            {currencyFormatter(getWithinMaxRange() * tokenPrices[token], true)}
          </span>
        </div>
        <div className={`input-group ${toAccount.length ? "has-value" : ""}`}>
          <input
            type="text"
            value={toAccount}
            onChange={(e) => setToAccount(e.target.value)}
            onKeyUp={(e) => (e.code === "Enter" ? submitTransfer() : null)}
          />
          <label className="placeholder">To</label>
        </div>
        <div
          className="flex-centered"
          style={{ marginTop: "var(--spacing-sm)" }}
        >
          <i className="fa-solid fa-fire-flame-curved"></i>&nbsp;≈&nbsp;{gas}
          &nbsp;ETH
        </div>
        <button
          className={`full-width ${
            error.length && !loading ? "error-btn" : ""
          }`}
          onClick={submitTransfer}
        >
          {loading ? (
            <Spinner />
          ) : error.length ? (
            error
          ) : feedback.length ? (
            feedback
          ) : (
            "Send"
          )}
        </button>
      </div>
    );
  } else {
    return <></>;
  }
}
