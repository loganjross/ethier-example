import { useEffect, useState } from 'react';
import { WidgetPage, widgetTabsPages, useWidget } from '../contexts/widget';
import { useEthier, useUser } from '../contexts/ethier';
import { formatPubkey } from '../util/format';
import { LoginPage } from './pages/LoginPage';
import { BalancesPage } from './pages/BalancesPage';
import { TransferPage } from './pages/TransferPage';
import { SettingsPage } from './pages/SettingsPage';

// Main Ethier widget
export function EthierWidget() {
  const { widgetOpen, toggleWidgetOpen, currentPage, setCurrentPage } =
    useWidget();
  const { isLoggedIn } = useEthier();
  const { user } = useUser();
  const pubkey = user?.ethAccount?.address ?? '';
  const button: HTMLElement | null = document.querySelector('.ethier-btn');
  const [offset, setOffset] = useState<{ right: number; top: number }>({
    right: 0,
    top: 0,
  });

  // Place widget based on the position of Ethier Button
  useEffect(() => {
    if (!button) return;

    const buttonRect = button.getBoundingClientRect();
    setOffset({
      right: buttonRect.right,
      top: buttonRect.top,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [button, window.innerWidth, window.innerHeight]);

  // Return the current widget page
  function renderCurrentPage(): JSX.Element {
    switch (currentPage) {
      case 'balances':
        return <BalancesPage />;
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
      case 'transfer':
        return '33.333%';
      case 'settings':
        return '66.666%';
      default:
        return '0';
    }
  }

  if (widgetOpen) {
    return (
      <div
        className='ethier-widget flex-centered column'
        style={{
          right: `calc(100vw - ${offset.right}px)`,
          top: offset.top + 50,
        }}
      >
        {pubkey && (
          <div
            className='ethier-widget-pubkey-copy flex-centered'
            onClick={() => navigator.clipboard.writeText(pubkey)}
          >
            <p>{formatPubkey(pubkey)}</p>
            <i className='fa-solid fa-copy'></i>
          </div>
        )}
        <div
          className='ethier-widget-close flex-centered'
          onClick={toggleWidgetOpen}
        >
          <i className='fa-regular fa-x'></i>
        </div>
        {renderCurrentPage()}
        <div className='ethier-widget-tabs flex-centered'>
          {widgetTabsPages.map((page) => (
            <div
              key={page}
              onClick={() => (isLoggedIn ? setCurrentPage(page) : null)}
              className={`ethier-widget-tabs-tab flex-centered ${
                currentPage === page ? 'active' : ''
              }`}
            >
              <div
                className='ethier-widget-tabs-border'
                style={{
                  left: getBorderPosition(),
                  width: currentPage === 'login' ? '100%' : '33.333%',
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
