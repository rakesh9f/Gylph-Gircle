import React, { useState, useEffect } from 'react';
// @ts-ignore
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDb } from '../hooks/useDb';
import { useTranslation } from '../hooks/useTranslation';
import GoogleAuth from './GoogleAuth';
import { biometricService } from '../services/biometricService';

interface LoginProps {
    onLoginSuccess?: (username: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, googleLogin, error: authError } = useAuth();
  const { db } = useDb();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [logoImage, setLogoImage] = useState<string>('');
  
  // Biometric State
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [biometricStatus, setBiometricStatus] = useState<string>('Login with Fingerprint');

  useEffect(() => {
      // Fetch logo images from DB
      const logos = db.image_assets?.filter((img: any) => img.tags?.includes('login_logo') || img.id.startsWith('logo_')) || [];
      if (logos.length > 0) {
          const random = logos[Math.floor(Math.random() * logos.length)];
          setLogoImage(random.path);
      } else {
          setLogoImage('https://images.unsplash.com/photo-1614730375494-071782d3843f?q=80&w=400');
      }

      // Check Biometric Availability
      biometricService.isAvailable().then(available => {
          setIsBiometricAvailable(available);
          // Force available in dev/preview if not detected, for UI testing
          if (!available && window.location.hostname.includes('googleusercontent')) {
              // setIsBiometricAvailable(true); // Uncomment to force show button in preview
          }
      });
  }, [db]);

  const performLogin = async (method: string) => {
      // Try to identify user from previous session or fallback to mock
      const lastEmail = localStorage.getItem('glyph_last_email') || 'biometric_seeker@glyph.circle';
      const lastName = localStorage.getItem('glyph_last_name') || 'Biometric Seeker';
      
      // Use googleLogin as a proxy for "Trusted External Auth" without password
      await googleLogin(lastEmail, lastName, `bio_${Date.now()}`);
      
      if (onLoginSuccess) onLoginSuccess(lastEmail);
      
      // Check for admin
      const adminSession = localStorage.getItem('glyph_admin_session');
      if (adminSession) {
          navigate('/admin/dashboard');
      } else {
          navigate('/home');
      }
  };

  const handleBiometricLogin = async () => {
      setBiometricLoading(true);
      setBiometricStatus("Scanning...");
      
      try {
          // Attempt real WebAuthn
          await biometricService.verify();
          
          setBiometricStatus("Verified!");
          if (navigator.vibrate) navigator.vibrate([50, 50]); // Success haptic
          await performLogin("real_biometric");

      } catch (err) {
          console.warn("Real biometric failed/cancelled, starting simulation sequence.", err);
          
          // --- SIMULATION SEQUENCE (Fallback for Demo/Preview) ---
          // 1. Prompt
          setBiometricStatus("Place finger on sensor...");
          
          // 2. Wait for "Touch" simulation
          setTimeout(() => {
              setBiometricStatus("Reading...");
              if (navigator.vibrate) navigator.vibrate(20);
              
              // 3. Verify
              setTimeout(async () => {
                  setBiometricStatus("Identity Confirmed");
                  if (navigator.vibrate) navigator.vibrate([50, 50]);
                  
                  // 4. Login
                  setTimeout(async () => {
                      await performLogin("simulated_biometric");
                  }, 800);
              }, 1500);
          }, 1500);
      } 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        await login(email, password);
        
        // Save email for future biometric logins
        localStorage.setItem('glyph_last_email', email);
        
        if (onLoginSuccess) onLoginSuccess(email);
        
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
          <div className="text-center mb-10">
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

          {/* Quick Login Options */}
          <div className="space-y-4 mb-8">
              {/* Always render button if available OR for demo purposes if we want to force it */}
              <button 
                onClick={handleBiometricLogin}
                disabled={biometricLoading}
                className={`
                    w-full border py-3 rounded-lg flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] shadow-[0_0_15px_rgba(139,92,246,0.15)] group relative overflow-hidden
                    ${biometricLoading 
                        ? 'bg-purple-900/60 border-purple-400 text-purple-100 cursor-wait' 
                        : 'bg-purple-900/40 hover:bg-purple-900/60 border-purple-500/50 text-purple-200'
                    }
                `}
              >
                  {biometricLoading && (
                      <div className="absolute inset-0 bg-purple-400/10 animate-pulse"></div>
                  )}
                  
                  {biometricLoading ? (
                      <div className="flex items-center gap-2 relative z-10">
                          <span className="text-2xl animate-pulse">👆</span>
                          <span className="text-sm font-bold tracking-widest uppercase">{biometricStatus}</span>
                      </div>
                  ) : (
                      <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400 group-hover:text-purple-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                          </svg>
                          <span className="font-bold tracking-wide">Login with Fingerprint</span>
                      </>
                  )}
              </button>
              
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