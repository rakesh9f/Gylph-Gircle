
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from './shared/Card';
import { useDb } from '../hooks/useDb';

const AdminConfig: React.FC = () => {
  const { db } = useDb();
  
  // Toggles State
  const [toggles, setToggles] = useState({
    tarot: localStorage.getItem('service_tarot') !== 'false',
    palm: localStorage.getItem('service_palm') !== 'false',
    maintenance: localStorage.getItem('maintenance_mode') === 'true',
  });

  const handleToggle = (key: 'tarot' | 'palm' | 'maintenance') => {
      const newVal = !toggles[key];
      setToggles({ ...toggles, [key]: newVal });
      
      // Persist
      if (key === 'tarot') localStorage.setItem('service_tarot', String(newVal));
      if (key === 'palm') localStorage.setItem('service_palm', String(newVal));
      if (key === 'maintenance') localStorage.setItem('maintenance_mode', String(newVal));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 font-mono">
        <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
                <h1 className="text-2xl font-bold text-amber-500">CONFIG PANEL</h1>
                <Link to="/admin/dashboard" className="text-gray-400 hover:text-white">&larr; Dashboard</Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. SERVICE TOGGLES */}
                <Card className="bg-gray-800 border-gray-700 p-6">
                    <h3 className="text-lg font-bold mb-4 text-gray-300">Feature Switches</h3>
                    
                    <div className="space-y-4">
                        <div className="flex justify-between items-center bg-gray-900 p-3 rounded">
                            <span>🔮 Tarot Reading</span>
                            <button 
                                onClick={() => handleToggle('tarot')}
                                className={`px-3 py-1 rounded text-xs font-bold ${toggles.tarot ? 'bg-green-600' : 'bg-red-600'}`}
                            >
                                {toggles.tarot ? 'ENABLED' : 'DISABLED'}
                            </button>
                        </div>

                        <div className="flex justify-between items-center bg-gray-900 p-3 rounded">
                            <span>✋ Palmistry</span>
                            <button 
                                onClick={() => handleToggle('palm')}
                                className={`px-3 py-1 rounded text-xs font-bold ${toggles.palm ? 'bg-green-600' : 'bg-red-600'}`}
                            >
                                {toggles.palm ? 'ENABLED' : 'DISABLED'}
                            </button>
                        </div>

                        <div className="flex justify-between items-center bg-gray-900 p-3 rounded border border-red-900/50">
                            <span className="text-red-400">⚠️ Maintenance Mode</span>
                            <button 
                                onClick={() => handleToggle('maintenance')}
                                className={`px-3 py-1 rounded text-xs font-bold ${toggles.maintenance ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-400'}`}
                            >
                                {toggles.maintenance ? 'ACTIVE' : 'OFF'}
                            </button>
                        </div>
                    </div>
                </Card>

                {/* 2. DATABASE STATS */}
                <Card className="bg-gray-800 border-gray-700 p-6">
                    <h3 className="text-lg font-bold mb-4 text-gray-300">Database Status</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-900 p-4 rounded text-center">
                            <div className="text-2xl font-bold text-blue-400">{db.users?.length || 0}</div>
                            <div className="text-xs text-gray-500">Total Users</div>
                        </div>
                        <div className="bg-gray-900 p-4 rounded text-center">
                            <div className="text-2xl font-bold text-purple-400">{db.readings?.length || 0}</div>
                            <div className="text-xs text-gray-500">Readings Generated</div>
                        </div>
                        <div className="bg-gray-900 p-4 rounded text-center">
                            <div className="text-2xl font-bold text-green-400">₹{db.transactions?.reduce((acc: any, t: any) => acc + t.amount, 0) || 0}</div>
                            <div className="text-xs text-gray-500">Total Revenue</div>
                        </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-700">
                        <Link to="/admin/db/users" className="block w-full text-center bg-gray-700 hover:bg-gray-600 py-2 rounded text-sm mb-2">
                            View User Table
                        </Link>
                        <Link to="/admin/db/payments" className="block w-full text-center bg-gray-700 hover:bg-gray-600 py-2 rounded text-sm">
                            View Transactions
                        </Link>
                    </div>
                </Card>

            </div>
        </div>
    </div>
  );
};

export default AdminConfig;
