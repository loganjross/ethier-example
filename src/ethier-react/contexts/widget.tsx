import { createContext, useContext, useState } from 'react';

// Widget state context
export type WidgetPage =
  | 'login'
  | 'balances'
  | 'nfts'
  | 'transfer'
  | 'settings';
export const widgetTabsPages: WidgetPage[] = [
  'balances',
  'nfts',
  'transfer',
  'settings',
];
const WidgetStateContext = createContext<{
  widgetOpen: boolean;
  setWidgetOpen: (WidgetOpen: boolean) => void;
  currentPage: WidgetPage;
  setCurrentPage: (page: WidgetPage) => void;
}>({
  widgetOpen: false,
  setWidgetOpen: () => {},
  currentPage: 'login',
  setCurrentPage: () => {},
});

// Widget state context provider
export function WidgetStateProvider(props: { children: any }) {
  const [widgetOpen, setWidgetOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<WidgetPage>('login');

  return (
    <WidgetStateContext.Provider
      value={{
        widgetOpen,
        setWidgetOpen,
        currentPage,
        setCurrentPage,
      }}
    >
      {props.children}
    </WidgetStateContext.Provider>
  );
}

// Widget context hook
export function useWidget() {
  const context = useContext(WidgetStateContext);
  return {
    ...context,
    toggleWidgetOpen: () => context.setWidgetOpen(!context.widgetOpen),
  };
}
