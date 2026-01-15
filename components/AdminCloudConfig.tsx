
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from './shared/Card';
import Button from './shared/Button';
import { cloudManager, CloudProvider } from '../services/cloudManager';

const PROVIDER_OPTIONS = ['Google Drive', 'Dropbox', 'AWS S3', 'Firebase Storage'];

const AdminCloudConfig: React.FC = () => {
  const [providers, setProviders] = useState<CloudProvider[]>([]);
  const [formData, setFormData] = useState<Partial<CloudProvider>>({ provider: 'Google Drive' });
  const [isEditing, setIsEditing] = useState(false);
  const [testStatus, setTestStatus] = useState<{ success?: boolean; message?: string }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    refreshList();
  }, []);

  const refreshList = () => {
    const list = cloudManager.getAllProviders().filter(p => p.status === 'active');
    setProviders(list);
  };

  const handleEdit = (provider: CloudProvider) => {
    setFormData(provider);
    setIsEditing(true);
    setTestStatus({});
  };

  const handleCreate = () => {
    setFormData({ provider: 'Google Drive', is_active: false });
    setIsEditing(true);
    setTestStatus({});
  };

  const handleSave = () => {
    if (!formData.name || !formData.api_key) {
        alert("Name and API Key are required");
        return;
    }
    cloudManager.saveProvider(formData as any);
    setIsEditing(false);
    refreshList();
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to remove this provider configuration?")) {
        cloudManager.deleteProvider(id);
        refreshList();
    }
  };

  const handleActivate = (id: string) => {
    cloudManager.activateProvider(id);
    refreshList();
  };

  const handleTestConnection = async () => {
    setLoading(true);
    const res = await cloudManager.testConnection(formData);
    setTestStatus(res);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6 font-mono text-gray-300">
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Cloud Storage Manager</h1>
                    <p className="text-sm text-gray-500">Configure remote asset sources. Zero-auth delivery.</p>
                </div>
                <Link to="/admin/dashboard" className="text-blue-400 hover:text-blue-300">&larr; Dashboard</Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LIST PANEL */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-200">Configured Drives</h3>
                        <button onClick={handleCreate} className="bg-green-700 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-bold">+ NEW</button>
                    </div>
                    
                    <div className="space-y-3">
                        {providers.map(p => (
                            <div 
                                key={p.id} 
                                onClick={() => handleEdit(p)}
                                className={`p-4 rounded-lg border cursor-pointer transition-all ${p.id === formData.id ? 'bg-gray-800 border-blue-500 ring-1 ring-blue-500' : 'bg-gray-800/50 border-gray-700 hover:bg-gray-800'}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${p.provider === 'Google Drive' ? 'bg-green-900 text-green-300' : p.provider === 'Dropbox' ? 'bg-blue-900 text-blue-300' : 'bg-orange-900 text-orange-300'}`}>
                                        {p.provider}
                                    </span>
                                    {p.is_active && (
                                        <span className="flex items-center gap-1 text-[10px] text-green-400 font-bold bg-green-900/30 px-2 py-0.5 rounded-full border border-green-600">
                                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                                            ACTIVE
                                        </span>
                                    )}
                                </div>
                                <h4 className="font-bold text-white truncate">{p.name}</h4>
                                <p className="text-xs text-gray-500 truncate mt-1">ID: {p.id}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* EDITOR PANEL */}
                <Card className="lg:col-span-2 bg-gray-800 border-gray-700 p-6">
                    {isEditing ? (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center border-b border-gray-700 pb-4">
                                <h3 className="text-xl font-bold text-white">{formData.id ? 'Edit Provider' : 'New Connection'}</h3>
                                {formData.id && (
                                    <div className="flex gap-2">
                                        {!formData.is_active && (
                                            <button 
                                                onClick={() => handleActivate(formData.id!)}
                                                className="bg-gray-700 hover:bg-green-800 text-white px-3 py-1 rounded text-xs border border-gray-600 hover:border-green-500 transition-colors"
                                            >
                                                Set Active
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => handleDelete(formData.id!)}
                                            className="text-red-400 hover:text-red-300 text-xs px-3"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs uppercase text-gray-500 mb-1">Provider Type</label>
                                    <select 
                                        className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-blue-500 outline-none"
                                        value={formData.provider}
                                        onChange={e => setFormData({...formData, provider: e.target.value as any})}
                                    >
                                        {PROVIDER_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs uppercase text-gray-500 mb-1">Friendly Name</label>
                                    <input 
                                        className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-blue-500 outline-none"
                                        placeholder="e.g. Production Assets"
                                        value={formData.name || ''}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs uppercase text-gray-500 mb-1">API Key / Access Token</label>
                                    <input 
                                        type="password"
                                        className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-blue-500 outline-none font-mono text-sm"
                                        placeholder="**************************"
                                        value={formData.api_key || ''}
                                        onChange={e => setFormData({...formData, api_key: e.target.value})}
                                    />
                                </div>

                                {formData.provider === 'AWS S3' ? (
                                    <>
                                        <div>
                                            <label className="block text-xs uppercase text-gray-500 mb-1">Bucket Name</label>
                                            <input 
                                                className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-blue-500 outline-none"
                                                value={formData.bucket_name || ''}
                                                onChange={e => setFormData({...formData, bucket_name: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs uppercase text-gray-500 mb-1">Region</label>
                                            <input 
                                                className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-blue-500 outline-none"
                                                placeholder="e.g. us-east-1"
                                                value={formData.region || ''}
                                                onChange={e => setFormData({...formData, region: e.target.value})}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <div className="md:col-span-2">
                                        <label className="block text-xs uppercase text-gray-500 mb-1">Root Folder ID</label>
                                        <input 
                                            className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-blue-500 outline-none font-mono"
                                            placeholder="Folder ID from URL"
                                            value={formData.folder_id || ''}
                                            onChange={e => setFormData({...formData, folder_id: e.target.value})}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Test & Status Area */}
                            <div className="bg-black/30 p-4 rounded border border-gray-700">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-sm font-bold text-gray-300">Connection Status</h4>
                                    <button 
                                        onClick={handleTestConnection}
                                        disabled={loading}
                                        className="text-xs bg-blue-900/50 hover:bg-blue-800 text-blue-300 px-3 py-1 rounded border border-blue-800 transition-colors"
                                    >
                                        {loading ? 'Connecting...' : 'Test Connection'}
                                    </button>
                                </div>
                                {testStatus.message && (
                                    <div className={`text-xs p-2 rounded ${testStatus.success ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'}`}>
                                        {testStatus.success ? '✅' : '❌'} {testStatus.message}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-gray-700">
                                <Button onClick={handleSave} className="flex-1 bg-green-700 hover:bg-green-600">
                                    Save Configuration
                                </Button>
                                <button 
                                    onClick={() => setIsEditing(false)}
                                    className="px-6 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white font-bold"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <p>Select a provider to configure</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    </div>
  );
};

export default AdminCloudConfig;
