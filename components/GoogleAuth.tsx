
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// 🚨 FAKE GOOGLE LOGIN (No API Keys Needed)
// This solves the 401 invalid_client error instantly.

const GoogleAuth: React.FC = () => {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleFakeLogin = async () => {
    setLoading(true);
    
    // Simulate network delay
    setTimeout(async () => {
        const fakeUser = {
            email: 'rakesh9f@gmail.com', // 👑 This will be AUTO-ADMIN
            name: 'Rakesh F (Google)',
            sub: 'fake-google-id-' + Date.now()
        };

        console.log("✅ FAKE GOOGLE LOGIN SUCCESS:", fakeUser);
        await googleLogin(fakeUser.email, fakeUser.name, fakeUser.sub);
        setLoading(false);

        // Check for admin session immediately after login
        const adminSession = localStorage.getItem('glyph_admin_session');
        if (adminSession) {
            navigate('/admin/dashboard');
        } else {
            navigate('/home');
        }
    }, 800);
  };

  return (
    <div className="w-full flex flex-col items-center">
        <button 
            type="button"
            onClick={handleFakeLogin}
            disabled={loading}
            className="w-full max-w-[300px] flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-800 font-roboto font-medium py-2.5 px-4 rounded-full shadow-md transition-transform active:scale-95 border border-gray-300"
        >
            {loading ? (
                <span className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></span>
            ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
            )}
            <span>{loading ? 'Authenticating...' : 'Continue with Google'}</span>
        </button>
        <p className="text-[10px] text-gray-500 mt-2">(Development Mode: No Password Required)</p>
    </div>
  );
};

export default GoogleAuth;
