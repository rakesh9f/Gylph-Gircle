
import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDb } from '../hooks/useDb';
import Card from './shared/Card';

const AdminDB: React.FC = () => {
  const { table } = useParams<{ table: string }>();
  const { db, toggleStatus } = useDb();
  const [searchTerm, setSearchTerm] = useState('');

  const tableName = table || 'users';
  // Fallback to empty array if table doesn't exist to prevent crash
  const data = db[tableName as keyof typeof db] || [];

  const filteredData = data.filter(record => 
    JSON.stringify(record).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const headers = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <div className="min-h-screen bg-gray-900 p-6 font-mono text-sm text-gray-300">
        <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link to="/admin/config" className="text-blue-400 hover:underline">&larr; Back to Panel</Link>
                    <h1 className="text-2xl font-bold text-white capitalize">{tableName} Database</h1>
                </div>
                <input 
                    type="text" 
                    placeholder="Search records..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-gray-800 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
            </div>

            <Card className="bg-gray-800 border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-700 text-gray-200">
                                {headers.map(h => (
                                    <th key={h} className="p-3 border-b border-gray-600 font-bold uppercase text-xs">{h}</th>
                                ))}
                                <th className="p-3 border-b border-gray-600 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((row: any, i) => (
                                <tr key={i} className="hover:bg-gray-700/50 border-b border-gray-700 last:border-0">
                                    {headers.map(h => (
                                        <td key={h} className="p-3 text-xs truncate max-w-[200px]" title={String(row[h])}>
                                            {String(row[h])}
                                        </td>
                                    ))}
                                    <td className="p-3 text-right">
                                        <button 
                                            onClick={() => toggleStatus(tableName, row.id)}
                                            className={`px-2 py-1 rounded text-xs ${row.status === 'active' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}
                                        >
                                            {row.status === 'active' ? 'Disable' : 'Enable'}
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
    </div>
  );
};

export default AdminDB;
