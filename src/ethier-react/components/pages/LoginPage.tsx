import { useState } from 'react';
import { useUser } from '../../contexts/ethier';
import { validateEmail } from '../../util/validate';
import { ReactComponent as Spinner } from '../../assets/spinner.svg';

export function LoginPage() {
  const { createAccountOrLogin } = useUser();
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check inputs and submit login / create account
  async function submit() {
    let error = '';
    if (!email.length || !validateEmail(email)) {
      error = 'Invalid email';
    } else if (!password.length) {
      error = 'Invalid password';
    } else if (password.length < 6) {
      error = 'Use a longer password';
    }
    if (error.length) {
      setError(error);
      return;
    }

    // If no error, submit auth to firebase
    setLoading(true);
    const resp = await createAccountOrLogin(email, password, creatingAccount);
    if (resp.includes('wrong-password')) {
      setError('Incorrect password');
    } else if (resp.includes('already-in-use')) {
      setError('Email already in use');
    } else if (resp.includes('not-found')) {
      setError('No account found');
    } else if (resp.length) {
      setError('An error occurred');
    }
    setLoading(false);
  }

  return (
    <div className='ethier-widget-page flex-centered column'>
      <h1 className='brand-text'>{creatingAccount ? 'Sign Up' : 'Ethier'}</h1>
      <span className='desc-text' style={{ margin: '-6px 0 10px 0' }}>
        {!creatingAccount && 'An easier way to use Ethereum.'}
      </span>
      <div className={`input-group ${email.length ? 'has-value' : ''}`}>
        <input
          type='text'
          value={email}
          onChange={(e) => setEmail(e.target.value.toLowerCase())}
          onKeyUp={(e) => (e.code === 'Enter' ? submit() : null)}
        />
        <label className='placeholder'>Email</label>
      </div>
      <div className={`input-group ${password.length ? 'has-value' : ''}`}>
        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value.toLowerCase())}
          onKeyUp={(e) => (e.code === 'Enter' ? submit() : null)}
        />
        <label className='placeholder'>Password</label>
        <i
          onClick={() => setShowPassword(!showPassword)}
          className={`fa-regular fa-eye${showPassword ? ' active' : '-slash'}`}
        ></i>
      </div>
      <button
        className={error.length && !loading ? 'error-btn' : ''}
        onClick={submit}
      >
        {loading ? (
          <Spinner />
        ) : error.length ? (
          error
        ) : creatingAccount ? (
          'Create'
        ) : (
          'Login'
        )}
      </button>
      <span
        className='link-btn'
        onClick={() => setCreatingAccount(!creatingAccount)}
      >
        {creatingAccount ? 'Already a user?' : 'Create Account'}
      </span>
    </div>
  );
}
