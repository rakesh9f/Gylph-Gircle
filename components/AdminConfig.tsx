
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

  // Helper for icons
  const getTableIcon = (name: string) => {
      if (name.includes('user')) return '👥';
      if (name.includes('read')) return '📜';
      if (name.includes('pay') || name.includes('trans')) return '💰';
      if (name.includes('store') || name.includes('item')) return '🛒';
      if (name.includes('image') || name.includes('asset')) return '🖼️';
      if (name.includes('config')) return '⚙️';
      if (name.includes('cloud')) return '☁️';
      return '📂';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-gray-900 to-maroon-950 text-amber-50 p-6 font-lora selection:bg-amber-500 selection:text-black">
        <div className="max-w-7xl mx-auto">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 pb-6 border-b border-amber-500/20">
                <div className="flex items-center gap-4 mb-4 md:mb-0">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-maroon-600 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.4)] border-2 border-amber-300">
                        <span className="text-3xl">⚙️</span>
                    </div>
                    <div>
                        <h1 className="text-3xl font-cinzel font-bold text-amber-200 tracking-wide">System Configuration</h1>
                        <p className="text-amber-500/60 text-sm font-mono uppercase tracking-widest">Master Control Plane</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <Link to="/home" className="px-4 py-2 rounded-full border border-amber-500/30 text-amber-200 hover:bg-amber-900/40 hover:border-amber-400 transition-all flex items-center gap-2 group">
                         <span className="group-hover:-translate-x-1 transition-transform">🏠</span> Home
                    </Link>
                    <Link to="/admin/dashboard" className="px-4 py-2 rounded-full bg-amber-600 text-white hover:bg-amber-500 shadow-lg shadow-amber-900/20 transition-all flex items-center gap-2">
                         <span>📊</span> Dashboard
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT COLUMN: Controls & Stats */}
                <div className="lg:col-span-1 space-y-8">
                    
                    {/* Feature Toggles */}
                    <Card className="bg-black/40 backdrop-blur-md border-amber-500/20 p-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -z-10"></div>
                        <h3 className="text-xl font-cinzel font-bold mb-6 text-amber-100 flex items-center gap-2">
                            <span className="text-amber-500">⚡</span> Global Controls
                        </h3>
                        
                        <div className="space-y-4">
                            {/* Tarot Switch */}
                            <div className="flex justify-between items-center bg-gray-900/60 p-4 rounded-xl border border-amber-500/10 hover:border-amber-500/30 transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">🔮</span>
                                    <span className="font-bold text-sm">Tarot Service</span>
                                </div>
                                <button 
                                    onClick={() => handleToggle('tarot')}
                                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${toggles.tarot ? 'bg-green-600' : 'bg-gray-700'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-300 ${toggles.tarot ? 'left-7' : 'left-1'}`}></div>
                                </button>
                            </div>

                            {/* Palmistry Switch */}
                            <div className="flex justify-between items-center bg-gray-900/60 p-4 rounded-xl border border-amber-500/10 hover:border-amber-500/30 transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">✋</span>
                                    <span className="font-bold text-sm">Palmistry</span>
                                </div>
                                <button 
                                    onClick={() => handleToggle('palm')}
                                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${toggles.palm ? 'bg-green-600' : 'bg-gray-700'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-300 ${toggles.palm ? 'left-7' : 'left-1'}`}></div>
                                </button>
                            </div>

                            {/* Maintenance Switch */}
                            <div className={`flex justify-between items-center p-4 rounded-xl border transition-colors ${toggles.maintenance ? 'bg-red-900/20 border-red-500/50' : 'bg-gray-900/60 border-amber-500/10'}`}>
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">⚠️</span>
                                    <span className={`font-bold text-sm ${toggles.maintenance ? 'text-red-400' : 'text-gray-400'}`}>Maintenance</span>
                                </div>
                                <button 
                                    onClick={() => handleToggle('maintenance')}
                                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${toggles.maintenance ? 'bg-red-600' : 'bg-gray-700'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-300 ${toggles.maintenance ? 'left-7' : 'left-1'}`}></div>
                                </button>
                            </div>
                        </div>
                    </Card>

                    {/* Stats Card */}
                     <Card className="bg-gradient-to-b from-indigo-900/40 to-black/60 border-indigo-500/30 p-6 shadow-xl relative">
                        <div className="absolute top-[-20%] left-[-20%] w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
                        <h3 className="text-lg font-cinzel font-bold mb-6 text-indigo-200 border-b border-indigo-500/20 pb-2">
                            Live Metrics
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-black/30 p-4 rounded-lg text-center border border-indigo-500/20 hover:border-indigo-400/50 transition-colors">
                                <div className="text-3xl font-bold text-blue-400 mb-1">{db.users?.length || 0}</div>
                                <div className="text-[10px] uppercase text-indigo-300/60 font-bold tracking-widest">Seekers</div>
                            </div>
                            <div className="bg-black/30 p-4 rounded-lg text-center border border-indigo-500/20 hover:border-indigo-400/50 transition-colors">
                                <div className="text-3xl font-bold text-green-400 mb-1">₹{db.transactions?.reduce((acc: any, t: any) => acc + t.amount, 0).toLocaleString() || 0}</div>
                                <div className="text-[10px] uppercase text-green-300/60 font-bold tracking-widest">Revenue</div>
                            </div>
                            <div className="bg-black/30 p-4 rounded-lg text-center border border-indigo-500/20 hover:border-indigo-400/50 transition-colors col-span-2">
                                <div className="text-2xl font-bold text-amber-400 mb-1">{db.readings?.length || 0}</div>
                                <div className="text-[10px] uppercase text-amber-300/60 font-bold tracking-widest">Readings Generated</div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* RIGHT COLUMN: Database Tables */}
                <div className="lg:col-span-2">
                    <Card className="bg-black/40 backdrop-blur-xl border-amber-500/20 p-8 h-full shadow-2xl">
                        <div className="flex justify-between items-end mb-8 border-b border-amber-500/20 pb-4">
                            <div>
                                <h3 className="text-2xl font-cinzel font-bold text-amber-100">Database Ledger</h3>
                                <p className="text-sm text-amber-200/50 font-lora mt-1">Manage core collections and records.</p>
                            </div>
                            <div className="text-right hidden sm:block">
                                <span className="text-xs text-green-400 bg-green-900/20 border border-green-900/50 px-3 py-1 rounded-full font-mono">
                                    ● System Online
                                </span>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {tableNames.map(tableName => (
                                <Link 
                                    key={tableName} 
                                    to={`/admin/db/${tableName}`}
                                    className="group bg-gray-900/60 hover:bg-gradient-to-br hover:from-gray-800 hover:to-gray-900 p-5 rounded-xl border border-gray-700 hover:border-amber-500/50 transition-all duration-300 relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150"></div>
                                    
                                    <div className="flex justify-between items-start mb-3 relative z-10">
                                        <span className="text-3xl filter drop-shadow-md group-hover:scale-110 transition-transform duration-300">
                                            {getTableIcon(tableName)}
                                        </span>
                                        <span className="bg-black/50 text-amber-400 text-xs font-mono px-2 py-1 rounded border border-amber-500/20 group-hover:border-amber-500/50 group-hover:bg-amber-900/20 transition-colors">
                                            {/* @ts-ignore */ db[tableName]?.length || 0}
                                        </span>
                                    </div>
                                    
                                    <h4 className="font-cinzel font-bold text-gray-200 capitalize text-sm truncate group-hover:text-amber-200 relative z-10" title={tableName}>
                                        {tableName.replace(/_/g, ' ')}
                                    </h4>
                                    
                                    <div className="w-8 h-0.5 bg-gray-700 mt-3 group-hover:w-full group-hover:bg-amber-500/50 transition-all duration-500"></div>
                                </Link>
                            ))}
                        </div>
                        
                        <div className="mt-8 pt-6 border-t border-amber-500/10 text-center">
                            <p className="text-xs text-gray-500 font-mono">
                                Secure Storage • SQLite V3 • Encrypted
                            </p>
                        </div>
                    </Card>
                </div>

            </div>
        </div>
    </div>
  );
};

export default AdminConfig;
