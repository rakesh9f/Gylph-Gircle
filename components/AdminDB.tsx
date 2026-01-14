
import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDb } from '../hooks/useDb';
import Card from './shared/Card';
import Modal from './shared/Modal';
import Button from './shared/Button';

const AdminDB: React.FC = () => {
  const { table } = useParams<{ table: string }>();
  const { db, toggleStatus, createEntry } = useDb();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEntry, setNewEntry] = useState<Record<string, string>>({});

  const tableName = table || 'users';
  // Fallback to empty array if table doesn't exist to prevent crash
  const data = db[tableName as keyof typeof db] || [];

  const filteredData = data.filter(record => 
    JSON.stringify(record).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get all unique keys from data to form headers, fallback to basic if empty
  const headers = data.length > 0 
    ? Array.from(new Set(data.flatMap(Object.keys)))
    : ['id', 'status', 'name', 'description']; // Default schema guess

  // Fields to exclude from the Create Form
  const readOnlyFields = ['id', 'created_at'];

  const handleCreateChange = (key: string, value: string) => {
    setNewEntry(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmitCreate = () => {
      createEntry(tableName, newEntry);
      setIsModalOpen(false);
      setNewEntry({});
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6 font-mono text-sm text-gray-300">
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-4">
                    <Link to="/admin/config" className="text-blue-400 hover:underline">&larr; Back to Panel</Link>
                    <h1 className="text-2xl font-bold text-white capitalize">{tableName}</h1>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <input 
                        type="text" 
                        placeholder="Search records..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-gray-800 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500 flex-grow"
                    />
                    <button 
                        onClick={() => setIsModalOpen(true)}
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
                            {filteredData.map((row: any, i) => (
                                <tr key={i} className="hover:bg-gray-700/50 border-b border-gray-700 last:border-0 transition-colors">
                                    {headers.map(h => (
                                        <td key={h} className="p-3 text-xs truncate max-w-[200px]" title={String(row[h])}>
                                            {(h.includes('image') || h.includes('url') || String(row[h]).startsWith('http')) ? (
                                                <a 
                                                    href={String(row[h])} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="text-blue-400 hover:text-blue-300 underline flex items-center gap-1"
                                                >
                                                    <span className="text-lg">🔗</span> 
                                                    {h.includes('image') ? 'View Image' : 'Link'}
                                                </a>
                                            ) : (
                                                String(row[h])
                                            )}
                                        </td>
                                    ))}
                                    <td className="p-3 text-right sticky right-0 bg-gray-800/50 backdrop-blur-sm">
                                        <button 
                                            onClick={() => toggleStatus(tableName, row.id)}
                                            className={`px-3 py-1 rounded text-xs font-bold transition-colors ${row.status === 'active' ? 'bg-green-900 text-green-300 hover:bg-green-800' : 'bg-red-900 text-red-300 hover:bg-red-800'}`}
                                        >
                                            {row.status === 'active' ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredData.length === 0 && (
                                <tr>
                                    <td colSpan={headers.length + 1} className="p-8 text-center text-gray-500">
                                        No records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>

        {/* Create Entry Modal */}
        <Modal isVisible={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2">Add New Record</h3>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {headers.filter(h => !readOnlyFields.includes(h)).map(key => (
                        <div key={key}>
                            <label className="block text-gray-400 text-xs uppercase mb-1">{key}</label>
                            {key === 'status' ? (
                                <select 
                                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-blue-500"
                                    value={newEntry[key] || 'active'}
                                    onChange={e => handleCreateChange(key, e.target.value)}
                                >
                                    <option value="active">active</option>
                                    <option value="inactive">inactive</option>
                                </select>
                            ) : (
                                <input 
                                    type="text" 
                                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-blue-500"
                                    placeholder={`Enter ${key}`}
                                    value={newEntry[key] || ''}
                                    onChange={e => handleCreateChange(key, e.target.value)}
                                />
                            )}
                        </div>
                    ))}
                </div>
                <div className="mt-6 flex gap-3">
                    <Button onClick={handleSubmitCreate} className="flex-1 bg-green-700 hover:bg-green-600">Create</Button>
                    <button 
                        onClick={() => setIsModalOpen(false)}
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
