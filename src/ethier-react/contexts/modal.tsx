import { createContext, useContext, useState } from 'react';

// Modal state context
export type ModalPage = 'login' | 'balances' | 'nfts' | 'transfer' | 'settings';
export const modalTabsPages: ModalPage[] = [
  'balances',
  'nfts',
  'transfer',
  'settings',
];
const ModalStateContext = createContext<{
  modalOpen: boolean;
  setModalOpen: (modalOpen: boolean) => void;
  currentPage: ModalPage;
  setCurrentPage: (page: ModalPage) => void;
}>({
  modalOpen: false,
  setModalOpen: () => {},
  currentPage: 'login',
  setCurrentPage: () => {},
});

// Modal state context provider
export function ModalStateProvider(props: { children: any }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<ModalPage>('login');

  return (
    <ModalStateContext.Provider
      value={{
        modalOpen,
        setModalOpen,
        currentPage,
        setCurrentPage,
      }}
    >
      {props.children}
    </ModalStateContext.Provider>
  );
}

// Modal context hook
export const useModal = () => {
  const context = useContext(ModalStateContext);
  return context;
};
