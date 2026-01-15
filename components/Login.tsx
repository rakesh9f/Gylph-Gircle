
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDb } from '../hooks/useDb';
import { useTranslation } from '../hooks/useTranslation';
import GoogleAuth from './GoogleAuth';

interface LoginProps {
    onLoginSuccess?: (username: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, error: authError } = useAuth();
  const { db } = useDb();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [logoImage, setLogoImage] = useState<string>('');

  useEffect(() => {
      // Fetch logo images from DB
      const logos = db.image_assets?.filter((img: any) => img.tags?.includes('login_logo') || img.id.startsWith('logo_')) || [];
      if (logos.length > 0) {
          const random = logos[Math.floor(Math.random() * logos.length)];
          setLogoImage(random.path);
      } else {
          // Fallback if DB hasn't synced new assets yet
          setLogoImage('https://images.unsplash.com/photo-1614730375494-071782d3843f?q=80&w=400');
      }
  }, [db]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        await login(email, password);
        if (onLoginSuccess) onLoginSuccess(email);
        
        // Check for admin session to redirect appropriately
        const adminSession = localStorage.getItem('glyph_admin_session');
        if (adminSession) {
            navigate('/admin/dashboard');
        } else {
            navigate('/home');
        }
    } catch (err) {
        // Error handled in UI via authError
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
      <div className="w-full max-w-md bg-transparent">
        <div className="p-4 sm:p-8">
          <div className="text-center mb-12">
             {logoImage && (
                 <div className="mx-auto w-24 h-24 mb-6 rounded-full p-1 bg-gradient-to-tr from-amber-500 to-purple-600 shadow-[0_0_30px_rgba(245,158,11,0.4)] animate-pulse-glow">
                     <img 
                        src={logoImage} 
                        alt="Mystic Symbol" 
                        className="w-full h-full object-cover rounded-full border-2 border-black" 
                     />
                 </div>
             )}
             <h1 className="text-4xl sm:text-5xl font-cinzel font-bold text-amber-500 tracking-wide mb-2">GLYPHCIRCLE</h1>
             <p className="text-gray-400 font-lora italic text-lg">enterCircle</p>
          </div>

          <div className="mb-8">
              <GoogleAuth />
          </div>

          <div className="relative mb-8 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-800"></div>
              </div>
              <div className="relative bg-[#0F0F23] px-4">
                  <span className="text-gray-500 font-lora text-sm">orContinueWith</span>
              </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-amber-200 font-cinzel font-bold text-lg mb-2 lowercase">email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 bg-gray-900/50 border border-amber-900/50 rounded-lg text-gray-300 focus:outline-none focus:border-amber-500/50 transition-all placeholder-gray-700"
                placeholder="seeker@glyph.circle"
                required
              />
            </div>

            <div>
              <label className="block text-amber-200 font-cinzel font-bold text-lg mb-2 lowercase">password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 bg-gray-900/50 border border-amber-900/50 rounded-lg text-gray-300 focus:outline-none focus:border-amber-500/50 transition-all placeholder-gray-700"
                placeholder="••••••••"
                required
              />
            </div>

            {authError && (
                <div className="bg-red-900/20 border border-red-900/50 p-3 rounded text-red-400 text-sm text-center">
                    {authError}
                </div>
            )}

            <button 
                type="submit" 
                className="w-full bg-red-900 hover:bg-red-800 text-white font-bold py-4 rounded-lg shadow-[0_0_15px_rgba(153,27,27,0.4)] transition-all transform hover:scale-[1.02] font-cinzel tracking-wider text-lg border border-red-700"
            >
               Login
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              <Link to="/register" className="hover:text-amber-400 transition-colors">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
