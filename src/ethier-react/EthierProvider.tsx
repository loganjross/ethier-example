import './index.css';
import { FirebaseProvider } from './contexts/firebase';
import { ModalStateProvider } from './contexts/modal';
import { EthierModal } from './components/EthierModal';

// Wrapper for Ethier react widget
export function EthierProvider(props: { children: any }) {
  return (
    <ModalStateProvider>
      <FirebaseProvider>
        <EthierModal />
        {props.children}
      </FirebaseProvider>
    </ModalStateProvider>
  );
}
