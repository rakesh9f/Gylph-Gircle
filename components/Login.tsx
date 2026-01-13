
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from './shared/Button';
import Card from './shared/Card';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';

interface LoginProps {
    onLoginSuccess?: (username: string) => void; // Kept for backward compat if App.tsx passes it
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, error: authError } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        await login(email, password);
        // If prop provided (from old App structure), call it, otherwise navigate
        if (onLoginSuccess) onLoginSuccess(email);
        navigate('/home');
    } catch (err) {
        // Error handled in UI via authError
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
      <Card className="w-full max-w-md bg-black/60 backdrop-blur-xl border border-amber-500/20 shadow-2xl">
        <div className="p-8">
          <div className="text-center mb-8">
             <h1 className="text-4xl font-cinzel font-bold text-amber-400 drop-shadow-lg mb-2">{t('glyphCircle')}</h1>
             <p className="text-amber-100/60 font-lora italic">{t('enterCircle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-amber-200 text-sm font-bold mb-2">{t('email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 bg-gray-900/50 border border-amber-500/30 rounded-lg text-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all placeholder-gray-600"
                placeholder="seeker@glyph.circle"
                required
              />
            </div>

            <div>
              <label className="block text-amber-200 text-sm font-bold mb-2">{t('password')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-gray-900/50 border border-amber-500/30 rounded-lg text-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all placeholder-gray-600"
                placeholder="••••••••"
                required
              />
            </div>

            {authError && (
                <div className="bg-red-900/30 border border-red-500/30 p-3 rounded text-red-200 text-sm text-center animate-shake">
                    {authError}
                </div>
            )}

            <Button type="submit" className="w-full shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)]">
               {t('login')}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-amber-500/10 text-center">
            <p className="text-amber-200/60 text-sm">
              {t('noAccount')}{' '}
              <Link to="/register" className="text-amber-400 hover:text-amber-300 font-bold underline decoration-amber-500/30 transition-colors">
                {t('createOne')}
              </Link>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Login;
