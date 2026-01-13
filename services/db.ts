
import { v4 as uuidv4 } from 'uuid';
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

const DB_KEY = 'gylph_circle_prod_db_v5'; // Version bump for security fix

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
    this.seedAdmins();
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

  // --- FORCE SEED ADMINS ---
  private seedAdmins() {
    const db = this.getDb();
    
    // 1. Clean old admins to ensure fresh state (Security Requirement)
    const nonAdminUsers = db.users.filter(u => u.role !== 'admin');
    
    // 2. Define Admins (using Pre-computed Hashes to avoid hardcoded plain text)
    const admin1: User = {
        id: 'admin-master-001',
        email: 'master@gylphcircle.com',
        name: 'Master Admin',
        password_hash: MASTER_HASH, 
        role: 'admin',
        credits: 9999,
        created_at: new Date().toISOString()
    };

    const admin2: User = {
        id: 'admin-staff-002',
        email: 'admin@gylphcircle.com',
        name: 'Staff Admin',
        password_hash: ADMIN_HASH,
        role: 'admin',
        credits: 9999,
        created_at: new Date().toISOString()
    };

    // 3. Re-insert
    // We filter out any user that matches these emails to avoid dupes, then append
    const cleanUsers = nonAdminUsers.filter(u => u.email !== admin1.email && u.email !== admin2.email);
    cleanUsers.push(admin1, admin2);
    
    db.users = cleanUsers;
    this.saveDb(db);
    console.log("✅ FORCE CREATED 2 ADMINS: master@..., admin@...");
  }

  // --- AUTH METHODS ---
  
  async validateUser(email: string, passInput: string): Promise<User | null> {
    const db = this.getDb();
    const inputHash = await hashData(passInput);
    
    const user = db.users.find(u => u.email === email && u.password_hash === inputHash);
    
    if (user) {
        console.log(`✅ Login Success: ${email}`);
        return user;
    }
    
    console.warn(`❌ Login Failed: ${email}`);
    return null;
  }

  async createGoogleUser(email: string, name: string, googleId: string): Promise<User> {
      const db = this.getDb();
      let user = db.users.find(u => u.email === email);
      
      if (user) {
          // Update existing user with Google ID
          if (!user.google_id) {
              user.google_id = googleId;
              this.saveDb(db);
          }
          return user;
      }

      // Create new Google User
      const newUser: User = {
          id: generateId(),
          email,
          name,
          role: 'user', // Default role
          credits: 10,  // Welcome bonus
          created_at: new Date().toISOString(),
          google_id: googleId
      };

      // Special Case: Specific developer email gets admin automatically
      if (email === 'rakesh9f@gmail.com') {
          newUser.role = 'admin';
          newUser.credits = 9999;
      }

      db.users.push(newUser);
      this.saveDb(db);
      return newUser;
  }

  getAllUsers(): User[] {
      return this.getDb().users;
  }

  // --- GENERIC METHODS ---

  async createUser(email: string, name: string, plainPass: string): Promise<User> {
    const db = this.getDb();
    if (db.users.find(u => u.email === email)) {
        throw new Error("User already exists");
    }

    const passwordHash = await hashData(plainPass);

    const newUser: User = {
        id: generateId(),
        email,
        name,
        password_hash: passwordHash,
        credits: 0,
        created_at: new Date().toISOString(),
        role: 'user'
    };

    db.users.push(newUser);
    this.saveDb(db);
    return newUser;
  }

  getUser(userId: string): User | undefined {
    return this.getDb().users.find(u => u.id === userId);
  }

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

  getReadings(userId: string): Reading[] {
    return this.getDb().readings
      .filter(r => r.user_id === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
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

  recordTransaction(transaction: Omit<Transaction, 'id' | 'timestamp'>): Transaction {
    const db = this.getDb();
    const newTransaction: Transaction = {
      ...transaction,
      id: generateId(),
      timestamp: new Date().toISOString()
    };
    db.transactions.push(newTransaction);
    this.saveDb(db);
    return newTransaction;
  }
}

export const dbService = new LocalDatabase();
