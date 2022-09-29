import { createContext, useContext, useEffect, useState } from "react";

// Token prices context
export type NonEthToken = "USDC" | "UNI" | "wBTC";
export const nonEthTokenOptions: NonEthToken[] = ["USDC", "UNI", "wBTC"];
export type Token = NonEthToken | "ETH";
const TokenPricesContext = createContext<{
  tokenPrices: Record<Token, number>;
}>({
  tokenPrices: {} as Record<Token, number>,
});

// Token prices provider
export function TokenPricesProvider(props: { children: any }) {
  const [tokenPrices, setTokenPrices] = useState({} as Record<Token, number>);

  // Fetch prices on mount
  useEffect(() => {
    const tokenPrices = {} as Record<Token, number>;
    const tokens: Token[] = ["ETH", "USDC", "UNI", "wBTC"];
    tokens.forEach(async (token) => {
      const resp = await fetch(
        `https://min-api.cryptocompare.com/data/price?fsym=${token}&tsyms=USD`
      );
      const price = (await resp.json()).USD;
      tokenPrices[token] = price;
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
export const useTokenPrices = () => {
  const context = useContext(TokenPricesContext);
  return context.tokenPrices;
};
