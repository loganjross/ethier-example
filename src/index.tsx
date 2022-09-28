import './styles.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Navbar } from './components/Navbar';

// Import the Ethier react plugin and button to your dApp
import { EthierReact } from './ethier-react';

// Example dApp
function ExampleDapp() {
  return (
    <EthierReact>
      <Navbar />
    </EthierReact>
  );
}

// Render
const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <StrictMode>
    <ExampleDapp />
  </StrictMode>
);
