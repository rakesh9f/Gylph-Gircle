
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from './shared/Card';
import Button from './shared/Button';
import { sqliteService } from '../services/sqliteService';
import { useDb } from '../hooks/useDb';

const BackupManager: React.FC = () => {
  const [lastBackup, setLastBackup] = useState<string | null>(
    localStorage.getItem('glyph_last_backup_time')
  );
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState('');
  const { refresh } = useDb();

  // 1. BACKUP: Download JSON from SQLite
  const handleBackup = () => {
    try {
      const data = sqliteService.exportAllData();
      const jsonStr = JSON.stringify(data, null, 2);
      
      if (jsonStr === '{}') {
        alert("Database is empty or failed to export.");
        return;
      }

      // Create blob
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create link and click
      const a = document.createElement('a');
      a.href = url;
      const date = new Date().toISOString().split('T')[0];
      a.download = `glyph-circle-backup-${date}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Update state
      const now = new Date().toLocaleString();
      localStorage.setItem('glyph_last_backup_time', now);
      setLastBackup(now);

    } catch (e) {
      console.error("Backup failed", e);
      alert("Backup Failed: " + (e as Error).message);
    }
  };

  // 2. CSV EXPORT (Table Specific)
  const handleExportCSV = (tableName: string) => {
      try {
          const data = sqliteService.getAll(tableName);
          if (data.length === 0) {
              alert(`No records in ${tableName} to export.`);
              return;
          }

          const headers = Object.keys(data[0]).join(',');
          const rows = data.map((obj: any) => 
            Object.values(obj).map(v => 
                typeof v === 'object' ? `"${JSON.stringify(v).replace(/"/g, '""')}"` : `"${v}"`
            ).join(',')
          );
          const csvContent = [headers, ...rows].join('\n');

          const blob = new Blob([csvContent], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `glyph-${tableName}-${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);

      } catch (e) {
          alert("CSV Export Failed");
      }
  };

  // 3. RESTORE: Import JSON to SQLite
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!window.confirm("WARNING: This will OVERWRITE your current database with the backup file. Are you sure?")) {
          event.target.value = ''; // Reset input
          return;
      }

      setIsRestoring(true);
      setRestoreStatus('Reading file...');

      const reader = new FileReader();
      reader.onload = async (e) => {
          try {
              const content = e.target?.result as string;
              const parsed = JSON.parse(content);
              
              // Basic validation: check if it looks like a DB dump (keys should be table names, values arrays)
              const tables = Object.keys(parsed);
              if (tables.length === 0 || !Array.isArray(parsed[tables[0]])) {
                  throw new Error("Invalid backup format");
              }

              setRestoreStatus('Restoring Database...');
              
              // Perform Restore via Service
              await new Promise(r => setTimeout(r, 500)); // UI Breath
              sqliteService.importFromJson(parsed);
              
              // Refresh Context
              refresh();

              setRestoreStatus('Success! Reloading...');
              setTimeout(() => window.location.reload(), 1500);

          } catch (err: any) {
              setRestoreStatus('Error: Invalid File');
              alert("Restore Failed: " + err.message);
              setIsRestoring(false);
          }
      };
      reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6 font-mono text-gray-300">
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Disaster Recovery</h1>
                    <p className="text-sm text-gray-500">Backup and Restore System Database</p>
                </div>
                <Link to="/admin/dashboard" className="text-blue-400 hover:text-blue-300">&larr; Dashboard</Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* BACKUP CARD */}
                <Card className="bg-gray-800 border-gray-700 p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <span>⬇️</span> Export Data
                    </h3>
                    <p className="text-sm text-gray-400 mb-6">
                        Download a complete JSON snapshot of all database tables. Keep this file secure.
                    </p>
                    
                    <div className="bg-black/30 p-4 rounded border border-gray-700 text-xs mb-6">
                        <p className="text-gray-500 mb-1 uppercase tracking-widest">Last Backup</p>
                        <p className="text-green-400 font-mono text-base">{lastBackup || 'Never'}</p>
                    </div>

                    <Button onClick={handleBackup} className="w-full bg-blue-600 hover:bg-blue-500 border-none">
                        Download Full Backup (.json)
                    </Button>

                    <div className="mt-6 pt-6 border-t border-gray-700">
                        <p className="text-xs text-gray-500 mb-3 uppercase tracking-widest">Quick CSV Exports</p>
                        <div className="flex gap-2">
                            <button onClick={() => handleExportCSV('users')} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-xs">Users</button>
                            <button onClick={() => handleExportCSV('store_orders')} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-xs">Orders</button>
                            <button onClick={() => handleExportCSV('transactions')} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-xs">Transactions</button>
                        </div>
                    </div>
                </Card>

                {/* RESTORE CARD */}
                <Card className="bg-gray-800 border-red-900/30 p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full blur-2xl -z-10"></div>
                    
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <span>⬆️</span> Restore Data
                    </h3>
                    <p className="text-sm text-gray-400 mb-6">
                        Upload a previously generated backup JSON file. <strong className="text-red-400">This will replace all current data.</strong>
                    </p>

                    <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:bg-gray-700/30 transition-colors relative">
                        <input 
                            type="file" 
                            accept=".json"
                            onChange={handleFileSelect}
                            disabled={isRestoring}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        />
                        <div className="text-4xl mb-2">📂</div>
                        <p className="text-sm font-bold text-gray-300">
                            {isRestoring ? restoreStatus : 'Click to Upload Backup File'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">.json files only</p>
                    </div>

                    {isRestoring && (
                        <div className="mt-4">
                            <div className="w-full bg-gray-900 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full animate-pulse w-full"></div>
                            </div>
                            <p className="text-center text-xs text-green-400 mt-2 font-mono">{restoreStatus}</p>
                        </div>
                    )}
                </Card>

            </div>
        </div>
    </div>
  );
};

export default BackupManager;
