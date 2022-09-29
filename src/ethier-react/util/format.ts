// Hook for currency formatting functions
export function useCurrencyFormatting() {
  // Format USD or crypto with default or desired decimals
  const currencyFormatter = (value: number, fiatValues?: boolean, decimals?: number, ciel?: boolean): string => {
    const roundedDownValue = ciel
      ? Math.ceil(value * 10 ** (decimals ?? 2)) / 10 ** (decimals ?? 2)
      : Math.floor(value * 10 ** (decimals ?? 2)) / 10 ** (decimals ?? 2);

    const currencyFormat = new Intl.NumberFormat(navigator.language, {
      style: fiatValues ? 'currency' : undefined,
      currency: fiatValues ? 'USD' : undefined,
      maximumFractionDigits: decimals && !fiatValues ? decimals : 2
    });

    // Set and strip trailing 0's / unnecessary decimal if not fiat
    let uiCurrency = currencyFormat.format(roundedDownValue);
    if (!fiatValues) {
      while (
        uiCurrency.indexOf('.') !== -1 &&
        (uiCurrency[uiCurrency.length - 1] === '0' || uiCurrency[uiCurrency.length - 1] === '.')
      ) {
        uiCurrency = uiCurrency.substring(0, uiCurrency.length - 1);
      }
    }

    return uiCurrency;
  };

  // Abbreviate large currency amounts
  function currencyAbbrev(total: number, fiatValues?: boolean, price?: number, decimals?: number): string {
    let t = total;
    if (price && fiatValues) {
      t = total * price;
    }

    if (t > 1000000000000) {
      return currencyFormatter(t / 1000000000000, fiatValues, 1) + 'T';
    } else if (t > 1000000000) {
      return currencyFormatter(t / 1000000000, fiatValues, 1) + 'B';
    } else if (t > 1000000) {
      return currencyFormatter(t / 1000000, fiatValues, 1) + 'M';
    } else if (t > 1000) {
      return currencyFormatter(t / 1000, fiatValues, 1) + 'K';
    } else {
      return currencyFormatter(t, fiatValues, fiatValues ? 2 : decimals);
    }
  }

  return {
    currencyFormatter,
    currencyAbbrev
  };
}

// Format and shorten a pubkey with ellipsis
export function formatPubkey(publicKey: string, halfLength = 4): string {
  return `${publicKey.substring(0, halfLength)}...${publicKey.substring(publicKey.length - halfLength)}`;
}