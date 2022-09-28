import { useFirebase } from '../../contexts/firebase';

export function SettingsPage() {
  const { signOutOrDeleteAccount } = useFirebase();

  return (
    <div className='ethier-modal-page flex-centered column'>
      <button
        className='full-width error-btn'
        onClick={() => signOutOrDeleteAccount()}
      >
        Sign Out
      </button>
      <span
        className='link-btn error-link-btn'
        onClick={() => signOutOrDeleteAccount(true)}
      >
        Delete Account
      </span>
    </div>
  );
}
