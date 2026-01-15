
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const session = localStorage.getItem('glyph_admin_session');
    if (!session) {
      navigate('/master-login');
      return;
    }
    setUser(JSON.parse(session));
  }, [navigate]);

  const handleLogout = () => {
      localStorage.removeItem('glyph_admin_session');
      navigate('/master-login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center font-sans">
      <div className="max-w-md w-full bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-green-400 text-sm font-mono">
                Logged in as: {user.user}
            </p>
        </div>

        <div className="space-y-4">
            <button 
                onClick={() => navigate('/home')}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold transition-colors flex items-center justify-center gap-2"
            >
                <span>👤</span> Run App as User
            </button>

            <button 
                onClick={() => navigate('/admin/config')}
                className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded font-bold transition-colors flex items-center justify-center gap-2"
            >
                <span>⚙️</span> Config Panel
            </button>

            <button 
                onClick={() => navigate('/admin/cloud')}
                className="w-full py-4 bg-gradient-to-r from-orange-600 to-orange-800 hover:from-orange-500 hover:to-orange-700 text-white rounded font-bold transition-colors flex items-center justify-center gap-2 border border-orange-500"
            >
                <span>☁️</span> Cloud Storage Config
            </button>

            <button 
                onClick={() => navigate('/admin/payments')}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-800 hover:from-emerald-500 hover:to-teal-700 text-white rounded font-bold transition-colors flex items-center justify-center gap-2 border border-emerald-500"
            >
                <span>💳</span> Payment Gateways
            </button>
        </div>

        <div className="mt-8 pt-4 border-t border-gray-700 text-center">
            <button onClick={handleLogout} className="text-red-400 hover:text-red-300 text-sm underline">
                Sign Out
            </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
