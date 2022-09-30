import { ReactComponent as EthLogo } from "../assets/tokens/eth.svg";
import { ReactComponent as EthiLogo } from "../assets/tokens/ethi_outline.svg";

export function TokenLogo(props: { token: string }) {
  switch (props.token) {
    case "ETH":
      return <EthLogo className="token-logo eth-logo" />;
    case "ETHI":
      return <EthiLogo className="token-logo" />;
    default:
      return <div className="default-token-logo"></div>;
  }
}
