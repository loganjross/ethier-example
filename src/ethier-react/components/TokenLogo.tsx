import { Token } from '../contexts/tokenPrices';
import { ReactComponent as EthLogo } from '../assets/tokens/eth.svg';
import { ReactComponent as UsdtLogo } from '../assets/tokens/usdt.svg';
import { ReactComponent as UniLogo } from '../assets/tokens/uni.svg';

export function TokenLogo(props: { token: Token }) {
  switch (props.token) {
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
