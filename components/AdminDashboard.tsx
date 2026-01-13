
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from './shared/Card';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const session = localStorage.getItem('glyph_admin_session');

  useEffect(() => {
      if (!session) navigate('/master-login');
  }, [navigate, session]);

  const user = session ? JSON.parse(session) : { role: 'Ghost' };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-white mb-2 font-cinzel">COMMAND CENTER</h1>
            <p className="text-green-500 font-mono text-sm">WELCOME, {user.role?.toUpperCase()}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* OPTION 1: USER MODE */}
            <Link to="/home" className="group">
                <Card className="h-64 flex flex-col items-center justify-center border-gray-700 group-hover:border-blue-500 transition-colors bg-gray-900">
                    <span className="text-5xl mb-4 grayscale group-hover:grayscale-0">👤</span>
                    <h2 className="text-2xl font-bold text-gray-300 group-hover:text-blue-400">Run as User</h2>
                    <p className="text-gray-500 mt-2">View App Frontend</p>
                </Card>
            </Link>

            {/* OPTION 2: CONFIG MODE */}
            <Link to="/admin/config" className="group">
                <Card className="h-64 flex flex-col items-center justify-center border-gray-700 group-hover:border-red-500 transition-colors bg-gray-900">
                    <span className="text-5xl mb-4 grayscale group-hover:grayscale-0">⚙️</span>
                    <h2 className="text-2xl font-bold text-gray-300 group-hover:text-red-400">CONFIG PANEL</h2>
                    <p className="text-gray-500 mt-2">Database & Settings</p>
                </Card>
            </Link>
        </div>

        <div className="mt-12 text-center">
            <button 
                onClick={() => {
                    localStorage.removeItem('glyph_admin_session');
                    navigate('/master-login');
                }}
                className="text-red-500 text-sm hover:underline"
            >
                Log Out
            </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
