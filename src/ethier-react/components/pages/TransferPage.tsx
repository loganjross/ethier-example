import { useState } from 'react';
import { useEthier, useUser } from '../../contexts/ethier';
import { Token, useTokenPrices } from '../../contexts/tokenPrices';
import { getTransferTransaction, web3 } from '../../util/web3';
import { useCurrencyFormatting } from '../../util/format';
import { TokenLogo } from '../TokenLogo';
import { ReactComponent as Spinner } from '../../assets/spinner.svg';

export function TransferPage() {
  const { currencyFormatter } = useCurrencyFormatting();
  const { signAndSendTransaction } = useEthier();
  const { user } = useUser();
  const tokenPrices = useTokenPrices();
  const [token, setToken] = useState<Token>('ETH');
  const [amountString, setAmountString] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Submit a token transfer
  async function submitTransfer() {
    // Parse out input and keep within range
    const amount = getWithinMaxRange();
    setAmountString(amount.toString());

    // Check inputs
    if (!user?.ethAccount) return;
    let error = '';
    if (!amount) {
      error = 'Enter an amount';
    } else if (!toAccount.length || !web3.utils.isAddress(toAccount)) {
      error = 'Invalid destination address';
    }
    if (error) {
      setError(error);
      return;
    }

    // Send tx
    setLoading(true);
    const tx = await getTransferTransaction(
      token,
      user.ethAccount.address,
      toAccount,
      amount
    );
    const hash = await signAndSendTransaction(tx);
    console.log(`tx success: ${hash}`);
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

  if (user) {
    return (
      <div className='ethier-widget-page transfer-page flex-centered column'>
        <div className='transfer-select flex align-center justify-between'>
          <h1 className='brand-text'>Transfer</h1>
          <select
            value={token}
            onChange={(e) => setToken(e.target.value as Token)}
          >
            {Object.keys(user.tokenBalances).map((token) => (
              <option value={token}>{token}</option>
            ))}
          </select>
          <TokenLogo token={token as Token} />
        </div>
        <div
          className={`input-group ${amountString.length ? 'has-value' : ''}`}
        >
          <input
            type='text'
            value={`${amountString} ${amountString.length ? token : ''}`}
            onChange={(e) => {
              let inputString = e.target.value;
              // Check string value of input and adjust if necessary
              while (
                !inputString.includes('.') &&
                inputString.length > 1 &&
                inputString[0] === '0'
              ) {
                inputString = inputString.substring(1);
              }
              // Check if input is invalid (less than 0, or NaN, or too large)
              if (
                isNaN(+inputString) ||
                +inputString < 0 ||
                +inputString > Number.MAX_SAFE_INTEGER
              ) {
                inputString = '0';
              }

              setAmountString(inputString);
            }}
            onBlur={() => {
              const amount = getWithinMaxRange();
              setAmountString(amount.toString());
            }}
            onKeyUp={(e) => (e.code === 'Enter' ? submitTransfer() : null)}
          />
          <label className='placeholder'>Amount</label>
          <span className='price-estimation'>
            ~{currencyFormatter(getWithinMaxRange() * tokenPrices[token], true)}
          </span>
        </div>
        <div className={`input-group ${toAccount.length ? 'has-value' : ''}`}>
          <input
            type='text'
            value={toAccount}
            onChange={(e) => setToAccount(e.target.value)}
            onKeyUp={(e) => (e.code === 'Enter' ? submitTransfer() : null)}
          />
          <label className='placeholder'>To</label>
        </div>
        <button
          className={`full-width ${
            error.length && !loading ? 'error-btn' : ''
          }`}
          onClick={submitTransfer}
        >
          {loading ? <Spinner /> : error.length ? error : 'Send'}
        </button>
      </div>
    );
  } else {
    return <></>;
  }
}
