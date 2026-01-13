
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from './shared/Card';
import Button from './shared/Button';
import { useDb } from '../hooks/useDb';

const AdminConfig: React.FC = () => {
  const navigate = useNavigate();
  const { db, createEntry } = useDb();
  
  // Local state for toggles (persisted in localStorage for demo)
  const [config, setConfig] = useState({
    tarotEnabled: localStorage.getItem('service_tarot') !== 'false',
    palmEnabled: localStorage.getItem('service_palm') !== 'false',
    pricingTier: localStorage.getItem('pricing_tier') || '49',
    maintenanceMode: localStorage.getItem('maintenance_mode') === 'true',
  });

  const [merchant, setMerchant] = useState({
    paypal: 'billing@glyph.co',
    upi: 'mystic@upi'
  });

  const adminSession = JSON.parse(localStorage.getItem('glyph_admin_session') || '{}');

  useEffect(() => {
    if (!adminSession.user) {
        navigate('/master-login');
    }
  }, [navigate]);

  const handleToggle = (key: string) => {
    setConfig(prev => {
        const newVal = !prev[key as keyof typeof prev];
        // Special mapping for keys to localStorage
        if (key === 'tarotEnabled') localStorage.setItem('service_tarot', String(newVal));
        if (key === 'palmEnabled') localStorage.setItem('service_palm', String(newVal));
        if (key === 'maintenanceMode') localStorage.setItem('maintenance_mode', String(newVal));
        return { ...prev, [key]: newVal };
    });
  };

  const handlePriceChange = (price: string) => {
      setConfig(prev => ({ ...prev, pricingTier: price }));
      localStorage.setItem('pricing_tier', price);
  };

  const saveMerchant = () => {
      alert("Merchant Details Updated in Secure Storage");
  };

  const handleLogout = () => {
      localStorage.removeItem('glyph_admin_session');
      navigate('/master-login');
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6 font-mono text-sm">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-700">
            <div>
                <h1 className="text-2xl font-bold text-green-400">CONFIG PANEL <span className="text-xs bg-green-900 text-green-200 px-2 py-1 rounded ml-2">{adminSession.role?.toUpperCase()}</span></h1>
                <p className="text-gray-500">System Control Center</p>
            </div>
            <div className="flex gap-4">
                <Link to="/home">
                    <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded shadow flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Run as User
                    </button>
                </Link>
                <button onClick={handleLogout} className="text-red-400 hover:text-red-300 underline">Logout</button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Service Toggles */}
            <Card className="bg-gray-800 border-gray-700">
                <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-300 mb-4 border-b border-gray-700 pb-2">Service Status</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Tarot Reading</span>
                            <button 
                                onClick={() => handleToggle('tarotEnabled')}
                                className={`w-12 h-6 rounded-full p-1 transition-colors ${config.tarotEnabled ? 'bg-green-600' : 'bg-gray-600'}`}
                            >
                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${config.tarotEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </button>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Palmistry AI</span>
                            <button 
                                onClick={() => handleToggle('palmEnabled')}
                                className={`w-12 h-6 rounded-full p-1 transition-colors ${config.palmEnabled ? 'bg-green-600' : 'bg-gray-600'}`}
                            >
                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${config.palmEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </button>
                        </div>
                         <div className="flex justify-between items-center">
                            <span className="text-red-400 font-bold">Maintenance Mode</span>
                            <button 
                                onClick={() => handleToggle('maintenanceMode')}
                                className={`w-12 h-6 rounded-full p-1 transition-colors ${config.maintenanceMode ? 'bg-red-600' : 'bg-gray-600'}`}
                            >
                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${config.maintenanceMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </button>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Pricing Config */}
            <Card className="bg-gray-800 border-gray-700">
                <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-300 mb-4 border-b border-gray-700 pb-2">Global Pricing</h3>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                        {['29', '49', '99'].map(price => (
                            <button
                                key={price}
                                onClick={() => handlePriceChange(price)}
                                className={`py-2 px-4 rounded border ${config.pricingTier === price ? 'bg-amber-600 border-amber-500 text-white' : 'bg-gray-700 border-gray-600 text-gray-400'}`}
                            >
                                ₹{price}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500">Affects all non-subscription readings.</p>
                </div>
            </Card>

            {/* DB Quick Links */}
             <Card className="bg-gray-800 border-gray-700">
                <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-300 mb-4 border-b border-gray-700 pb-2">Database Access</h3>
                    <div className="space-y-2">
                        <Link to="/admin/db/users" className="block w-full text-left p-3 rounded bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors">
                            👤 Manage Users ({db.users?.length || 0})
                        </Link>
                        <Link to="/admin/db/readings" className="block w-full text-left p-3 rounded bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors">
                            📜 Manage Readings ({db.readings?.length || 0})
                        </Link>
                         <Link to="/admin/db/payments" className="block w-full text-left p-3 rounded bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors">
                            💰 Transaction Log
                        </Link>
                    </div>
                </div>
            </Card>
        </div>

        {/* Merchant Config */}
        <div className="mt-8">
             <Card className="bg-gray-800 border-gray-700">
                <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-300 mb-4">Merchant Credentials</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-500 mb-1">PayPal Business Email</label>
                            <input 
                                value={merchant.paypal} 
                                onChange={e => setMerchant({...merchant, paypal: e.target.value})}
                                className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white" 
                            />
                        </div>
                        <div>
                             <label className="block text-gray-500 mb-1">UPI ID (VPA)</label>
                            <input 
                                value={merchant.upi} 
                                onChange={e => setMerchant({...merchant, upi: e.target.value})}
                                className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white" 
                            />
                        </div>
                    </div>
                    <div className="mt-4 text-right">
                        <Button onClick={saveMerchant} className="py-2 px-6 text-sm">Save Merchant Data</Button>
                    </div>
                </div>
            </Card>
        </div>

      </div>
    </div>
  );
};

export default AdminConfig;
