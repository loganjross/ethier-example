import './styles.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Import the Ethier react plugin and button to your dApp
import { EthierReact, EthierButton, useEthier } from './ethier-react';

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <StrictMode>
    {/* Wrap your app in the provider */}
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
        {/* Place the EthierButton anywhere in app */}
        <EthierButton />
      </div>
      <div className='view flex-centered column'>
        <div className='example-box flex-centered'>
          {ethier.isLoggedIn ? (
            <p>Username: {ethier.username}</p>
          ) : (
            <span className='btn' onClick={ethier.promptLogin}>
              Connect with Ethier
            </span>
          )}
        </div>
        <Wireframe height={150} width='80%' />
        <div className='flex-centered'>
          <Wireframe height={200} width={408} />
          <Wireframe height={200} width={408} />
        </div>
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
