import { ReactComponent as EthLogo } from "../assets/tokens/eth.svg";

export function TokenLogo(props: { token: string }) {
  switch (props.token) {
    case "ETH":
      return <EthLogo className="token-logo eth-logo" />;
    default:
      return <div className="default-token-logo"></div>;
  }
}
