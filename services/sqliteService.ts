
import { MOCK_DATABASE } from './mockDb';
import { securityService } from './security';

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
  private readonly DB_NAME = 'glyph_circle_production_encrypted_v3.sqlite';

  constructor() {
    this.init();
  }

  // --- INITIALIZATION ---
  async init() {
    if (this.isReady) return;

    try {
      // 1. Integrity Check
      if (!securityService.checkSystemIntegrity()) {
          console.error("🚨 SYSTEM INTEGRITY COMPROMISED. DATABASE LOCKDOWN.");
          return;
      }

      if (!window.initSqlJs) {
        console.error("SQL.js not loaded.");
        return;
      }

      this.SQL = await window.initSqlJs({
        locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
      });

      // 2. Load & Decrypt Database
      const encryptedDb = localStorage.getItem(this.DB_NAME);
      
      if (encryptedDb) {
        try {
            console.log("🔐 Decrypting Database...");
            const decryptedBase64 = await securityService.decryptData(encryptedDb);
            
            if (decryptedBase64) {
                const binaryArray = this.base64ToUint8Array(decryptedBase64);
                this.db = new this.SQL.Database(binaryArray);
                console.log("📂 SQLite: Loaded & Decrypted.");
            } else {
                throw new Error("Decryption returned null");
            }
        } catch (e) {
            console.error("❌ SQLite: Crypto Fail. Resetting DB...", e);
            this.db = new this.SQL.Database();
            this.autoMigrateFromMock();
        }
      } else {
        this.db = new this.SQL.Database();
        console.log("🆕 SQLite: Created new encrypted instance.");
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
    } catch (e) { }
  }

  toggleStatus(tableName: string, id: string | number) {
    const record = this.getById(tableName, id);
    if (record) {
        const newStatus = record.status === 'active' ? 'inactive' : 'active';
        this.db.run(`UPDATE ${tableName} SET status = ? WHERE id = ?`, [newStatus, id]);
        this.saveToStorage();
    }
  }

  // --- ENCRYPTED PERSISTENCE ---
  private async saveToStorage() {
    if (this.db) {
        const data = this.db.export();
        const base64 = this.uint8ArrayToBase64(data);
        
        // Encrypt before saving
        const encrypted = await securityService.encryptData(base64);
        localStorage.setItem(this.DB_NAME, encrypted);
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
