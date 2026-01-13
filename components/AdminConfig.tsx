import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDb } from '../hooks/useDb';
import Card from './shared/Card';
import Button from './shared/Button';
import Modal from './shared/Modal';
import { useTranslation } from '../hooks/useTranslation';

const AdminConfig: React.FC = () => {
  const { db, toggleStatus, createEntry } = useDb();
  const [selectedTable, setSelectedTable] = useState<string>(Object.keys(db)[0] || '');
  const [newEntry, setNewEntry] = useState<Record<string, string>>({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useTranslation();

  const handleNewEntryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewEntry({ ...newEntry, [e.target.name]: e.target.value });
  };
  
  const handleCreateEntry = (tableName: string) => {
    if (Object.keys(newEntry).length === 0) return;
    createEntry(tableName, newEntry);
    setNewEntry({});
    setIsCreateModalOpen(false);
  };

  const formattedTableName = (tableName: string) => tableName.replace(/_/g, ' ');

  // Filter functionality
  const filteredData = useMemo(() => {
    if (!selectedTable || !db[selectedTable]) return [];
    if (!searchTerm) return db[selectedTable];
    
    return db[selectedTable].filter(record => 
      Object.values(record).some(val => 
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [db, selectedTable, searchTerm]);

  const renderCreateModal = (tableName: string) => {
    const tableData = db[tableName];
    const keys = tableData && tableData.length > 0 ? Object.keys(tableData[0]) : [];
    
    if (keys.length === 0) return null;

    const cleanTableName = formattedTableName(tableName);

    return (
        <Modal isVisible={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
            <div className="p-6 bg-gray-900 rounded-xl border border-amber-500/30 shadow-2xl">
                <div className="text-center mb-6">
                    <h3 className="text-2xl font-cinzel font-bold text-amber-400 capitalize">
                        {t('createEntryIn', { tableName: cleanTableName })}
                    </h3>
                    <div className="h-0.5 w-16 bg-amber-500/50 mx-auto mt-2"></div>
                </div>
                
                <div className="grid grid-cols-1 gap-4 max-h-[60vh] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-amber-900/50 [&::-webkit-scrollbar-thumb]:rounded-full">
                     {keys.filter(h => h !== 'id' && h !== 'status').map(header => (
                        <div key={`new-${header}`}>
                            <label className="text-xs font-bold text-amber-200/80 block mb-1 uppercase tracking-wide">{formattedTableName(header)}</label>
                            <input
                                type={header.includes('price') || header.includes('value') || header.includes('stock') ? 'number' : 'text'}
                                name={header}
                                value={newEntry[header] || ''}
                                onChange={handleNewEntryChange}
                                className="w-full p-3 bg-black/40 border border-amber-500/20 rounded-lg text-amber-50 text-sm focus:ring-1 focus:ring-amber-400 focus:border-amber-400 focus:outline-none transition-all"
                                placeholder={`Enter ${formattedTableName(header)}...`}
                            />
                        </div>
                    ))}
                </div>
                <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-amber-500/20">
                    <button 
                        onClick={() => setIsCreateModalOpen(false)} 
                        className="px-4 py-2 rounded-lg text-amber-200 hover:text-white hover:bg-white/10 transition-colors font-semibold text-sm"
                    >
                        {t('cancel')}
                    </button>
                    <Button onClick={() => handleCreateEntry(tableName)} className="py-2 px-6 text-sm">
                        {t('create')}
                    </Button>
                </div>
            </div>
        </Modal>
    );
  };

  const renderTable = (tableName: string) => {
    const tableData = filteredData;
    const cleanTableName = formattedTableName(tableName);
    const headers = tableData.length > 0 ? Object.keys(tableData[0]) : (db[tableName]?.[0] ? Object.keys(db[tableName][0]) : []);

    return (
        <div className="flex flex-col h-full">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h3 className="text-3xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-100 capitalize">
                        {cleanTableName}
                    </h3>
                    <p className="text-amber-200/60 text-sm mt-1">Manage your {cleanTableName} records</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                     <div className="relative flex-grow sm:flex-grow-0">
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-64 pl-10 pr-4 py-2 bg-black/30 border border-amber-500/20 rounded-lg text-sm text-amber-100 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all placeholder-amber-500/30"
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-3 text-amber-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                     </div>
                     <Button 
                        onClick={() => {
                            setNewEntry({});
                            setIsCreateModalOpen(true);
                        }}
                        className="py-2 px-4 text-sm whitespace-nowrap"
                    >
                        <span className="hidden sm:inline">{t('createNewEntry')}</span>
                        <span className="sm:hidden">+</span>
                    </Button>
                </div>
            </div>

            {tableData.length === 0 ? (
                 <div className="flex-grow flex flex-col items-center justify-center bg-black/20 rounded-xl border border-dashed border-amber-500/20 p-12">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-amber-500/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-amber-200/50">{t('noEntries')}</p>
                 </div>
            ) : (
                <div className="bg-black/30 backdrop-blur-sm border border-amber-500/20 rounded-xl overflow-hidden shadow-xl flex-grow flex flex-col">
                    <div className="overflow-x-auto flex-grow [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-amber-900/50 [&::-webkit-scrollbar-thumb]:rounded-full">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-maroon-900/40 text-amber-200/90 font-cinzel uppercase tracking-wider sticky top-0 z-10 backdrop-blur-md">
                                <tr>
                                    {headers.map(header => (
                                        <th key={header} className="p-4 font-semibold border-b border-amber-500/30">
                                            {formattedTableName(header)}
                                        </th>
                                    ))}
                                    <th className="p-4 text-right border-b border-amber-500/30">{t('actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-amber-500/10">
                                {tableData.map((record, idx) => (
                                    <tr key={record.id} className={`hover:bg-amber-900/10 transition-colors ${idx % 2 === 0 ? 'bg-transparent' : 'bg-black/10'}`}>
                                        {headers.map(header => (
                                            <td key={`${record.id}-${header}`} className="p-4 text-amber-50/80">
                                                {header === 'status' ? (
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                                        record.status === 'active' 
                                                            ? 'bg-green-900/30 text-green-300 border-green-500/30' 
                                                            : 'bg-red-900/30 text-red-300 border-red-500/30'
                                                    }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${record.status === 'active' ? 'bg-green-400' : 'bg-red-400'}`}></span>
                                                        {record.status}
                                                    </span>
                                                ) : (
                                                    <div className="max-w-xs truncate" title={String(record[header])}>
                                                        {String(record[header])}
                                                    </div>
                                                )}
                                            </td>
                                        ))}
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => toggleStatus(tableName, record.id)}
                                                className={`text-xs px-3 py-1.5 rounded border transition-colors ${
                                                    record.status === 'active'
                                                    ? 'border-red-500/30 text-red-300 hover:bg-red-900/20'
                                                    : 'border-green-500/30 text-green-300 hover:bg-green-900/20'
                                                }`}
                                            >
                                                {t('toggleStatus')}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-3 bg-black/40 border-t border-amber-500/20 text-xs text-amber-200/40 flex justify-between">
                         <span>Showing {tableData.length} entries</span>
                    </div>
                </div>
            )}
        </div>
    );
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/4 flex flex-col">
            <Link to="/" className="inline-flex items-center text-amber-200 hover:text-amber-400 transition-colors mb-6 group w-fit">
                <div className="w-8 h-8 rounded-full bg-amber-900/30 border border-amber-500/30 flex items-center justify-center mr-3 group-hover:border-amber-400 transition-colors">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </div>
                <span className="font-cinzel font-bold tracking-wide">{t('backToDashboard')}</span>
            </Link>

            <Card className="flex-grow flex flex-col overflow-hidden bg-gradient-to-b from-gray-900/90 to-gray-800/90 backdrop-blur-xl border-amber-500/20">
                <div className="p-5 border-b border-amber-500/20 bg-black/20">
                    <h2 className="text-xl font-cinzel font-bold text-amber-300 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                        </svg>
                        Database Tables
                    </h2>
                </div>
                <div className="overflow-y-auto p-3 space-y-1 flex-grow [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-amber-900/50 [&::-webkit-scrollbar-thumb]:rounded-full">
                     {Object.keys(db).map(tableName => (
                        <button
                            key={tableName}
                            onClick={() => { setSelectedTable(tableName); setSearchTerm(''); }}
                            className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 flex items-center justify-between group ${
                                selectedTable === tableName 
                                ? 'bg-gradient-to-r from-maroon-700 to-maroon-800 text-amber-100 shadow-lg border border-amber-500/30' 
                                : 'text-amber-200/60 hover:bg-white/5 hover:text-amber-100'
                            }`}
                        >
                            <span className="capitalize font-medium">{formattedTableName(tableName)}</span>
                            {selectedTable === tableName && (
                                <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"></div>
                            )}
                        </button>
                     ))}
                </div>
            </Card>
        </div>
      
        <div className="lg:w-3/4 flex flex-col min-h-0">
             {selectedTable ? renderTable(selectedTable) : (
                 <div className="flex items-center justify-center h-full text-amber-200/40">Select a table to view data</div>
             )}
        </div>

        {selectedTable && renderCreateModal(selectedTable)}
    </div>
  );
};

export default AdminConfig;