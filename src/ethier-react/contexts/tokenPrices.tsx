import { createContext, useContext, useEffect, useState } from "react";

// Token prices context
export const tokens = ["ETH", "ETHI"];
const TokenPricesContext = createContext<{
  tokenPrices: Record<string, number>;
}>({
  tokenPrices: {} as Record<string, number>,
});

// Token prices provider
export function TokenPricesProvider(props: { children: any }) {
  const [tokenPrices, setTokenPrices] = useState({} as Record<string, number>);

  // Fetch prices on mount
  useEffect(() => {
    const tokenPrices = {} as Record<string, number>;
    tokens.forEach(async (token) => {
      const resp = await fetch(
        `https://min-api.cryptocompare.com/data/price?fsym=${token}&tsyms=USD`
      );
      const price = (await resp.json()).USD;
      tokenPrices[token] = !isNaN(price) ? price : 0;
    });
    setTokenPrices(tokenPrices);
  }, []);

  return (
    <TokenPricesContext.Provider
      value={{
        tokenPrices,
      }}
    >
      {props.children}
    </TokenPricesContext.Provider>
  );
}

// Token prices hook
export function useTokenPrices() {
  const context = useContext(TokenPricesContext);
  return context.tokenPrices;
}
