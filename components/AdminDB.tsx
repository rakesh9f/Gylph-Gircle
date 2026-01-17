
import React, { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useDb } from '../hooks/useDb';
import Card from './shared/Card';
import Modal from './shared/Modal';
import Button from './shared/Button';
import { cloudManager } from '../services/cloudManager';

const AdminDB: React.FC = () => {
  const { table } = useParams<{ table: string }>();
  const [searchParams] = useSearchParams(); 
  const { db, toggleStatus, createEntry, updateEntry, refresh } = useDb();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | number | null>(null);

  const tableName = table || 'users';
  const data = db[tableName] || [];

  useEffect(() => {
      refresh();
  }, [tableName, refresh]);

  useEffect(() => {
      if (searchParams.get('create') === 'true') {
          setIsCreateModalOpen(true);
          setFormData({});
      }
  }, [searchParams]);

  const filteredData = data.filter((record: any) => 
    JSON.stringify(record).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const headers: string[] = data.length > 0 
    ? Array.from(new Set(data.flatMap((record: any) => Object.keys(record))))
    : ['id', 'status', 'name', 'image', 'description']; 

  const systemFields = ['created_at'];

  const handleFormChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const openCreateModal = () => {
      setFormData({});
      setIsCreateModalOpen(true);
  };

  const submitCreate = () => {
      createEntry(tableName, formData);
      setIsCreateModalOpen(false);
      setFormData({});
  };

  const openEditModal = (record: any) => {
      const editableData: Record<string, string> = {};
      Object.keys(record).forEach(key => {
          if (!systemFields.includes(key)) {
              const val = record[key];
              editableData[key] = typeof val === 'object' ? JSON.stringify(val) : String(val);
          }
      });
      setFormData(editableData);
      setEditingId(record.id);
      setIsEditModalOpen(true);
  };

  const submitEdit = () => {
      if (editingId) {
          updateEntry(tableName, editingId, formData);
          setIsEditModalOpen(false);
          setEditingId(null);
          setFormData({});
      }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6 font-mono text-sm text-gray-300">
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-4">
                    <Link to="/admin/config" className="text-blue-400 hover:underline">&larr; Back to Panel</Link>
                    <h1 className="text-2xl font-bold text-white capitalize">{tableName.replace(/_/g, ' ')}</h1>
                    <span className="bg-green-900 text-green-200 px-2 py-1 rounded text-xs">Supabase Live</span>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-gray-800 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500 flex-grow"
                    />
                    <button 
                        onClick={openCreateModal}
                        className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded shadow-lg transition-colors"
                    >
                        + New Entry
                    </button>
                </div>
            </div>

            <Card className="bg-gray-800 border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-700 text-gray-200">
                                {headers.map(h => (
                                    <th key={h} className="p-3 border-b border-gray-600 font-bold uppercase text-xs whitespace-nowrap">{h}</th>
                                ))}
                                <th className="p-3 border-b border-gray-600 text-right sticky right-0 bg-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((row: any, i: number) => (
                                <tr key={i} className="hover:bg-gray-700/50 border-b border-gray-700 last:border-0 transition-colors">
                                    {headers.map(h => (
                                        <td key={h} className="p-3 text-xs truncate max-w-[200px]" title={String(row[h])}>
                                            {(h.includes('image') || h.includes('url') || String(row[h]).startsWith('http')) ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    {h.includes('image') && (
                                                        <img 
                                                            src={cloudManager.resolveImage(String(row[h]))} 
                                                            alt="preview" 
                                                            className="w-8 h-8 object-cover object-center rounded bg-black"
                                                            referrerPolicy="no-referrer"
                                                        />
                                                    )}
                                                    <a href={cloudManager.resolveImage(String(row[h]))} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Link</a>
                                                </div>
                                            ) : (
                                                typeof row[h] === 'object' ? JSON.stringify(row[h]) : String(row[h])
                                            )}
                                        </td>
                                    ))}
                                    <td className="p-3 text-right sticky right-0 bg-gray-800/50 backdrop-blur-sm flex gap-2 justify-end">
                                        <button 
                                            onClick={() => openEditModal(row)}
                                            className="px-2 py-1 rounded text-xs font-bold bg-blue-900 text-blue-300 hover:bg-blue-800 border border-blue-700"
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            onClick={() => toggleStatus(tableName, row.id)}
                                            className={`px-2 py-1 rounded text-xs font-bold transition-colors ${row.status === 'active' ? 'bg-green-900 text-green-300 hover:bg-green-800 border border-green-700' : 'bg-red-900 text-red-300 hover:bg-red-800 border border-red-700'}`}
                                        >
                                            {row.status === 'active' ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredData.length === 0 && (
                                <tr>
                                    <td colSpan={headers.length + 1} className="p-8 text-center text-gray-500">
                                        No records found in DB.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>

        {/* Create Entry Modal */}
        <Modal isVisible={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
            <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2">Add New Record</h3>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {headers.filter(h => !systemFields.includes(h)).map(key => (
                        <div key={key}>
                            <label className="block text-gray-400 text-xs uppercase mb-1">{key}</label>
                            {key === 'status' ? (
                                <select 
                                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-blue-500"
                                    value={formData[key] || 'active'}
                                    onChange={e => handleFormChange(key, e.target.value)}
                                >
                                    <option value="active">active</option>
                                    <option value="inactive">inactive</option>
                                </select>
                            ) : (
                                <input 
                                    type="text" 
                                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-blue-500"
                                    placeholder={key === 'id' ? 'Leave empty for auto-gen' : `Enter ${key}`}
                                    value={formData[key] || ''}
                                    onChange={e => handleFormChange(key, e.target.value)}
                                />
                            )}
                        </div>
                    ))}
                </div>
                <div className="mt-6 flex gap-3">
                    <Button onClick={submitCreate} className="flex-1 bg-green-700 hover:bg-green-600">Create</Button>
                    <button 
                        onClick={() => setIsCreateModalOpen(false)}
                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white rounded font-bold"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </Modal>

        {/* Edit Entry Modal */}
        <Modal isVisible={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
            <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2">Edit Record</h3>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {Object.keys(formData).map(key => (
                        <div key={key}>
                            <label className="block text-gray-400 text-xs uppercase mb-1">{key}</label>
                            {key === 'status' ? (
                                <select 
                                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-blue-500"
                                    value={formData[key]}
                                    onChange={e => handleFormChange(key, e.target.value)}
                                >
                                    <option value="active">active</option>
                                    <option value="inactive">inactive</option>
                                </select>
                            ) : (
                                <input 
                                    type="text" 
                                    disabled={key === 'id'} 
                                    className={`w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-blue-500 ${key === 'id' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    placeholder={`Enter ${key}`}
                                    value={formData[key]}
                                    onChange={e => handleFormChange(key, e.target.value)}
                                />
                            )}
                        </div>
                    ))}
                </div>
                <div className="mt-6 flex gap-3">
                    <Button onClick={submitEdit} className="flex-1 bg-blue-700 hover:bg-blue-600">Save Changes</Button>
                    <button 
                        onClick={() => setIsEditModalOpen(false)}
                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white rounded font-bold"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </Modal>
    </div>
  );
};

export default AdminDB;
