import { useWidget } from "../../contexts/widget";
import { useUser } from "../../contexts/ethier";
import { useTokenPrices } from "../../contexts/tokenPrices";
import { useCurrencyFormatting } from "../../util/format";
import { TokenLogo } from "../TokenLogo";

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
      totalValue += user.tokenBalances[token] * tokenPrices[token];
    });
    return totalValue;
  }

  if (user) {
    return (
      <div className="ethier-widget-page balances-page flex-centered column">
        <h1 className="brand-text">Balances</h1>
        <h1 className="total-value">{currencyAbbrev(getTotalValue(), true)}</h1>
        <div className="flex-centered">
          <button>Buy</button>
          <button onClick={() => setCurrentPage("transfer")}>Send</button>
        </div>
        <div className="balances-page-balances">
          {Object.keys(user.tokenBalances).map((token, i) => (
            <div
              key={token}
              className={`balances-page-balance flex align-center justify-between ${
                (i + 1) % 2 === 0 ? "light-bg" : ""
              }`}
            >
              <div className="balances-page-token flex-centered">
                <TokenLogo token={token} />
                <div className="flex-centered">
                  <h2>{token}</h2>
                  <span>{currencyFormatter(tokenPrices[token], true)}</span>
                </div>
              </div>
              <h2>{currencyFormatter(user.tokenBalances[token], false, 10)}</h2>
            </div>
          ))}
        </div>
      </div>
    );
  } else {
    return <></>;
  }
}
