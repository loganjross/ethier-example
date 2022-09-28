import { useFirebase } from '../contexts/firebase';
import { useModal } from '../contexts/modal';

// Button to trigger interactions with main component
export function EthierButton(props: { style?: React.CSSProperties }) {
  const { modalOpen, setModalOpen } = useModal();
  const { user } = useFirebase();

  return (
    <button
      className={`ethier-btn flex-centered ${modalOpen ? 'active' : ''}`}
      onClick={() => setModalOpen(!modalOpen)}
      style={props.style}
    >
      <span>{user?.displayName ?? 'Ethier Connect'}</span>
    </button>
  );
}
