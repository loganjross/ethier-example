import { useWidget } from '../../contexts/widget';
import { useUser } from '../../contexts/ethier';
import { Token, useTokenPrices } from '../../contexts/tokenPrices';
import { ReactComponent as EthLogo } from '../../assets/tokens/eth.svg';
import { ReactComponent as UsdtLogo } from '../../assets/tokens/usdt.svg';
import { ReactComponent as UniLogo } from '../../assets/tokens/uni.svg';
import { useCurrencyFormatting } from '../../util/format';

export function BalancesPage() {
  const { setCurrentPage } = useWidget();
  const { user } = useUser();
  const tokenPrices = useTokenPrices();
  const { currencyAbbrev, currencyFormatter } = useCurrencyFormatting();

  // Return the total value of all user's tokens
  function getTotalValue(): number {
    if (!user) return 0;

    let totalValue = 0;
    Object.keys(user.tokenBalances).forEach((token) => {
      totalValue +=
        user.tokenBalances[token as Token] * tokenPrices[token as Token];
    });
    return totalValue;
  }

  // Returns asset logo for a given token symbol
  function getAssetLogo(symbol: string): JSX.Element {
    switch (symbol) {
      case 'ETH':
        return <EthLogo className='eth-logo' />;
      case 'USDT':
        return <UsdtLogo />;
      case 'UNI':
        return <UniLogo />;
      default:
        return <></>;
    }
  }

  if (user) {
    return (
      <div className='ethier-widget-page balances-page flex align-center justify-end column'>
        <h1 className='total-value'>{currencyAbbrev(getTotalValue(), true)}</h1>
        <div className='flex-centered'>
          <button>Buy</button>
          <button onClick={() => setCurrentPage('transfer')}>Send</button>
        </div>
        <div className='balances-page-balances'>
          {Object.keys(user.tokenBalances).map((token, i) => (
            <div
              key={token}
              className={`balances-page-balance flex align-center justify-between ${
                i % 2 === 0 ? 'light-bg' : ''
              }`}
            >
              <div className='balances-page-token flex-centered'>
                {getAssetLogo(token)}
                <span>
                  {currencyFormatter(tokenPrices[token as Token], true)}
                </span>
              </div>
              <h2>
                {user.tokenBalances[token as Token]} {token}
              </h2>
            </div>
          ))}
        </div>
      </div>
    );
  } else {
    return <></>;
  }
}
