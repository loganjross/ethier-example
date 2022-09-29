import './styles.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Import the Ethier react plugin and button to your dApp
import { EthierReact, EthierButton } from './ethier-react';

// Example dApp
function ExampleDapp() {
  return (
    // Wrap your app in the provider
    <EthierReact>
      <div className='navbar flex justify-between align-center'>
        <p></p>
        <EthierButton />
      </div>
    </EthierReact>
  );
}

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <StrictMode>
    <ExampleDapp />
  </StrictMode>
);
