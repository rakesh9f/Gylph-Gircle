
import React, { createContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { dbService } from '../services/db';

interface DbContextType {
  db: any; // Dynamic schema state
  toggleStatus: (tableName: string, recordId: number | string) => void;
  createEntry: (tableName: string, newRecordData: Record<string, any>) => void;
  updateEntry: (tableName: string, id: number | string, updatedData: Record<string, any>) => void;
  refresh: () => void;
}

export const DbContext = createContext<DbContextType | undefined>(undefined);

export const DbProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dbState, setDbState] = useState<any>({});
  const [isReady, setIsReady] = useState(false);

  // List of tables to pre-fetch for app functionality
  const CORE_TABLES = ['store_items', 'featured_content', 'services', 'config', 'cloud_providers', 'payment_providers', 'gemstones'];

  // Function to hydrate state from Supabase
  const refresh = useCallback(async () => {
    const newState: any = {};
    
    await Promise.all(CORE_TABLES.map(async (table) => {
        try {
            newState[table] = await dbService.getAll(table);
        } catch (e) {
            console.warn(`Failed to load table ${table}:`, e);
            newState[table] = [];
        }
    }));
    
    setDbState((prev: any) => ({ ...prev, ...newState }));
  }, []);

  // Initialize DB on mount
  useEffect(() => {
    const init = async () => {
        await refresh();
        setIsReady(true);
    };
    init();
  }, [refresh]);

  const toggleStatus = useCallback(async (tableName: string, recordId: number | string) => {
    // Optimistic Update
    setDbState((prev: any) => {
        const tableData = prev[tableName] || [];
        return {
            ...prev,
            [tableName]: tableData.map((r: any) => 
                r.id === recordId ? { ...r, status: r.status === 'active' ? 'inactive' : 'active' } : r
            )
        };
    });

    // Actual DB Update
    try {
        const current = dbState[tableName]?.find((r:any) => r.id === recordId);
        if (current) {
            const newStatus = current.status === 'active' ? 'inactive' : 'active';
            await dbService.updateEntry(tableName, recordId, { status: newStatus });
        }
    } catch (e) {
        console.error("DB Status Toggle Failed", e);
        refresh(); // Revert
    }
  }, [dbState, refresh]);
  
  const createEntry = useCallback(async (tableName: string, newRecordData: Record<string, any>) => {
    try {
        await dbService.createEntry(tableName, newRecordData);
        refresh(); // Refresh to get the real ID and data
    } catch (e) {
        console.error("Create Entry Failed", e);
        alert("Failed to create entry");
    }
  }, [refresh]);

  const updateEntry = useCallback(async (tableName: string, id: number | string, updatedData: Record<string, any>) => {
    try {
        await dbService.updateEntry(tableName, id, updatedData);
        refresh();
    } catch (e) {
        console.error("Update Entry Failed", e);
    }
  }, [refresh]);

  if (!isReady) {
      return (
          <div className="min-h-screen bg-gray-900 flex items-center justify-center">
              <div className="flex flex-col items-center">
                  <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-amber-200 font-cinzel text-sm animate-pulse">Connecting to Cosmic Cloud...</p>
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
