
import { v4 as uuidv4 } from 'uuid';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  password?: string; // Storing plain for emergency recovery as requested
  role: 'user' | 'admin';
  credits: number;
  created_at: string;
}

export interface Reading {
  id: string;
  user_id: string;
  type: 'tarot' | 'palmistry' | 'astrology' | 'numerology' | 'face-reading' | 'remedy';
  title: string;
  content: string;
  subtitle?: string;
  image_url?: string;
  timestamp: string;
  is_favorite: boolean;
  paid: boolean;
}

export interface Transaction {
    id: string;
    user_id: string;
    amount: number;
    description: string;
    status: 'success' | 'failed' | 'pending';
    created_at: string;
}

export interface DatabaseSchema {
  users: User[];
  readings: Reading[];
  transactions: Transaction[];
}

const DB_KEY = 'glyph_db_nuclear_v1';

class LocalDatabase {
  constructor() {
    // We do NOT run nuclearReset in constructor to avoid infinite loops during hot-reload.
    // It is called explicitly in App.tsx
  }

  private getDb(): DatabaseSchema {
    try {
      const stored = localStorage.getItem(DB_KEY);
      let db = stored ? JSON.parse(stored) : { users: [], readings: [], transactions: [] };
      
      // --- FAILSAFE: Ensure Master Admin Always Exists ---
      const masterEmail = 'master@gylphcircle.com';
      if (!db.users.find((u: User) => u.email === masterEmail)) {
          const masterUser: User = {
            id: 'admin-1',
            email: masterEmail,
            name: 'Master',
            password: 'master123',
            role: 'admin',
            credits: 9999,
            created_at: new Date().toISOString()
          };
          db.users.push(masterUser);
          this.saveDb(db);
          console.log("🛡️ DB Service: Master Admin restored automatically.");
      }
      
      return db;
    } catch (e) {
      return { users: [], readings: [], transactions: [] };
    }
  }

  private saveDb(data: DatabaseSchema) {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
  }

  // 💥 NUCLEAR RESET: Wipes DB and Forces Admins
  nuclearReset() {
    console.log("💥 NUCLEAR DB RESET STARTING...");
    
    const admins: User[] = [
      {
        id: 'admin-1',
        email: 'master@gylphcircle.com',
        name: 'Master',
        password: 'master123',
        role: 'admin',
        credits: 9999,
        created_at: new Date().toISOString()
      },
      {
        id: 'admin-2',
        email: 'admin@gylphcircle.com',
        name: 'Admin',
        password: 'admin123',
        role: 'admin',
        credits: 9999,
        created_at: new Date().toISOString()
      }
    ];

    const freshDB: DatabaseSchema = {
      users: admins,
      readings: [],
      transactions: []
    };

    this.saveDb(freshDB);
    
    console.log("✅ NUCLEAR RESET COMPLETE");
    console.table(admins);
  }

  // LAYER 1: Standard DB Check
  validateUser(email: string, pass: string): User | null {
    const db = this.getDb();
    const user = db.users.find(u => u.email === email && u.password === pass);
    if (user) return user;
    return null;
  }

  // LAYER 2: Check if user exists as admin (ignore password if needed in extreme cases)
  getAdminByEmail(email: string): User | null {
    const db = this.getDb();
    return db.users.find(u => u.email === email && u.role === 'admin') || null;
  }

  getAllUsers() {
    return this.getDb().users;
  }

  getUser(id: string): User | undefined {
    return this.getDb().users.find(u => u.id === id);
  }

  createUser(email: string, name: string, password?: string): User {
      const db = this.getDb();
      if (db.users.find(u => u.email === email)) {
          throw new Error("User already exists with this email");
      }
      
      const newUser: User = {
          id: uuidv4(),
          email,
          name,
          password,
          role: 'user',
          credits: 0,
          created_at: new Date().toISOString()
      };
      
      db.users.push(newUser);
      this.saveDb(db);
      return newUser;
  }

  // Create Google User (Fake Login Support)
  createGoogleUser(email: string, name: string, googleId: string): User {
      const db = this.getDb();
      let user = db.users.find(u => u.email === email);
      
      if (!user) {
          user = {
              id: 'g-' + Date.now(),
              email,
              name,
              role: 'user',
              credits: 10,
              created_at: new Date().toISOString(),
              password: 'google-auth-user'
          };
          
          // Auto-Admin for Rakesh
          if(email === 'rakesh9f@gmail.com') {
              user.role = 'admin';
              user.credits = 99999;
          }
          
          db.users.push(user);
          this.saveDb(db);
      }
      return user;
  }

  getReadings(userId: string): Reading[] {
      const db = this.getDb();
      return db.readings.filter(r => r.user_id === userId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  saveReading(reading: Omit<Reading, 'id' | 'timestamp' | 'is_favorite'>): Reading {
      const db = this.getDb();
      const newReading: Reading = {
          id: uuidv4(),
          timestamp: new Date().toISOString(),
          is_favorite: false,
          ...reading
      };
      db.readings.push(newReading);
      this.saveDb(db);
      return newReading;
  }

  toggleFavorite(readingId: string): Reading | null {
      const db = this.getDb();
      const reading = db.readings.find(r => r.id === readingId);
      if (reading) {
          reading.is_favorite = !reading.is_favorite;
          this.saveDb(db);
          return reading;
      }
      return null;
  }

  addCredits(userId: string, amount: number): User {
      const db = this.getDb();
      const user = db.users.find(u => u.id === userId);
      if (user) {
          user.credits = (user.credits || 0) + amount;
          this.saveDb(db);
          return user;
      }
      throw new Error("User not found");
  }

  recordTransaction(transaction: Omit<Transaction, 'id' | 'created_at'>): Transaction {
      const db = this.getDb();
      const newTransaction: Transaction = {
          id: uuidv4(),
          created_at: new Date().toISOString(),
          ...transaction
      };
      db.transactions.push(newTransaction);
      this.saveDb(db);
      return newTransaction;
  }
}

export const dbService = new LocalDatabase();
