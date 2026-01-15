
import { MOCK_DATABASE } from './mockDb';
// import { securityService } from './security'; // Temporarily disabled for stability

// Define Window interface for SQL.js
declare global {
  interface Window {
    initSqlJs: (config: any) => Promise<any>;
  }
}

class SqliteService {
  private db: any = null;
  private SQL: any = null;
  private isReady: boolean = false;
  private readonly DB_NAME = 'glyph_circle_prod_v4.sqlite'; // Updated version

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

      // 1. Load Database from Storage
      const savedDb = localStorage.getItem(this.DB_NAME);
      
      if (savedDb) {
        try {
            // Direct load for stability
            const binaryArray = this.base64ToUint8Array(savedDb);
            this.db = new this.SQL.Database(binaryArray);
            console.log("📂 SQLite: Loaded from Storage.");
        } catch (e) {
            console.error("❌ SQLite: Load Fail. Resetting DB...", e);
            // Backup the corrupted string just in case
            localStorage.setItem(this.DB_NAME + '_corrupt_backup', savedDb);
            
            this.db = new this.SQL.Database();
            this.autoMigrateFromMock();
        }
      } else {
        this.db = new this.SQL.Database();
        console.log("🆕 SQLite: Created new instance.");
        this.autoMigrateFromMock();
      }

      this.isReady = true;
    } catch (err) {
      console.error("SQLite Init Failed:", err);
    }
  }

  // --- AUTO-SCHEMA DETECTION & MIGRATION ---
  private autoMigrateFromMock() {
    // Runtime Table Creation Logic
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
          
          // Only insert if table is empty to avoid duplicates on migration re-run
          const countRes = this.db.exec(`SELECT count(*) as count FROM ${tableName}`);
          if (countRes.length > 0 && countRes[0].values[0][0] > 0) {
              return; // Table has data, skip seeding
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
        console.error("Export Failed", e);
        return {};
    }
  }

  importFromJson(jsonData: Record<string, any[]>) {
    if (!this.db) return;
    try {
        // We use a transaction for atomic restore
        // Note: sql.js transactions might need explicit handling if not in worker
        // but we'll do best effort.
        
        Object.keys(jsonData).forEach(tableName => {
            const rows = jsonData[tableName];
            if (!Array.isArray(rows) || rows.length === 0) return;

            // 1. Detect Schema from first row of backup
            const sample = rows[0];
            const columns = Object.keys(sample);
            const columnDefs = columns.map(k => {
                 // Simple type inference
                 const val = sample[k];
                 let type = 'TEXT';
                 if (typeof val === 'number') type = Number.isInteger(val) ? 'INTEGER' : 'REAL';
                 return k === 'id' ? `${k} ${type} PRIMARY KEY` : `${k} ${type}`;
            });

            // 2. Drop and Recreate Table
            this.db.run(`DROP TABLE IF EXISTS ${tableName}`);
            this.db.run(`CREATE TABLE ${tableName} (${columnDefs.join(', ')})`);
            
            // 3. Insert Data
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
        console.log("✅ Database Restored from JSON");
    } catch (e) {
        console.error("Import failed", e);
        throw new Error("Failed to restore database from file.");
    }
  }

  // --- PERSISTENCE ---
  private saveToStorage() {
    if (this.db) {
        try {
            // Attempt to compact the database before saving to save space
            // this.db.run("VACUUM"); 
            
            const data = this.db.export();
            const base64 = this.uint8ArrayToBase64(data);
            
            // Check approximate size (Base64 is ~1.33x binary size)
            // 5MB limit means ~3.7MB binary limit
            if (base64.length > 4500000) {
                console.warn("⚠️ Database size approaching LocalStorage limit!");
            }

            localStorage.setItem(this.DB_NAME, base64);
        } catch (e: any) {
            console.error("❌ CRITICAL: Failed to save Database to LocalStorage", e);
            if (e.name === 'QuotaExceededError') {
                alert("Storage Full! Your changes cannot be saved. Please clear some data or use Backup/Restore.");
            }
        }
    }
  }

  private uint8ArrayToBase64(u8: Uint8Array): string {
    let binary = '';
    const len = u8.byteLength;
    for (let i = 0; i < len; i++) { binary += String.fromCharCode(u8[i]); }
    return window.btoa(binary);
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
