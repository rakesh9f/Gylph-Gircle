
import React, { createContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { sqliteService } from '../services/sqliteService';
import { MOCK_DATABASE } from '../services/mockDb';

interface DbContextType {
  db: any; // Dynamic schema
  toggleStatus: (tableName: string, recordId: number | string) => void;
  createEntry: (tableName: string, newRecordData: Record<string, any>) => void;
  updateEntry: (tableName: string, id: number | string, updatedData: Record<string, any>) => void;
  refresh: () => void;
}

export const DbContext = createContext<DbContextType | undefined>(undefined);

export const DbProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dbState, setDbState] = useState<any>({});
  const [isReady, setIsReady] = useState(false);

  // Function to hydrate state from SQLite
  const refresh = useCallback(() => {
    // We map the flat SQL tables back into a nested object structure for the frontend
    const newState: any = {};
    const tables = Object.keys(MOCK_DATABASE);
    
    tables.forEach(table => {
        newState[table] = sqliteService.getAll(table);
    });
    
    setDbState(newState);
  }, []);

  // Initialize DB on mount
  useEffect(() => {
    const init = async () => {
        // Wait for SQL.js to load (simple poll if window.initSqlJs not ready yet)
        let attempts = 0;
        while (!window.initSqlJs && attempts < 20) {
            await new Promise(r => setTimeout(r, 200));
            attempts++;
        }

        await sqliteService.init();
        refresh();
        setIsReady(true);
    };
    init();
  }, [refresh]);

  const toggleStatus = useCallback(async (tableName: string, recordId: number | string) => {
    await sqliteService.toggleStatus(tableName, recordId);
    refresh();
  }, [refresh]);
  
  const createEntry = useCallback(async (tableName: string, newRecordData: Record<string, any>) => {
    const newRecord = {
        id: newRecordData.id || Date.now(), // Auto-gen ID if missing
        status: 'active',
        ...newRecordData
    };
    await sqliteService.insert(tableName, newRecord);
    refresh();
  }, [refresh]);

  const updateEntry = useCallback(async (tableName: string, id: number | string, updatedData: Record<string, any>) => {
    await sqliteService.update(tableName, id, updatedData);
    refresh();
  }, [refresh]);

  if (!isReady) {
      return (
          <div className="min-h-screen bg-gray-900 flex items-center justify-center">
              <div className="flex flex-col items-center">
                  <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-amber-200 font-cinzel text-sm animate-pulse">Initializing Sacred Archives...</p>
              </div>
          </div>
      );
  }

  return (
    <DbContext.Provider value={{ db: dbState, toggleStatus, createEntry, updateEntry, refresh }}>
      {children}
    </DbContext.Provider>
  );
};
