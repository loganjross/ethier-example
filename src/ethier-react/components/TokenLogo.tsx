import { Token } from '../contexts/tokenPrices';
import { ReactComponent as EthLogo } from '../assets/tokens/eth.svg';
import { ReactComponent as UsdtLogo } from '../assets/tokens/usdt.svg';
import { ReactComponent as UniLogo } from '../assets/tokens/uni.svg';

export function TokenLogo(props: { token: Token }) {
  switch (props.token) {
    case 'ETH':
      return <EthLogo className='token-logo eth-logo' />;
    case 'USDT':
      return <UsdtLogo className='token-logo eth-logo' />;
    case 'UNI':
      return <UniLogo className='token-logo eth-logo' />;
    default:
      return <></>;
  }
}
