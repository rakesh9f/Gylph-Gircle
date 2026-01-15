
import { MOCK_DATABASE } from './mockDb';

// Define Window interface for SQL.js
declare global {
  interface Window {
    initSqlJs: (config: any) => Promise<any>;
  }
}

// --- INDEXED DB ADAPTER ---
// Handles large binary storage efficiently
const IDB_CONFIG = {
  DB_NAME: 'GlyphCircleStorage',
  STORE_NAME: 'sqlite_store',
  KEY: 'main_db_binary_v1'
};

const idbAdapter = {
  open: (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(IDB_CONFIG.DB_NAME, 2); // Version 2
      
      request.onupgradeneeded = (e: any) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(IDB_CONFIG.STORE_NAME)) {
          db.createObjectStore(IDB_CONFIG.STORE_NAME);
        }
      };
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  save: async (data: Uint8Array) => {
    try {
      const db = await idbAdapter.open();
      return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(IDB_CONFIG.STORE_NAME, 'readwrite');
        const store = tx.objectStore(IDB_CONFIG.STORE_NAME);
        const req = store.put(data, IDB_CONFIG.KEY);
        
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.error("IDB Save Error:", err);
    }
  },

  load: async (): Promise<Uint8Array | null> => {
    try {
      const db = await idbAdapter.open();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(IDB_CONFIG.STORE_NAME, 'readonly');
        const store = tx.objectStore(IDB_CONFIG.STORE_NAME);
        const req = store.get(IDB_CONFIG.KEY);
        
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.error("IDB Load Error:", err);
      return null;
    }
  }
};

class SqliteService {
  private db: any = null;
  private SQL: any = null;
  private isReady: boolean = false;
  
  // Legacy LocalStorage Key for Migration
  private readonly LEGACY_KEY = 'glyph_circle_prod_v4.sqlite';

  constructor() {
    this.init();
  }

  // --- INITIALIZATION ---
  async init() {
    if (this.isReady) return;

    try {
      if (!window.initSqlJs) {
        console.error("SQL.js not loaded.");
        return;
      }

      this.SQL = await window.initSqlJs({
        locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
      });

      // 1. Try Load from IndexedDB (Primary)
      let binaryDb = await idbAdapter.load();
      
      // 2. Migration: If no IDB, check LocalStorage
      if (!binaryDb) {
        const legacyData = localStorage.getItem(this.LEGACY_KEY);
        if (legacyData) {
            console.log("📦 Migrating data from LocalStorage to IndexedDB...");
            try {
                binaryDb = this.base64ToUint8Array(legacyData);
            } catch (e) {
                console.error("Migration failed, data corrupt", e);
            }
        }
      }

      if (binaryDb) {
        try {
            this.db = new this.SQL.Database(binaryDb);
            console.log("📂 SQLite: Loaded from Persistence Layer.");
        } catch (e) {
            console.error("❌ SQLite: Corrupt DB. Resetting...", e);
            this.db = new this.SQL.Database();
            this.autoMigrateFromMock();
        }
      } else {
        // 3. New DB
        this.db = new this.SQL.Database();
        console.log("🆕 SQLite: Created new instance (Fresh).");
        this.autoMigrateFromMock();
      }

      this.isReady = true;
    } catch (err) {
      console.error("SQLite Init Failed:", err);
    }
  }

  // --- AUTO-SCHEMA DETECTION & MIGRATION ---
  private autoMigrateFromMock() {
    Object.keys(MOCK_DATABASE).forEach(tableName => {
      const records = MOCK_DATABASE[tableName];
      if (!records || records.length === 0) return;

      const sample = records[0];
      const columns: string[] = [];
      const columnDefinitions: string[] = [];

      Object.keys(sample).forEach(key => {
        const val = sample[key];
        let type = 'TEXT';
        if (typeof val === 'number') type = Number.isInteger(val) ? 'INTEGER' : 'REAL';
        else if (typeof val === 'boolean') type = 'INTEGER'; 

        columns.push(key);
        if (key === 'id') {
            columnDefinitions.push(`${key} ${type} PRIMARY KEY`);
        } else {
            columnDefinitions.push(`${key} ${type}`);
        }
      });

      try {
          const createSql = `CREATE TABLE IF NOT EXISTS ${tableName} (${columnDefinitions.join(', ')});`;
          this.db.run(createSql);
          
          const countRes = this.db.exec(`SELECT count(*) as count FROM ${tableName}`);
          if (countRes.length > 0 && countRes[0].values[0][0] > 0) {
              return; 
          }

          const placeholders = columns.map(() => '?').join(', ');
          const insertSql = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
          const stmt = this.db.prepare(insertSql);
          
          records.forEach((record: any) => {
            const values = columns.map(col => {
              const val = record[col];
              if (val === undefined || val === null) return null;
              if (typeof val === 'object') return JSON.stringify(val);
              if (typeof val === 'boolean') return val ? 1 : 0;
              return val;
            });
            stmt.run(values);
          });
          stmt.free();
      } catch (e) {
          console.error(`Migration Error ${tableName}:`, e);
      }
    });

    this.saveToStorage();
  }

  // --- CRUD OPERATIONS ---
  exec(sql: string): any[] {
    if (!this.db) return [];
    try {
        const res = this.db.exec(sql);
        if (res.length > 0) {
            const columns = res[0].columns;
            const values = res[0].values;
            return values.map((row: any[]) => {
                const obj: any = {};
                columns.forEach((col: string, i: number) => {
                    try {
                        if (typeof row[i] === 'string' && (row[i].startsWith('{') || row[i].startsWith('['))) {
                            obj[col] = JSON.parse(row[i]);
                        } else {
                            obj[col] = row[i];
                        }
                    } catch {
                        obj[col] = row[i];
                    }
                });
                return obj;
            });
        }
        return [];
    } catch (e) { return []; }
  }

  getAll(tableName: string) { return this.exec(`SELECT * FROM ${tableName}`); }

  getById(tableName: string, id: string | number) {
    const res = this.exec(`SELECT * FROM ${tableName} WHERE id = '${id}'`);
    return res[0] || null;
  }

  insert(tableName: string, data: any) {
    try {
        const columns = Object.keys(data);
        const placeholders = columns.map(() => '?').join(', ');
        const sql = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
        const values = columns.map(k => {
            const val = data[k];
            if (val === undefined || val === null) return null;
            if (typeof val === 'object') return JSON.stringify(val);
            if (typeof val === 'boolean') return val ? 1 : 0;
            return val;
        });
        this.db.run(sql, values);
        this.saveToStorage();
        return data;
    } catch (e) { return null; }
  }

  update(tableName: string, id: string | number, data: any) {
    try {
        const setClause = Object.keys(data).map(k => `${k} = ?`).join(', ');
        const sql = `UPDATE ${tableName} SET ${setClause} WHERE id = ?`;
        const values = Object.values(data).map(val => {
            if (val === undefined || val === null) return null;
            if (typeof val === 'object') return JSON.stringify(val);
            if (typeof val === 'boolean') return val ? 1 : 0;
            return val;
        });
        values.push(id);
        this.db.run(sql, values);
        this.saveToStorage();
    } catch (e) { console.error("SQL Update Error", e); }
  }

  toggleStatus(tableName: string, id: string | number) {
    const record = this.getById(tableName, id);
    if (record) {
        const newStatus = record.status === 'active' ? 'inactive' : 'active';
        this.db.run(`UPDATE ${tableName} SET status = ? WHERE id = ?`, [newStatus, id]);
        this.saveToStorage();
    }
  }

  // --- EXPORT / IMPORT ---
  exportAllData(): Record<string, any[]> {
    if (!this.db) return {};
    try {
        const tablesRes = this.db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
        if (!tablesRes.length) return {};
        
        const tableNames = tablesRes[0].values.map((row: any[]) => row[0]);
        const exportData: Record<string, any[]> = {};
        
        tableNames.forEach((tableName: string) => {
            exportData[tableName] = this.getAll(tableName);
        });
        return exportData;
    } catch(e) {
        return {};
    }
  }

  importFromJson(jsonData: Record<string, any[]>) {
    if (!this.db) return;
    try {
        Object.keys(jsonData).forEach(tableName => {
            const rows = jsonData[tableName];
            if (!Array.isArray(rows) || rows.length === 0) return;

            const sample = rows[0];
            const columns = Object.keys(sample);
            const columnDefs = columns.map(k => {
                 const val = sample[k];
                 let type = 'TEXT';
                 if (typeof val === 'number') type = Number.isInteger(val) ? 'INTEGER' : 'REAL';
                 return k === 'id' ? `${k} ${type} PRIMARY KEY` : `${k} ${type}`;
            });

            this.db.run(`DROP TABLE IF EXISTS ${tableName}`);
            this.db.run(`CREATE TABLE ${tableName} (${columnDefs.join(', ')})`);
            
            const placeholders = columns.map(() => '?').join(', ');
            const insertSql = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
            const stmt = this.db.prepare(insertSql);
            
            rows.forEach(row => {
                const values = columns.map(col => {
                    const val = row[col];
                    if (val === undefined || val === null) return null;
                    if (typeof val === 'object') return JSON.stringify(val);
                    if (typeof val === 'boolean') return val ? 1 : 0;
                    return val;
                });
                stmt.run(values);
            });
            stmt.free();
        });

        this.saveToStorage();
    } catch (e) {
        console.error("Import failed", e);
        throw new Error("Failed to restore database from file.");
    }
  }

  // --- PERSISTENCE ---
  private async saveToStorage() {
    if (this.db) {
        try {
            // Export raw binary (Uint8Array)
            const data = this.db.export();
            
            // Save to IndexedDB (No size limit issues like LocalStorage)
            await idbAdapter.save(data);
            
            // Clean up legacy storage to free space if migration was successful
            if (localStorage.getItem(this.LEGACY_KEY)) {
                localStorage.removeItem(this.LEGACY_KEY);
            }
        } catch (e) {
            console.error("CRITICAL: Failed to save DB", e);
        }
    }
  }

  private base64ToUint8Array(base64: string): Uint8Array {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) { bytes[i] = binary_string.charCodeAt(i); }
    return bytes;
  }
}

export const sqliteService = new SqliteService();
