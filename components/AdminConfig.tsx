import React, { useState, useEffect } from 'react';
// @ts-ignore
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

  const tableNames = Object.keys(db).sort();

  // Helper for icons and colors
  const getTableMeta = (name: string) => {
      if (name.includes('user')) return { icon: '👥', color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-900/20' };
      if (name.includes('read') || name.includes('report')) return { icon: '📜', color: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-900/20' };
      if (name.includes('pay') || name.includes('trans')) return { icon: '💰', color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-900/20' };
      if (name.includes('store') || name.includes('item')) return { icon: '🛒', color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-900/20' };
      if (name.includes('image') || name.includes('asset')) return { icon: '🖼️', color: 'text-pink-400', border: 'border-pink-500/30', bg: 'bg-pink-900/20' };
      if (name.includes('config')) return { icon: '⚙️', color: 'text-gray-300', border: 'border-gray-500/30', bg: 'bg-gray-800/50' };
      if (name.includes('cloud')) return { icon: '☁️', color: 'text-cyan-400', border: 'border-cyan-500/30', bg: 'bg-cyan-900/20' };
      return { icon: '📂', color: 'text-amber-100', border: 'border-amber-500/20', bg: 'bg-gray-900/40' };
  };

  return (
    <div className="min-h-screen bg-[#050511] text-amber-50 font-lora selection:bg-maroon-700 selection:text-white">
        
        {/* TOP BAR */}
        <div className="bg-gradient-to-r from-maroon-900 via-[#0F0F23] to-[#050511] border-b border-amber-600/30 shadow-2xl sticky top-0 z-30">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-maroon-700 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.4)] border border-amber-300">
                        <span className="text-2xl animate-pulse">⚜️</span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-cinzel font-black text-amber-100 tracking-wider">
                            Admin <span className="text-amber-500">Sanctum</span>
                        </h1>
                        <p className="text-[10px] text-amber-300/60 font-mono uppercase tracking-[0.2em]">System Configuration V2</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <Link to="/home">
                        <button className="px-4 py-2 rounded border border-amber-500/20 text-amber-200 hover:bg-amber-900/30 text-xs font-bold uppercase tracking-wider transition-all hover:border-amber-500/50">
                            Exit to App
                        </button>
                    </Link>
                    <Link to="/admin/dashboard">
                        <button className="px-5 py-2 rounded bg-amber-600 hover:bg-amber-500 text-black text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all">
                            Dashboard
                        </button>
                    </Link>
                </div>
            </div>
        </div>

        <div className="max-w-7xl mx-auto p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* LEFT SIDEBAR: CONTROLS & STATS */}
                <div className="lg:col-span-1 space-y-6">
                    
                    {/* GLOBAL CONTROLS CARD */}
                    <div className="bg-[#0F0F23]/80 backdrop-blur-md border-l-4 border-maroon-600 rounded-r-xl shadow-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-maroon-900/50 to-transparent p-4 border-b border-white/5">
                            <h3 className="font-cinzel font-bold text-amber-100 flex items-center gap-2">
                                <span className="text-amber-500">⚡</span> Realm Controls
                            </h3>
                        </div>
                        
                        <div className="p-4 space-y-1">
                            {/* Feature Switches */}
                            {[
                                { id: 'tarot', label: 'Tarot Deck', active: toggles.tarot, icon: '🔮' },
                                { id: 'palm', label: 'Palmistry', active: toggles.palm, icon: '✋' },
                                { id: 'maintenance', label: 'Maintenance', active: toggles.maintenance, icon: '⚠️', danger: true },
                            ].map((item: any) => (
                                <div key={item.id} className="flex justify-between items-center p-3 rounded hover:bg-white/5 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <span className={`text-lg opacity-70 group-hover:opacity-100 transition-opacity ${item.danger ? 'text-red-400' : 'text-amber-200'}`}>{item.icon}</span>
                                        <span className={`text-sm font-medium ${item.danger ? 'text-red-200' : 'text-gray-300'}`}>{item.label}</span>
                                    </div>
                                    <button 
                                        onClick={() => handleToggle(item.id)}
                                        className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${item.active ? (item.danger ? 'bg-red-600' : 'bg-green-600') : 'bg-gray-700'}`}
                                    >
                                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white shadow transition-all duration-300 ${item.active ? 'left-6' : 'left-1'}`}></div>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* LIVE METRICS CARD */}
                    <div className="bg-[#0F0F23]/80 backdrop-blur-md border-l-4 border-amber-600 rounded-r-xl shadow-lg">
                        <div className="bg-gradient-to-r from-amber-900/30 to-transparent p-4 border-b border-white/5">
                            <h3 className="font-cinzel font-bold text-amber-100 flex items-center gap-2">
                                <span className="text-amber-500">📊</span> Vital Signs
                            </h3>
                        </div>
                        <div className="p-4 grid grid-cols-2 gap-3">
                            <div className="bg-black/40 p-3 rounded border border-white/5 text-center">
                                <div className="text-2xl font-bold text-blue-400 font-mono">{db.users?.length || 0}</div>
                                <div className="text-[9px] uppercase text-gray-500 tracking-widest mt-1">Users</div>
                            </div>
                            <div className="bg-black/40 p-3 rounded border border-white/5 text-center">
                                <div className="text-2xl font-bold text-green-400 font-mono">
                                    ₹{db.transactions?.reduce((acc: any, t: any) => acc + (t.amount || 0), 0).toLocaleString() || 0}
                                </div>
                                <div className="text-[9px] uppercase text-gray-500 tracking-widest mt-1">Revenue</div>
                            </div>
                            <div className="bg-black/40 p-3 rounded border border-white/5 text-center col-span-2 flex justify-between items-center px-6">
                                <div className="text-left">
                                    <div className="text-xl font-bold text-purple-400 font-mono">{db.readings?.length || 0}</div>
                                    <div className="text-[9px] uppercase text-gray-500 tracking-widest">Readings</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xl font-bold text-amber-400 font-mono">{db.feedback?.length || 0}</div>
                                    <div className="text-[9px] uppercase text-gray-500 tracking-widest">Feedback</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT CONTENT: DATABASE GRID */}
                <div className="lg:col-span-3">
                    <div className="bg-[#0F0F23]/60 backdrop-blur-xl border border-amber-500/10 rounded-xl p-1">
                        <div className="p-6 border-b border-white/5 flex justify-between items-end">
                            <div>
                                <h2 className="text-2xl font-cinzel font-bold text-amber-50">Master Ledger</h2>
                                <p className="text-xs text-gray-400 font-mono mt-1">Direct Database Access (SQLite V3)</p>
                            </div>
                            <div className="hidden sm:block">
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-900/20 border border-green-500/30 text-green-400 text-xs font-bold">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                    System Online
                                </span>
                            </div>
                        </div>

                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                            {tableNames.map(tableName => {
                                const meta = getTableMeta(tableName);
                                const recordCount = db[tableName]?.length || 0;
                                const activeCount = db[tableName]?.filter((r:any) => r.status === 'active').length || 0;

                                return (
                                    <Link 
                                        key={tableName} 
                                        to={`/admin/db/${tableName}`}
                                        className={`
                                            group relative overflow-hidden rounded-xl border ${meta.border} bg-[#13132b] 
                                            hover:bg-gradient-to-br hover:from-[#1a1a3a] hover:to-[#251010] 
                                            transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
                                        `}
                                    >
                                        {/* Background Glow */}
                                        <div className={`absolute -top-10 -right-10 w-24 h-24 ${meta.bg} rounded-full blur-2xl group-hover:blur-3xl transition-all opacity-50`}></div>

                                        <div className="p-5 relative z-10">
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="text-3xl filter drop-shadow-md group-hover:scale-110 transition-transform duration-300">
                                                    {meta.icon}
                                                </span>
                                                <span className={`font-mono text-xl font-bold ${meta.color}`}>
                                                    {recordCount}
                                                </span>
                                            </div>
                                            
                                            <h4 className="font-cinzel font-bold text-gray-200 capitalize text-sm truncate group-hover:text-amber-100 mb-2">
                                                {tableName.replace(/_/g, ' ')}
                                            </h4>
                                            
                                            <div className="flex items-center gap-2">
                                                <div className="flex-grow h-1 bg-gray-800 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full ${meta.bg.replace('/20', '')} bg-current opacity-70`} 
                                                        style={{ width: `${(activeCount / (recordCount || 1)) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-[9px] text-gray-500 font-mono">{activeCount} Active</span>
                                            </div>
                                        </div>
                                        
                                        {/* Hover Action Strip */}
                                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
  );
};

export default AdminConfig;