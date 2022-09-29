import { createContext, useContext, useEffect, useState } from 'react';

// Token prices context
export type Token = 'ETH' | 'USDC' | 'UNI' | 'wBTC';
export const tokenOptions: Token[] = ['ETH', 'USDC', 'UNI', 'wBTC'];
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
    tokenOptions.forEach(async (token: Token) => {
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
