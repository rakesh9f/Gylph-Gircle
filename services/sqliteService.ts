
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
  DB_NAME: 'GlyphCircleStorage_V3', // Version bump to force fresh store if V1/V2 was corrupt
  STORE_NAME: 'sqlite_store',
  KEY: 'main_db_binary'
};

const idbAdapter = {
  open: (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(IDB_CONFIG.DB_NAME, 1); 
      
      request.onupgradeneeded = (e: any) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(IDB_CONFIG.STORE_NAME)) {
          db.createObjectStore(IDB_CONFIG.STORE_NAME);
        }
      };
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = (e) => {
          console.error("IDB Open Error:", e);
          reject(request.error);
      };
    });
  },

  save: async (data: Uint8Array) => {
    try {
      const db = await idbAdapter.open();
      return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(IDB_CONFIG.STORE_NAME, 'readwrite');
        const store = tx.objectStore(IDB_CONFIG.STORE_NAME);
        // Using a Blob can be more performant for large binary data in some browsers
        const req = store.put(data, IDB_CONFIG.KEY);
        
        tx.oncomplete = () => resolve();
        req.onerror = (e) => {
            console.error("IDB Save Failed", e);
            reject(req.error);
        };
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
        
        req.onsuccess = () => {
            if (req.result) {
                // Ensure we return Uint8Array
                if (req.result instanceof Uint8Array) {
                    resolve(req.result);
                } else {
                    // Convert back if stored differently
                    resolve(new Uint8Array(req.result));
                }
            } else {
                resolve(null);
            }
        };
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
  private savePromise: Promise<void> = Promise.resolve();
  private initPromise: Promise<void> | null = null;
  
  // Legacy LocalStorage Key for Migration (Deprecated)
  private readonly LEGACY_KEY = 'glyph_circle_prod_v4.sqlite';

  constructor() {
    // Init called externally
  }

  // --- INITIALIZATION ---
  async init() {
    if (this.isReady) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
        try {
          if (!window.initSqlJs) {
            console.error("SQL.js not loaded.");
            return;
          }

          this.SQL = await window.initSqlJs({
            locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
          });

          // 1. Try Load from IndexedDB (Primary Persistence)
          let binaryDb = await idbAdapter.load();
          let isFresh = false;
          
          if (!binaryDb) {
            // 2. Migration: If no IDB, check LocalStorage (Legacy)
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
                isFresh = true;
            }
          } else {
            // 3. New DB
            this.db = new this.SQL.Database();
            console.log("🆕 SQLite: Created new instance (Fresh).");
            isFresh = true;
          }

          // 4. Run Safe Merge Migration (Preserves user data, adds new features/tables)
          await this.safeMergeMigration(isFresh);

          this.isReady = true;
        } catch (err) {
          console.error("SQLite Init Failed:", err);
        }
    })();

    return this.initPromise;
  }

  // --- SAFE MERGE MIGRATION ---
  // Ensures user data persists. Only inserts mock records if they don't exist.
  private async safeMergeMigration(isFreshDb: boolean) {
    let schemaChanged = false;

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
          // 1. Ensure Table Exists
          const createSql = `CREATE TABLE IF NOT EXISTS ${tableName} (${columnDefinitions.join(', ')});`;
          this.db.run(createSql);
          
          // 2. Safe Insert (Only insert if ID doesn't exist)
          const placeholders = columns.map(() => '?').join(', ');
          const insertSql = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
          const stmt = this.db.prepare(insertSql);
          
          records.forEach((record: any) => {
            // Check if record exists
            try {
                // Determine ID type for quote wrapping
                const idVal = typeof record.id === 'string' ? `'${record.id}'` : record.id;
                const check = this.db.exec(`SELECT id FROM ${tableName} WHERE id = ${idVal}`);
                const exists = check.length > 0 && check[0].values.length > 0;

                if (!exists) {
                    const values = columns.map(col => {
                      const val = record[col];
                      if (val === undefined || val === null) return null;
                      if (typeof val === 'object') return JSON.stringify(val);
                      if (typeof val === 'boolean') return val ? 1 : 0;
                      return val;
                    });
                    stmt.run(values);
                    schemaChanged = true;
                }
            } catch (err) {
                // Ignore query errors, proceed
            }
          });
          stmt.free();

      } catch (e) {
          console.error(`Migration Error ${tableName}:`, e);
      }
    });

    // Save only if we added new default data (schema change) or it's a fresh DB
    if (schemaChanged || isFreshDb) {
        await this.saveToStorage();
    }
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
    const idVal = typeof id === 'string' ? `'${id}'` : id;
    const res = this.exec(`SELECT * FROM ${tableName} WHERE id = ${idVal}`);
    return res[0] || null;
  }

  async insert(tableName: string, data: any) {
    if(!this.db) return null;
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
        await this.saveToStorage(); 
        return data;
    } catch (e) { 
        console.error("SQL Insert Error", e);
        return null; 
    }
  }

  async update(tableName: string, id: string | number, data: any) {
    if(!this.db) return;
    try {
        const keys = Object.keys(data);
        const setClause = keys.map(k => `${k} = ?`).join(', ');
        const sql = `UPDATE ${tableName} SET ${setClause} WHERE id = ?`;
        const values = keys.map(k => {
            const val = data[k];
            if (val === undefined || val === null) return null;
            if (typeof val === 'object') return JSON.stringify(val);
            if (typeof val === 'boolean') return val ? 1 : 0;
            return val;
        });
        values.push(id);
        this.db.run(sql, values);
        await this.saveToStorage(); 
    } catch (e) { console.error("SQL Update Error", e); }
  }

  async toggleStatus(tableName: string, id: string | number) {
    const record = this.getById(tableName, id);
    if (record) {
        const newStatus = record.status === 'active' ? 'inactive' : 'active';
        this.db.run(`UPDATE ${tableName} SET status = ? WHERE id = ?`, [newStatus, id]);
        await this.saveToStorage(); 
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

  async importFromJson(jsonData: Record<string, any[]>) {
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

        await this.saveToStorage();
    } catch (e) {
        console.error("Import failed", e);
        throw new Error("Failed to restore database from file.");
    }
  }

  // --- PERSISTENCE ---
  private async saveToStorage() {
    if (this.db) {
        // Enqueue saves to prevent race conditions
        this.savePromise = this.savePromise.then(async () => {
            try {
                // Export raw binary (Uint8Array)
                const data = this.db.export();
                
                // Save to IndexedDB
                await idbAdapter.save(data);
                
                // Console feedback for confirmation
                if (process.env.NODE_ENV === 'development') {
                    console.debug("💾 DB Committed to Storage");
                }
            } catch (e) {
                console.error("CRITICAL: Failed to save DB", e);
            }
        });
        return this.savePromise;
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
