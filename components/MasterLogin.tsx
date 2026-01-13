
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from './shared/Card';
import Button from './shared/Button';
import AdminCredentials from './AdminCredentials';
import { useTranslation } from '../hooks/useTranslation';

const MasterLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showCreds, setShowCreds] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Hardcoded Admin Credentials
    if (email === 'admin@gylphcircle.com' && password === 'admin123') {
      localStorage.setItem('glyph_admin_session', JSON.stringify({ user: 'admin', role: 'admin' }));
      navigate('/admin/config');
      return;
    }

    if (email === 'master@gylphcircle.com' && password === 'master123') {
      localStorage.setItem('glyph_admin_session', JSON.stringify({ user: 'master', role: 'superadmin' }));
      navigate('/admin/config');
      return;
    }

    setError('Invalid Master Credentials');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Matrix Effect */}
      <div className="absolute inset-0 bg-black z-0">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50"></div>
      </div>

      <Card className="w-full max-w-md bg-gray-900/90 border border-green-500/30 shadow-[0_0_50px_rgba(34,197,94,0.1)] relative z-10 backdrop-blur-xl">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/50 animate-pulse">
              <span className="text-3xl">👁️</span>
            </div>
            <h1 className="text-3xl font-cinzel font-bold text-green-400 tracking-widest">MASTER ACCESS</h1>
            <p className="text-green-600/60 font-mono text-xs mt-2">RESTRICTED AREA • LEVEL 5 CLEARANCE</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-green-500/80 text-xs font-mono mb-1 uppercase">Admin ID</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 bg-black/50 border border-green-500/20 rounded text-green-100 focus:outline-none focus:border-green-500 font-mono placeholder-green-900"
                placeholder="admin@gylphcircle.com"
              />
            </div>

            <div>
              <label className="block text-green-500/80 text-xs font-mono mb-1 uppercase">Passcode</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-black/50 border border-green-500/20 rounded text-green-100 focus:outline-none focus:border-green-500 font-mono placeholder-green-900"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-500/50 text-red-400 p-2 text-xs font-mono text-center">
                ACCESS DENIED: {error}
              </div>
            )}

            <Button type="submit" className="w-full bg-green-900/50 hover:bg-green-800 border-green-500/50 text-green-300 font-mono rounded-none">
              AUTHENTICATE
            </Button>
          </form>

          <div className="mt-8 flex justify-center">
            <button 
                onClick={() => setShowCreds(true)}
                className="text-xs text-green-500/40 hover:text-green-400 underline decoration-dotted font-mono cursor-help"
            >
                [?] How to find admin names?
            </button>
          </div>
        </div>
      </Card>

      <AdminCredentials isVisible={showCreds} onClose={() => setShowCreds(false)} />
    </div>
  );
};

export default MasterLogin;
