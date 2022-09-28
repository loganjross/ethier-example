import './styles.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Import the Ethier react plugin and button to your dApp
import { EthierProvider, EthierButton } from './ethier-react';

// Example dApp
function ExampleDapp() {
  return (
    // Wrap your app in the provider
    <EthierProvider>
      <div className='navbar flex justify-between align-center'>
        <p>Any dApp</p>
        <EthierButton />
      </div>
    </EthierProvider>
  );
}

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <StrictMode>
    <ExampleDapp />
  </StrictMode>
);
