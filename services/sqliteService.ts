
// --- SCHEMA DEFINITION & SEED DATA ---
const INITIAL_SCHEMA: Record<string, any[]> = {
  users: [
    { 
      id: 'master_admin_001', 
      name: 'Master Keeper', 
      role: 'admin', 
      status: 'active', 
      email: 'master@gylphcircle.com', 
      password: 'master123',
      biometric_id: null, 
      uses_biometrics: false,
      credits: 999999,
      created_at: new Date().toISOString()
    },
    { 
      id: 'demo_user_001', 
      name: 'Arjun Seeker', 
      role: 'user', 
      status: 'active', 
      email: 'arjun@example.com', 
      password: 'user123',
      credits: 50,
      created_at: new Date().toISOString()
    }
  ],
  readings: [],
  feedback: [],
  store_items: [
    { 
      id: 101, 
      name: '5 Mukhi Rudraksha', 
      category: 'Rudraksha', 
      price: 501.00, 
      description: 'Original Nepali bead for peace and health. Lord Shiva blessing.', 
      image_url: 'https://images.unsplash.com/photo-1620326887707-33a7df064375?q=80&w=400',
      stock: 50, 
      status: 'active' 
    }
  ],
  store_orders: [],
  transactions: [],
  gemstones: [],
  featured_content: [
    { 
      id: 'feat_home_01', 
      title: 'Retrograde Saturn: What It Means', 
      text: 'Shani Dev turns retrograde. This is a time for karmic reflection and revisiting past lessons.', 
      image_url: 'https://images.unsplash.com/photo-1614730375494-071782d3843f?q=80&w=800', 
      status: 'active' 
    }
  ],
  services: [
    { id: 'numerology', name: 'Numerology', description: 'Uncover the secrets hidden in your name and birth date.', image: '', path: '/numerology', status: 'active' },
    { id: 'astrology', name: 'Astrology', description: 'Explore your destiny written in the stars and planets.', image: '', path: '/astrology', status: 'active' },
    { id: 'tarot', name: 'Tarot', description: 'Draw a card and gain insight into your past, present, and future.', image: '', path: '/tarot', status: 'active' },
    { id: 'palmistry', name: 'Palmistry', description: 'Read the lines on your hand to understand your character and future.', image: '', path: '/palmistry', status: 'active' },
    { id: 'face-reading', name: 'Face Reading', description: 'Discover what your facial features reveal about your personality.', image: '', path: '/face-reading', status: 'active' },
    { id: 'dream-analysis', name: 'Dream Analysis', description: 'Decode symbols and find your lucky numbers.', image: '', path: '/dream-analysis', status: 'active' },
    { id: 'remedy', name: 'Personal Guidance', description: 'Get personalized remedies and guidance for your life challenges.', image: '', path: '/remedy', status: 'active' },
    { id: 'store', name: 'Vedic Store', description: 'Authentic Rudraksha, Yantras, and Gemstones.', image: '', path: '/store', status: 'active' },
    { id: 'matchmaking', name: 'Vedic Matchmaking', description: 'Check marital compatibility using Guna Milan.', image: '', path: '/matchmaking', status: 'active' },
    { id: 'gemstones', name: 'Gemstones', description: 'Find your power stone and sacred mantras.', image: '', path: '/gemstones', status: 'active' }
  ],
  image_assets: [],
  config: [
      { id: 'app_title', key: 'title', value: 'Glyph Circle', status: 'active'},
      { id: 'cloud_db_url', key: 'cloud_db_url', value: '', status: 'inactive'} 
  ],
  cloud_providers: [
    { id: 'gdrive_main', provider: 'Google Drive', name: 'Primary Drive', api_key: '', is_active: false, status: 'active' }
  ],
  payment_providers: [],
  payment_config: []
};

declare global {
  interface Window {
    initSqlJs: (config: any) => Promise<any>;
  }
}

const IDB_CONFIG = {
  DB_NAME: 'GlyphCircleStorage_V3', 
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
      request.onerror = (e) => reject(request.error);
    });
  },
  save: async (data: Uint8Array) => {
    try {
      const db = await idbAdapter.open();
      return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(IDB_CONFIG.STORE_NAME, 'readwrite');
        const store = tx.objectStore(IDB_CONFIG.STORE_NAME);
        const req = store.put(data, IDB_CONFIG.KEY);
        tx.oncomplete = () => resolve();
        req.onerror = (e) => reject(req.error);
      });
    } catch (err) { console.error("IDB Save Error:", err); }
  },
  load: async (): Promise<Uint8Array | null> => {
    try {
      const db = await idbAdapter.open();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(IDB_CONFIG.STORE_NAME, 'readonly');
        const store = tx.objectStore(IDB_CONFIG.STORE_NAME);
        const req = store.get(IDB_CONFIG.KEY);
        req.onsuccess = () => resolve(req.result instanceof Uint8Array ? req.result : (req.result ? new Uint8Array(req.result) : null));
        req.onerror = () => reject(req.error);
      });
    } catch (err) { return null; }
  }
};

class SqliteService {
  private db: any = null;
  private SQL: any = null;
  private isReady: boolean = false;
  private savePromise: Promise<void> = Promise.resolve();
  private initPromise: Promise<void> | null = null;

  constructor() {}

  async init() {
    if (this.isReady) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
        try {
          if (!window.initSqlJs) return;

          this.SQL = await window.initSqlJs({
            locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
          });

          // 1. Attempt Cloud Sync First (if configured)
          const cloudUrl = localStorage.getItem('glyph_cloud_db_url');
          let binaryDb: Uint8Array | null = null;

          if (cloudUrl) {
             console.log("☁️ Attempting Cloud DB Sync from:", cloudUrl);
             try {
                 const response = await fetch(cloudUrl, {
                     method: 'GET',
                     mode: 'cors', // Try to respect CORS
                     // headers: { 'Cache-Control': 'no-cache' } // Avoid stale cache
                 });
                 if (response.ok) {
                     const buffer = await response.arrayBuffer();
                     const newDbBytes = new Uint8Array(buffer);
                     
                     // Basic check: is it a valid SQLite header? (starts with "SQLite format 3")
                     // UTF-8 bytes for "SQLite format 3" are 83 81 76 105 ...
                     if (newDbBytes[0] === 83 && newDbBytes[1] === 81) {
                         binaryDb = newDbBytes;
                         console.log("✅ Cloud DB Verified & Loaded");
                         // Persist it immediately to avoid re-fetching on every soft reload
                         await idbAdapter.save(binaryDb);
                     } else {
                         console.warn("⚠️ Downloaded file is not a valid SQLite DB. Falling back.");
                     }
                 } else {
                     console.warn(`⚠️ Cloud Sync Fetch Failed: ${response.status}`);
                 }
             } catch (e) {
                 console.warn("⚠️ Cloud Sync Network Error (likely CORS):", e);
             }
          }

          // 2. Fallback to Local IndexedDB
          if (!binaryDb) {
             binaryDb = await idbAdapter.load();
          }

          if (binaryDb) {
            try {
                this.db = new this.SQL.Database(binaryDb);
            } catch (e) {
                console.error("DB Corrupt, resetting.", e);
                this.db = new this.SQL.Database();
            }
          } else {
            this.db = new this.SQL.Database();
          }

          await this.runSchemaMigration(true);
          this.isReady = true;
        } catch (err) {
          console.error("SQLite Init Failed:", err);
        }
    })();

    return this.initPromise;
  }

  // --- EXPORT BINARY (For GDrive Upload) ---
  exportDatabaseBlob(): Blob | null {
      if (!this.db) return null;
      try {
          const binary = this.db.export();
          return new Blob([binary], { type: 'application/x-sqlite3' });
      } catch (e) {
          console.error("Export Blob Failed", e);
          return null;
      }
  }

  // --- OVERWRITE DB (From GDrive Download) ---
  async overwriteDatabase(newDbFile: ArrayBuffer) {
      if (!this.SQL) return;
      try {
          // Close existing
          if (this.db) this.db.close();
          
          // Load new
          const uint8 = new Uint8Array(newDbFile);
          this.db = new this.SQL.Database(uint8);
          
          // Persist immediately
          await this.saveToStorage();
          window.location.reload(); // Reload to reflect changes
      } catch (e) {
          console.error("Overwrite failed", e);
          alert("Failed to load database file. It might be corrupt.");
      }
  }

  private async runSchemaMigration(isFreshDb: boolean) {
    let schemaChanged = false;
    Object.keys(INITIAL_SCHEMA).forEach(tableName => {
      const sample = INITIAL_SCHEMA[tableName][0];
      let tableExists = false;
      try {
          this.db.exec(`SELECT count(*) FROM ${tableName}`);
          tableExists = true;
      } catch (e) {
          if (sample) {
              const columns = Object.keys(sample);
              const columnDefs = columns.map(k => {
                  const val = sample[k];
                  let type = 'TEXT';
                  if (typeof val === 'number') type = Number.isInteger(val) ? 'INTEGER' : 'REAL';
                  return k === 'id' ? `${k} ${type} PRIMARY KEY` : `${k} ${type}`;
              });
              this.db.run(`CREATE TABLE ${tableName} (${columnDefs.join(', ')})`);
          } else {
              this.db.run(`CREATE TABLE ${tableName} (id TEXT PRIMARY KEY, status TEXT)`);
          }
          schemaChanged = true;
          tableExists = true;
      }

      if (tableExists && sample) {
          const res = this.db.exec(`PRAGMA table_info(${tableName})`);
          const existingCols = res[0].values.map((row: any) => row[1]);
          const columns = Object.keys(sample);
          
          columns.forEach(col => {
              if (!existingCols.includes(col)) {
                  let type = 'TEXT';
                  const val = sample[col];
                  if (typeof val === 'number') type = Number.isInteger(val) ? 'INTEGER' : 'REAL';
                  try {
                      this.db.run(`ALTER TABLE ${tableName} ADD COLUMN ${col} ${type}`);
                      schemaChanged = true;
                  } catch (err) {}
              }
          });
      }

      try {
          const countRes = this.db.exec(`SELECT count(*) as c FROM ${tableName}`);
          const count = countRes[0].values[0][0];
          if (count === 0 && INITIAL_SCHEMA[tableName].length > 0) {
              this.populateTable(tableName, INITIAL_SCHEMA[tableName]);
              schemaChanged = true;
          }
      } catch (e) {}
    });

    if (schemaChanged || isFreshDb) {
        await this.saveToStorage();
    }
  }

  private populateTable(tableName: string, records: any[]) {
      if (records.length === 0) return;
      const columns = Object.keys(records[0]);
      const placeholders = columns.map(() => '?').join(', ');
      const insertSql = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
      
      records.forEach(record => {
          const values = columns.map(col => {
              const val = record[col];
              if (val === undefined || val === null) return null;
              if (typeof val === 'object') return JSON.stringify(val);
              return val;
          });
          try { this.db.run(insertSql, values); } catch (e) {}
      });
  }

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
                        const val = row[i];
                        if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
                            obj[col] = JSON.parse(val);
                        } else {
                            obj[col] = val;
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

  getSchemaKeys(): string[] { return Object.keys(INITIAL_SCHEMA); }

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
    } catch (e) { return null; }
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
    } catch (e) { }
  }

  async toggleStatus(tableName: string, id: string | number) {
    const record = this.getById(tableName, id);
    if (record) {
        const newStatus = record.status === 'active' ? 'inactive' : 'active';
        this.db.run(`UPDATE ${tableName} SET status = ? WHERE id = ?`, [newStatus, id]);
        await this.saveToStorage(); 
    }
  }

  exportAllData(): Record<string, any[]> {
    if (!this.db) return {};
    try {
        const tablesRes = this.db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
        if (!tablesRes.length) return {};
        const tableNames = tablesRes[0].values.map((row: any[]) => row[0]);
        const exportData: Record<string, any[]> = {};
        tableNames.forEach((tableName: string) => { exportData[tableName] = this.getAll(tableName); });
        return exportData;
    } catch(e) { return {}; }
  }

  async importFromJson(jsonData: Record<string, any[]>) {
    if (!this.db) throw new Error("Database not initialized");
    try {
        const tables = Object.keys(jsonData);
        for (const tableName of tables) {
            const rows = jsonData[tableName];
            if (!Array.isArray(rows) || rows.length === 0) continue;
            this.db.run(`DROP TABLE IF EXISTS ${tableName}`);
            const sample = rows[0];
            const columns = Object.keys(sample);
            const columnDefs = columns.map(k => {
                 const val = sample[k];
                 let type = 'TEXT';
                 if (typeof val === 'number') type = Number.isInteger(val) ? 'INTEGER' : 'REAL';
                 return k === 'id' ? `${k} ${type} PRIMARY KEY` : `${k} ${type}`;
            });
            this.db.run(`CREATE TABLE ${tableName} (${columnDefs.join(', ')})`);
            this.populateTable(tableName, rows);
        }
        await this.saveToStorage();
        return true;
    } catch (e) { throw new Error("Failed to restore database from file."); }
  }

  private async saveToStorage() {
    if (this.db) {
        this.savePromise = this.savePromise.then(async () => {
            try {
                const data = this.db.export();
                await idbAdapter.save(data);
            } catch (e) { console.error("CRITICAL: Failed to save DB", e); }
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
