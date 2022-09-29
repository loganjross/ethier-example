import './index.css';
import { EthierProvider } from './contexts/ethier';
import { WidgetStateProvider } from './contexts/widget';
import { TokenPricesProvider } from './contexts/tokenPrices';
import { EthierModal } from './components/EthierModal';

// Wrapper for Ethier react widget
export function EthierReact(props: { children: any }) {
  return (
    <WidgetStateProvider>
      <EthierProvider>
        <TokenPricesProvider>
          <EthierModal />
          {props.children}
        </TokenPricesProvider>
      </EthierProvider>
    </WidgetStateProvider>
  );
}
