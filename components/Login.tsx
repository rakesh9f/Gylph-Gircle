import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './shared/Button';
import { useTranslation } from '../hooks/useTranslation';
import { useDb } from '../hooks/useDb';

interface LoginProps {
  onLoginSuccess: (username: string) => void;
}

type AuthStep = 'form' | 'google_account_selection' | 'phone_otp' | 'register';

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [authStep, setAuthStep] = useState<AuthStep>('form');
  const [otp, setOtp] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirm, setRegisterConfirm] = useState('');
  const { t } = useTranslation();
  const { db } = useDb();
  
  const navigate = useNavigate();

  const handleLogin = () => {
    const user = db.users.find(u => u.name.toLowerCase() === username.toLowerCase());

    if (!user) {
      setError('Invalid credentials. Please try again.');
      return;
    }

    if (user.status === 'inactive') {
      setError('This account has been deactivated. Please contact support.');
      return;
    }

    // Check credentials
    const isRocky = user.name === 'rocky' && password === 'Rocky@9283';
    const isMinti = user.name === 'Minti' && password === 'Minti@1509';
    
    if (user.role === 'admin' && (isRocky || isMinti)) {
        setError('');
        onLoginSuccess(user.name);
    } else if (user.role === 'user') {
        // Mocking a successful login for any active user for demo purposes.
        setError('');
        onLoginSuccess(user.name);
    }
    else {
        setError('Invalid credentials. Please try again.');
    }
  };
  
  const handleRegister = () => {
    setError('');
    if (!registerEmail || !registerPassword || !registerConfirm) {
        setError('All fields are required.');
        return;
    }
    if (registerPassword !== registerConfirm) {
        setError('Passwords do not match.');
        return;
    }
    onLoginSuccess(registerEmail);
  };

  const completeSocialLogin = (username: string) => {
    const user = db.users.find(u => u.name.toLowerCase() === username.toLowerCase());

    if (user && user.status === 'active') {
      setError('');
      onLoginSuccess(username);
    } else {
      setError(`Login failed for ${username}. The account may be inactive or does not exist.`);
      setAuthStep('form');
    }
  };
  
  const handleVerifyOtp = () => {
    if (otp === '123456') {
        const mockUsername = `phone_user_${Date.now()}`;
        setError('');
        onLoginSuccess(mockUsername);
    } else {
        setError('Invalid OTP. Please enter 123456.');
    }
  };
  
  const renderForm = () => (
    <form 
      className="space-y-6" 
      onSubmit={(e) => {
        e.preventDefault();
        handleLogin();
      }}
    >
      <div>
        <label className="text-sm font-bold text-amber-200 block mb-2" htmlFor="username">
          {t('username')}
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 bg-gray-900 border border-amber-500/30 rounded-lg text-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder-gray-600"
          placeholder="e.g., rocky"
        />
      </div>
      <div>
        <label className="text-sm font-bold text-amber-200 block mb-2" htmlFor="password">
          {t('password')}
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 bg-gray-900 border border-amber-500/30 rounded-lg text-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder-gray-600"
          placeholder="••••••••"
        />
      </div>
      {error && <p className="text-red-400 text-sm font-bold bg-red-900/20 p-2 rounded">{error}</p>}
      <Button type="submit" className="w-full">
        {t('login')}
      </Button>

      <div className="relative flex py-2 items-center">
        <div className="flex-grow border-t border-amber-500/30"></div>
        <span className="flex-shrink mx-4 text-amber-200/60 text-sm">{t('orContinueWith')}</span>
        <div className="flex-grow border-t border-amber-500/30"></div>
      </div>

      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setAuthStep('google_account_selection')}
          className="w-full flex items-center justify-center py-3 px-4 bg-white text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-300 shadow-md border border-gray-300"
        >
          <svg className="w-6 h-6" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
            <path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path>
            <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path>
            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 36.49 44 30.861 44 24c0-1.341-.138-2.65-.389-3.917z"></path>
          </svg>
          <span className="ml-3 font-semibold text-sm">{t('signInGoogle')}</span>
        </button>
        <button
          type="button"
          onClick={() => setAuthStep('phone_otp')}
          className="w-full flex items-center justify-center py-3 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors duration-300 shadow-md border border-gray-500"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
          </svg>
          <span className="ml-3 font-semibold text-sm">{t('signInPhone')}</span>
        </button>
      </div>
       <p className="text-center text-sm text-amber-200/70">
          {t('noAccount')}{' '}
          <button type="button" onClick={() => setAuthStep('register')} className="font-bold text-amber-300 hover:underline">
            {t('createOne')}
          </button>
        </p>
    </form>
  );
  
  const renderRegisterForm = () => (
     <div className="space-y-4">
        <h2 className="text-2xl font-bold text-amber-300 text-center">{t('createAccount')}</h2>
        <div>
            <label className="text-sm font-bold text-amber-200 block mb-2" htmlFor="register-email">{t('email')}</label>
            <input id="register-email" type="email" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)}
              className="w-full p-3 bg-gray-900 border border-amber-500/30 rounded-lg text-amber-50" placeholder="you@example.com"/>
        </div>
        <div>
            <label className="text-sm font-bold text-amber-200 block mb-2" htmlFor="register-password">{t('password')}</label>
            <input id="register-password" type="password" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)}
              className="w-full p-3 bg-gray-900 border border-amber-500/30 rounded-lg text-amber-50" placeholder="••••••••"/>
        </div>
        <div>
            <label className="text-sm font-bold text-amber-200 block mb-2" htmlFor="register-confirm">{t('confirmPassword')}</label>
            <input id="register-confirm" type="password" value={registerConfirm} onChange={(e) => setRegisterConfirm(e.target.value)}
              className="w-full p-3 bg-gray-900 border border-amber-500/30 rounded-lg text-amber-50" placeholder="••••••••"/>
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div className="flex gap-4 pt-4">
            <Button onClick={() => { setError(''); setAuthStep('form'); }} className="w-full bg-gray-600 hover:bg-gray-500">{t('backToLogin')}</Button>
            <Button onClick={handleRegister} className="w-full">{t('createOne')}</Button>
        </div>
    </div>
  );
  
  const renderGoogleAccountSelection = () => {
    const mockAccounts = [
      { name: 'Minti', email: 'minti@glyph.co', isAdmin: true },
      { name: 'Jane Doe', email: 'jane.d@example.com', isAdmin: false },
    ];

    return (
     <div className="text-center">
        <h2 className="text-2xl font-bold text-amber-300 mb-2">{t('signIn')}</h2>
        <p className="text-amber-100 mb-6">{t('toContinue')}</p>
        <div className="space-y-3">
          {mockAccounts.map(acc => (
             <button key={acc.email} onClick={() => completeSocialLogin(acc.name)} className="w-full flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors duration-200 text-left">
                <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white text-lg mr-4">{acc.name.charAt(0)}</div>
                <div>
                  <p className="font-semibold text-amber-50">{acc.name}</p>
                  <p className="text-sm text-amber-200/70">{acc.email}</p>
                </div>
            </button>
          ))}
            <button onClick={() => setAuthStep('register')} className="w-full flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors duration-200 text-left">
                <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
                <div>
                  <p className="font-semibold text-amber-50">{t('useAnotherAccount')}</p>
                </div>
            </button>
        </div>
        <Button onClick={() => setAuthStep('form')} className="w-full bg-transparent hover:bg-gray-700 text-amber-200 mt-6">{t('back')}</Button>
    </div>
    );
  };
  
  const renderPhoneOtp = () => (
    <div className="text-center">
        <h2 className="text-2xl font-bold text-amber-300 mb-2">{t('enterOTP')}</h2>
        <p className="text-amber-100 mb-6">{t('otpPrompt')}</p>
        <div className="space-y-4">
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => {
                setError('');
                setOtp(e.target.value);
              }}
              className="w-full p-3 text-center text-2xl tracking-[.5em] bg-gray-900 border border-amber-500/30 rounded-lg text-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="••••••"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <p className="text-xs text-amber-200/60">{t('otpDemo')}</p>
             <div className="flex gap-4">
                <Button onClick={() => setAuthStep('form')} className="w-full bg-gray-600 hover:bg-gray-500">{t('back')}</Button>
                <Button onClick={handleVerifyOtp} className="w-full">{t('verify')}</Button>
            </div>
        </div>
    </div>
  );
  
  const renderContent = () => {
    switch (authStep) {
        case 'google_account_selection': return renderGoogleAccountSelection();
        case 'phone_otp': return renderPhoneOtp();
        case 'register': return renderRegisterForm();
        case 'form':
        default: return renderForm();
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-md p-8 bg-black/60 backdrop-blur-md rounded-xl shadow-2xl border border-amber-500/20">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-cinzel font-bold text-amber-400 drop-shadow-lg">{t('glyphCircle')}</h1>
          {authStep === 'form' && <p className="mt-2 text-amber-100 font-lora italic">{t('enterCircle')}</p>}
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default Login;