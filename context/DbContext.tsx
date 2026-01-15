
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
    
    // Fallback if empty (first load latency)
    if (Object.keys(newState).length === 0) {
        setDbState(MOCK_DATABASE);
    } else {
        setDbState(newState);
    }
  }, []);

  // Initialize DB on mount
  useEffect(() => {
    const init = async () => {
        // Wait for SQL.js to load
        await new Promise(r => setTimeout(r, 1000)); 
        await sqliteService.init();
        refresh();
        setIsReady(true);
    };
    init();
  }, [refresh]);

  const toggleStatus = useCallback((tableName: string, recordId: number | string) => {
    sqliteService.toggleStatus(tableName, recordId);
    refresh();
  }, [refresh]);
  
  const createEntry = useCallback((tableName: string, newRecordData: Record<string, any>) => {
    const newRecord = {
        id: newRecordData.id || Date.now(), // Auto-gen ID if missing
        status: 'active',
        ...newRecordData
    };
    sqliteService.insert(tableName, newRecord);
    refresh();
  }, [refresh]);

  const updateEntry = useCallback((tableName: string, id: number | string, updatedData: Record<string, any>) => {
    sqliteService.update(tableName, id, updatedData);
    refresh();
  }, [refresh]);

  if (!isReady) {
      // Optional: Return a loader here if strict consistency is needed
      // returning children immediately to allow UI render, data populates shortly
  }

  return (
    <DbContext.Provider value={{ db: dbState, toggleStatus, createEntry, updateEntry, refresh }}>
      {children}
    </DbContext.Provider>
  );
};
