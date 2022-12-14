import "./index.css";
import { EthierProvider } from "./contexts/ethier";
import { WidgetStateProvider } from "./contexts/widget";
import { NetworkProvider } from "./contexts/connection";
import { TokenPricesProvider } from "./contexts/tokenPrices";
import { EthierWidget } from "./components/EthierWidget";

// Wrapper for Ethier react widget
export function EthierReact(props: { children: any }) {
  return (
    <WidgetStateProvider>
      <NetworkProvider>
        <EthierProvider>
          <TokenPricesProvider>
            <EthierWidget />
            {props.children}
          </TokenPricesProvider>
        </EthierProvider>
      </NetworkProvider>
    </WidgetStateProvider>
  );
}
