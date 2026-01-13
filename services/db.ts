
import { hashData, MASTER_HASH, ADMIN_HASH } from './security';

export interface User {
  id: string;
  email: string;
  name?: string;
  password_hash?: string;
  role?: 'user' | 'admin';
  credits: number;
  created_at: string;
  google_id?: string;
}

export interface Reading {
  id: string;
  user_id: string;
  type: 'tarot' | 'palmistry' | 'face-reading' | 'numerology' | 'astrology' | 'remedy';
  title: string;
  content: string;
  subtitle?: string;
  image_url?: string;
  paid: boolean;
  is_favorite: boolean;
  timestamp: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  status: 'success' | 'failed';
  timestamp: string;
}

interface DatabaseSchema {
  users: User[];
  readings: Reading[];
  transactions: Transaction[];
}

const DB_KEY = 'gylph_circle_prod_db_v6'; // Version bump for Emergency Fix

const INITIAL_DB: DatabaseSchema = {
  users: [],
  readings: [],
  transactions: []
};

const generateId = () => {
  return 'id-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
};

class LocalDatabase {
  constructor() {
    this.forceSeedAdmins();
  }

  private getDb(): DatabaseSchema {
    const stored = localStorage.getItem(DB_KEY);
    if (!stored) {
      this.saveDb(INITIAL_DB);
      return JSON.parse(JSON.stringify(INITIAL_DB));
    }
    return JSON.parse(stored);
  }

  private saveDb(data: DatabaseSchema): void {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
  }

  // --- 🚨 FORCE SEED ADMINS (RUNS EVERY START) ---
  public forceSeedAdmins() {
    console.log("🚀 DB: FORCE CREATING ADMINS...");
    const db = this.getDb();
    
    // 1. DELETE OLD ADMINS (Fresh Start)
    db.users = db.users.filter(u => u.role !== 'admin');
    
    // 2. INSERT ADMINS (Using Hashes for Security)
    const admins: User[] = [
        {
            id: 'admin-master-001',
            email: 'master@gylphcircle.com',
            name: 'Master Admin',
            password_hash: MASTER_HASH, // Hashed 'master123'
            role: 'admin',
            credits: 9999,
            created_at: new Date().toISOString()
        },
        {
            id: 'admin-staff-002',
            email: 'admin@gylphcircle.com',
            name: 'Staff Admin',
            password_hash: ADMIN_HASH, // Hashed 'admin123'
            role: 'admin',
            credits: 9999,
            created_at: new Date().toISOString()
        }
    ];

    db.users.push(...admins);
    this.saveDb(db);
    console.log("✅ ADMINS CREATED IN DB: master@..., admin@...");
  }

  // --- AUTH METHODS ---
  
  async validateUser(email: string, passInput: string): Promise<User | null> {
    const db = this.getDb();
    const inputHash = await hashData(passInput);
    
    const user = db.users.find(u => u.email === email && u.password_hash === inputHash);
    
    if (user) {
        console.log(`✅ Login Success: ${email} (${user.role})`);
        return user;
    }
    
    // Fallback: Check for google users who might be admins
    const googleUser = db.users.find(u => u.email === email && u.google_id);
    if(googleUser && googleUser.role === 'admin') {
         return googleUser;
    }

    console.warn(`❌ Login Failed: ${email}`);
    return null;
  }

  // Create or Update Google User
  async createGoogleUser(email: string, name: string, googleId: string): Promise<User> {
      const db = this.getDb();
      let user = db.users.find(u => u.email === email);
      
      if (user) {
          if (!user.google_id) {
              user.google_id = googleId;
              this.saveDb(db);
          }
          return user;
      }

      const newUser: User = {
          id: generateId(),
          email,
          name,
          role: 'user',
          credits: 10,
          created_at: new Date().toISOString(),
          google_id: googleId
      };

      // 🚨 AUTO ADMIN FOR RAKESH
      if (email === 'rakesh9f@gmail.com') {
          newUser.role = 'admin';
          newUser.credits = 99999;
          console.log("👑 Rakesh Detected: Granting Admin Role");
      }

      db.users.push(newUser);
      this.saveDb(db);
      return newUser;
  }

  getAllUsers(): User[] {
      return this.getDb().users;
  }

  getUser(userId: string): User | undefined {
    return this.getDb().users.find(u => u.id === userId);
  }

  getReadings(userId: string): Reading[] {
    return this.getDb().readings.filter(r => r.user_id === userId);
  }

  // Generic helpers needed for other components
  addCredits(userId: string, amount: number): User {
    const db = this.getDb();
    const idx = db.users.findIndex(u => u.id === userId);
    if (idx > -1) {
        db.users[idx].credits += amount;
        this.saveDb(db);
        return db.users[idx];
    }
    throw new Error('User not found');
  }

  saveReading(reading: Omit<Reading, 'id' | 'timestamp' | 'is_favorite'>): Reading {
    const db = this.getDb();
    const newReading: Reading = {
      ...reading,
      id: generateId(),
      is_favorite: false,
      timestamp: new Date().toISOString()
    };
    db.readings.unshift(newReading);
    this.saveDb(db);
    return newReading;
  }

  toggleFavorite(readingId: string): Reading | null {
    const db = this.getDb();
    const r = db.readings.find(x => x.id === readingId);
    if (r) {
        r.is_favorite = !r.is_favorite;
        this.saveDb(db);
        return r;
    }
    return null;
  }

  async createUser(email: string, name: string, plainPass: string): Promise<User> {
      const db = this.getDb();
      if(db.users.find(u => u.email === email)) throw new Error("User Exists");
      const hash = await hashData(plainPass);
      const newUser: User = {
          id: generateId(),
          email, name, password_hash: hash, role: 'user', credits: 0, created_at: new Date().toISOString()
      };
      db.users.push(newUser);
      this.saveDb(db);
      return newUser;
  }

  recordTransaction(transaction: Omit<Transaction, 'id' | 'timestamp'>): Transaction {
      const db = this.getDb();
      const t = { ...transaction, id: generateId(), timestamp: new Date().toISOString() };
      db.transactions.push(t);
      this.saveDb(db);
      return t;
  }
}

export const dbService = new LocalDatabase();
