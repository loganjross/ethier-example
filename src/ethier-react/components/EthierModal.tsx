import { useEffect, useState } from 'react';
import { WidgetPage, widgetTabsPages, useWidget } from '../contexts/widget';
import { useEthier } from '../contexts/ethier';
import { LoginPage } from './pages/LoginPage';
import { BalancesPage } from './pages/BalancesPage';
import { NftsPage } from './pages/NftsPage';
import { TransferPage } from './pages/TransferPage';
import { SettingsPage } from './pages/SettingsPage';

// Main Ethier modal component
export function EthierModal() {
  const { widgetOpen, toggleWidgetOpen, currentPage, setCurrentPage } =
    useWidget();
  const { isLoggedIn } = useEthier();
  const button: HTMLElement | null = document.querySelector('.ethier-btn');
  const [offset, setOffset] = useState<{ right: number; top: number }>({
    right: 0,
    top: 0,
  });

  // Place modal based on the position of Ethier Button
  useEffect(() => {
    if (!button) return;

    const buttonRect = button.getBoundingClientRect();
    setOffset({
      right: buttonRect.right,
      top: buttonRect.top,
    });
  }, [button]);

  // Return the current modal page
  function renderCurrentPage(): JSX.Element {
    switch (currentPage) {
      case 'balances':
        return <BalancesPage />;
      case 'nfts':
        return <NftsPage />;
      case 'transfer':
        return <TransferPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <LoginPage />;
    }
  }

  // Get the icon for a page
  function getPageIcon(page: WidgetPage) {
    let suffix = '';
    switch (page) {
      case 'balances':
        suffix = 'circle-dollar-to-slot';
        break;
      case 'nfts':
        suffix = 'images';
        break;
      case 'transfer':
        suffix = 'paper-plane';
        break;
      case 'settings':
        suffix = 'sliders';
    }

    return <i className={`fa-solid fa-${suffix}`}></i>;
  }

  // Returns styling position for tab border
  function getBorderPosition() {
    switch (currentPage) {
      case 'nfts':
        return '25%';
      case 'transfer':
        return '50%';
      case 'settings':
        return '75%';
      default:
        return '0';
    }
  }

  if (widgetOpen) {
    return (
      <div
        className='ethier-modal flex-centered column'
        style={{
          right: `calc(100vw - ${offset.right}px)`,
          top: offset.top + 50,
        }}
      >
        <div
          className='ethier-modal-close flex-centered'
          onClick={toggleWidgetOpen}
        >
          <i className='fa-regular fa-x'></i>
        </div>
        {renderCurrentPage()}
        <div className='ethier-modal-tabs flex-centered'>
          {widgetTabsPages.map((page) => (
            <div
              key={page}
              onClick={() => (isLoggedIn ? setCurrentPage(page) : null)}
              className={`ethier-modal-tabs-tab flex-centered ${
                currentPage === page ? 'active' : ''
              }`}
            >
              <div
                className='ethier-modal-tabs-border'
                style={{
                  left: getBorderPosition(),
                  width: currentPage === 'login' ? '100%' : '25%',
                }}
              ></div>
              {getPageIcon(page)}
            </div>
          ))}
        </div>
      </div>
    );
  } else {
    return <></>;
  }
}
