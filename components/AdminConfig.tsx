
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

  const tableNames = Object.keys(db);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 font-mono">
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
                <h1 className="text-2xl font-bold text-amber-500">CONFIG PANEL</h1>
                <div className="flex gap-4">
                    <Link to="/home" className="text-gray-400 hover:text-white flex items-center gap-1">
                         <span>🏠</span> App Home
                    </Link>
                    <Link to="/admin/dashboard" className="text-gray-400 hover:text-white flex items-center gap-1">
                         <span>📊</span> Dashboard
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. SERVICE TOGGLES */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="bg-gray-800 border-gray-700 p-6">
                        <h3 className="text-lg font-bold mb-4 text-gray-300 border-b border-gray-700 pb-2">Global Switches</h3>
                        
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

                     <Card className="bg-gray-800 border-gray-700 p-6">
                        <h3 className="text-lg font-bold mb-4 text-gray-300 border-b border-gray-700 pb-2">Quick Stats</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-900 p-3 rounded text-center">
                                <div className="text-xl font-bold text-blue-400">{db.users?.length || 0}</div>
                                <div className="text-[10px] uppercase text-gray-500">Users</div>
                            </div>
                            <div className="bg-gray-900 p-3 rounded text-center">
                                <div className="text-xl font-bold text-green-400">₹{db.transactions?.reduce((acc: any, t: any) => acc + t.amount, 0) || 0}</div>
                                <div className="text-[10px] uppercase text-gray-500">Revenue</div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* 2. DATABASE MANAGEMENT */}
                <div className="lg:col-span-2">
                    <Card className="bg-gray-800 border-gray-700 p-6 h-full">
                        <h3 className="text-lg font-bold mb-4 text-gray-300 border-b border-gray-700 pb-2">Manage Database Tables</h3>
                        <p className="text-xs text-gray-500 mb-4">Select a table to view entries, toggle status, or add new records.</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {tableNames.map(tableName => (
                                <Link 
                                    key={tableName} 
                                    to={`/admin/db/${tableName}`}
                                    className="bg-gray-900 hover:bg-gray-700 p-4 rounded border border-gray-700 hover:border-amber-500/50 transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xl opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-transform">
                                            {tableName === 'users' ? '👥' : 
                                             tableName === 'readings' ? '📜' : 
                                             tableName === 'transactions' ? '💰' : 
                                             tableName === 'content' ? '📝' : '📂'}
                                        </span>
                                        <span className="bg-gray-800 text-gray-400 text-[10px] px-1.5 py-0.5 rounded">
                                            {/* @ts-ignore */ db[tableName]?.length || 0}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-amber-100 capitalize text-sm truncate" title={tableName}>
                                        {tableName.replace(/_/g, ' ')}
                                    </h4>
                                </Link>
                            ))}
                        </div>
                    </Card>
                </div>

            </div>
        </div>
    </div>
  );
};

export default AdminConfig;
