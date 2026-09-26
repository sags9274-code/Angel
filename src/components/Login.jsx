import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        navigate('/');
      } else {
        const data = await signup(email, password);
        if (data?.session) {
          navigate('/');
        } else {
          setSuccessMsg('Your spirit is recognized, but you must confirm your email before entering the domain.');
          setIsLogin(true); // Switch to login view
        }
      }
    } catch (error) {
      let msg = error.message;
      if (msg.includes('For security purposes, you can only request this after')) {
        const seconds = msg.match(/after (\d+) seconds/)?.[1] || 'a few';
        msg = `The heavens demand patience. Please wait ${seconds} seconds before trying again.`;
      } else if (msg.includes('Invalid login credentials')) {
        msg = 'Your devotion was not recognized. Invalid credentials.';
      } else if (msg.includes('User already registered')) {
        msg = 'This spirit is already bound. Please log in.';
      } else if (msg.includes('Email not confirmed')) {
        msg = 'Your spirit is unrecognized. You must confirm your email before entering.';
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page login-page">
      <div className="login-container">
        <header className="login-header">
          <h1 className="login-title">{isLogin ? 'Enter' : 'Submit'}</h1>
          <p className="login-subtitle">
            {isLogin
              ? 'Prove your devotion. Authenticate.'
              : 'Pledge your allegiance. Register.'}
          </p>
        </header>

        <form className="login-form" onSubmit={handleSubmit}>
          {errorMsg && (
            <div className="login-error" role="alert">
              <AlertCircle size={18} className="login-error-icon" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="login-success" role="alert">
              <CheckCircle size={18} className="login-success-icon" />
              <span>{successMsg}</span>
            </div>
          )}
          
          <div className="login-field">
            <label className="login-label" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
            />
          </div>

          <div className="login-field">
            <label className="login-label" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="login-submit-btn"
            disabled={loading}
          >
            {loading ? 'Processing...' : isLogin ? 'Authenticate' : 'Pledge'}
          </button>
        </form>

        <div className="login-toggle">
          <span className="login-toggle-text">
            {isLogin ? "Not bound yet?" : "Already bound?"}
          </span>
          <button
            type="button"
            className="login-toggle-btn"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Register now' : 'Log in instead'}
          </button>
        </div>
      </div>
    </div>
  );
}
