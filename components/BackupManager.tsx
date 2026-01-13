
import React, { useState } from 'react';
import Card from './shared/Card';
import Button from './shared/Button';

// Keys used in localStorage for production data
const DB_KEY = 'gylph_circle_prod_db_v2';

const BackupManager: React.FC = () => {
  const [lastBackup, setLastBackup] = useState<string | null>(
    localStorage.getItem('glyph_last_backup_time')
  );
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState('');

  // 1. BACKUP: Download JSON
  const handleBackup = () => {
    try {
      const data = localStorage.getItem(DB_KEY);
      if (!data) {
        alert("No production data found to backup.");
        return;
      }

      // Create blob
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create link and click
      const a = document.createElement('a');
      a.href = url;
      const date = new Date().toISOString().split('T')[0];
      a.download = `glyph-backup-${date}.json`;
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

  // 2. CSV EXPORT
  const handleExportCSV = (type: 'users' | 'transactions') => {
      try {
          const raw = localStorage.getItem(DB_KEY);
          if (!raw) return;
          const db = JSON.parse(raw);
          const items = db[type] || [];

          if (items.length === 0) {
              alert(`No ${type} found to export.`);
              return;
          }

          const headers = Object.keys(items[0]).join(',');
          const rows = items.map((obj: any) => Object.values(obj).map(v => `"${v}"`).join(','));
          const csvContent = [headers, ...rows].join('\n');

          const blob = new Blob([csvContent], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `glyph-${type}-${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);

      } catch (e) {
          alert("CSV Export Failed");
      }
  };

  // 3. RESTORE: Import JSON
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setIsRestoring(true);
      setRestoreStatus('Reading file...');

      const reader = new FileReader();
      reader.onload = (e) => {
          try {
              const content = e.target?.result as string;
              // Validation check
              const parsed = JSON.parse(content);
              if (!parsed.users || !parsed.readings) {
                  throw new Error("Invalid backup file format");
              }

              // Perform Restore
              localStorage.setItem(DB_KEY, content);
              setRestoreStatus('Success! Reloading...');
              setTimeout(() => window.location.reload(), 1500);

          } catch (err) {
              setRestoreStatus('Error: Invalid File');
              alert("Restore Failed: Invalid JSON format.");
              setIsRestoring(false);
          }
      };
      reader.readAsText(file);
  };

  return (
    <Card className="bg-gray-900 border-gray-800 h-full">
        <div className="p-6 flex flex-col h-full">
            <h3 className="text-lg font-bold text-gray-300 mb-4 border-b border-gray-800 pb-2 flex items-center gap-2">
                <span>💾</span> Backup & Recovery
            </h3>

            <div className="flex-grow space-y-6">
                {/* Status */}
                <div className="bg-black/40 p-3 rounded border border-gray-700 text-xs">
                    <p className="text-gray-500 mb-1">LAST BACKUP</p>
                    <p className="text-green-400 font-mono">{lastBackup || 'Never'}</p>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <Button onClick={handleBackup} className="w-full bg-blue-900/30 hover:bg-blue-800/50 border-blue-500/50 text-blue-300 text-sm">
                        ⬇️ Download Full Backup
                    </Button>
                    
                    <div className="grid grid-cols-2 gap-2">
                        <button 
                            onClick={() => handleExportCSV('users')}
                            className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs py-2 px-1 rounded border border-gray-600"
                        >
                            Export Users CSV
                        </button>
                        <button 
                            onClick={() => handleExportCSV('transactions')}
                            className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs py-2 px-1 rounded border border-gray-600"
                        >
                            Export Sales CSV
                        </button>
                    </div>
                </div>

                {/* Restore Zone */}
                <div className="border-t border-gray-800 pt-4">
                     <p className="text-gray-500 text-xs mb-2 uppercase">Danger Zone: Restore</p>
                     <div className="relative">
                        <input 
                            type="file" 
                            accept=".json"
                            onChange={handleFileSelect}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <button className="w-full bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/50 rounded py-2 text-sm dashed">
                            {isRestoring ? restoreStatus : '⬆️ Upload Backup File'}
                        </button>
                     </div>
                     <p className="text-[10px] text-gray-600 mt-2 text-center">
                         Overwrites current database immediately.
                     </p>
                </div>
            </div>
        </div>
    </Card>
  );
};

export default BackupManager;
