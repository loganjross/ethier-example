import './index.css';
import { FirebaseProvider } from './contexts/firebase';
import { ModalStateProvider } from './contexts/modal';
import { EthierModal } from './components/EthierModal';

// Wrapper for Ethier react plugin
export function EthierReact(props: { children: any }) {
  return (
    <ModalStateProvider>
      <FirebaseProvider>
        <EthierModal />
        {props.children}
      </FirebaseProvider>
    </ModalStateProvider>
  );
}
