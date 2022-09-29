import { useWidget } from '../../contexts/widget';
import { useUser } from '../../contexts/ethier';
import { useTokenPrices } from '../../contexts/tokenPrices';
import { ReactComponent as EthLogo } from '../../assets/tokens/eth.svg';

export function BalancesPage() {
  const { setCurrentPage } = useWidget();
  const { user } = useUser();
  const tokenPrices = useTokenPrices();
  console.log(tokenPrices);

  // Returns asset logo for a given token symbol
  function getAssetLogo(symbol: string): JSX.Element {
    switch (symbol) {
      case 'eth':
        return <EthLogo height={50} />;
      default:
        return <></>;
    }
  }

  // copy eth address
  // total value of balances
  // list of balances with token prices

  if (user) {
    return (
      <div className='ethier-widget-page balances-page flex-centered column'>
        <h1>$0.00</h1>
        <div className='flex-centered'>
          <button>Buy</button>
          <button onClick={() => setCurrentPage('transfer')}>Send</button>
        </div>
        <div className='balances-page-balances'>
          {Object.keys(user.tokenBalances).map((token) => (
            <div className='balances-page-balance flex align-between justify-center column'>
              <p>{token}</p>
              <p>{user.tokenBalances[token]}</p>
            </div>
          ))}
        </div>
      </div>
    );
  } else {
    return <></>;
  }
}
