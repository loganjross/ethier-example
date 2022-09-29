import './styles.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Import the Ethier react plugin and button to your dApp
import { EthierReact, EthierButton, useEthier } from './ethier-react';

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <StrictMode>
    {/* Wrap your dApp in the provider */}
    <EthierReact>
      <ExampleDapp />
    </EthierReact>
  </StrictMode>
);

function ExampleDapp() {
  // The useEthier hook can be used to interact with the widget
  const ethier = useEthier();

  return (
    <div>
      <div className='navbar flex justify-between align-center'>
        <Wireframe height={25} width={100} />
        <div className='flex-centered desktop-only'>
          <Wireframe height={10} width={50} />
          <Wireframe height={10} width={50} />
          <Wireframe height={10} width={50} />
        </div>
        {/* Place the EthierButton anywhere in dApp */}
        <EthierButton />
      </div>
      <div className='view flex-centered column'>
        <div className='example-box flex-centered column'>
          {ethier.isLoggedIn && (
            <div className='example-box-data'>
              <div className='example-box-data-item flex align-center justify-between'>
                <b>EMAIL</b>
                <p>{ethier.email}</p>
              </div>
              <div className='example-box-data-item flex align-center justify-between'>
                <b>BALANCE</b>
                <p>{ethier.getTokenBalance('ETH')} ETH</p>
              </div>
            </div>
          )}
          <span
            className='btn'
            onClick={ethier.isLoggedIn ? ethier.logout : ethier.promptLogin}
          >
            {ethier.isLoggedIn
              ? 'Disconnect from Ethier'
              : 'Connect with Ethier'}
          </span>
        </div>
        <Wireframe height={150} width='80%' />
      </div>
    </div>
  );
}
function Wireframe(props: {
  height: number | string;
  width: number | string;
  className?: string;
}) {
  const { height, width } = props;
  return (
    <div
      className={`wireframe ${props.className ?? ''}`}
      style={{ height, width }}
    ></div>
  );
}
