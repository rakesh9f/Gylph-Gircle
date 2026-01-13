import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { MockDatabase, getMockDb, setMockDb, DbRecord } from '../services/mockDb';

interface DbContextType {
  db: MockDatabase;
  toggleStatus: (tableName: string, recordId: number | string) => void;
  createEntry: (tableName: string, newRecordData: Record<string, any>) => void;
}

export const DbContext = createContext<DbContextType | undefined>(undefined);

export const DbProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [db, setDbState] = useState<MockDatabase>(() => getMockDb());

  const toggleStatus = useCallback((tableName: string, recordId: number | string) => {
    setDbState(prevDb => {
        // FIX: Explicitly type the return value of the map callback to prevent type widening of the 'status' property.
        const updatedTable = prevDb[tableName].map((record): DbRecord => {
            if (record.id === recordId) {
                return { ...record, status: record.status === 'active' ? 'inactive' : 'active' };
            }
            return record;
        });
        const newDbState = { ...prevDb, [tableName]: updatedTable };
        setMockDb(newDbState);
        return newDbState;
    });
  }, []);
  
    const createEntry = useCallback((tableName: string, newRecordData: Record<string, any>) => {
        setDbState(prevDb => {
            const newRecord: DbRecord = {
                id: Date.now(),
                status: 'active',
                ...newRecordData,
            };

            if (newRecord.price && typeof newRecord.price === 'string') {
                newRecord.price = parseFloat(newRecord.price);
            }
            
            const newDbState = {
                ...prevDb,
                [tableName]: [...prevDb[tableName], newRecord],
            };
            setMockDb(newDbState);
            return newDbState;
        });
    }, []);

  return (
    <DbContext.Provider value={{ db, toggleStatus, createEntry }}>
      {children}
    </DbContext.Provider>
  );
};
