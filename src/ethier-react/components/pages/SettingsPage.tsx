import { useEthier } from '../../contexts/ethier';

export function SettingsPage() {
  const { deleteAccountOrLogout } = useEthier();

  return (
    <div className='ethier-modal-page flex-centered column'>
      <button
        className='full-width error-btn'
        onClick={() => deleteAccountOrLogout(false)}
      >
        Sign Out
      </button>
      <span
        className='link-btn error-link-btn'
        onClick={() => deleteAccountOrLogout(true)}
      >
        Delete Account
      </span>
    </div>
  );
}
