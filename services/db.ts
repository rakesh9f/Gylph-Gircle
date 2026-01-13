
import { v4 as uuidv4 } from 'uuid';

// Types representing our Database Schema
export interface User {
  id: string;
  email: string; // Changed to required for auth
  name?: string; // Added for personalization
  password_hash?: string; // Added for auth
  credits: number;
  created_at: string;
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

// Database Structure
interface DatabaseSchema {
  users: User[];
  readings: Reading[];
  transactions: Transaction[];
}

const DB_KEY = 'gylph_circle_prod_db_v2'; // Version bump

const INITIAL_DB: DatabaseSchema = {
  users: [],
  readings: [],
  transactions: []
};

const generateId = () => {
  return typeof crypto !== 'undefined' && crypto.randomUUID 
    ? crypto.randomUUID() 
    : 'id-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
};

class LocalDatabase {
  private getDb(): DatabaseSchema {
    const stored = localStorage.getItem(DB_KEY);
    if (!stored) {
      this.saveDb(INITIAL_DB);
      return INITIAL_DB;
    }
    return JSON.parse(stored);
  }

  private saveDb(data: DatabaseSchema): void {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
  }

  // --- USER OPERATIONS ---

  // Create a new user with explicit details
  createUser(email: string, name: string, passwordHash: string): User {
    const db = this.getDb();
    const existing = db.users.find(u => u.email === email);
    if (existing) {
        throw new Error("User already exists");
    }

    const newUser: User = {
        id: generateId(),
        email,
        name,
        password_hash: passwordHash,
        credits: 0,
        created_at: new Date().toISOString()
    };

    db.users.push(newUser);
    this.saveDb(db);
    return newUser;
  }

  getUserByEmail(email: string): User | undefined {
    const db = this.getDb();
    return db.users.find(u => u.email === email);
  }

  getUser(userId: string): User | undefined {
    const db = this.getDb();
    return db.users.find(u => u.id === userId);
  }

  addCredits(userId: string, amount: number): User {
    const db = this.getDb();
    const userIndex = db.users.findIndex(u => u.id === userId);
    if (userIndex > -1) {
      db.users[userIndex].credits += amount;
      this.saveDb(db);
      return db.users[userIndex];
    }
    throw new Error('User not found');
  }

  // --- READING OPERATIONS ---

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
    const db = this.getDb();
    return db.readings
      .filter(r => r.user_id === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  getFavorites(userId: string): Reading[] {
    return this.getReadings(userId).filter(r => r.is_favorite);
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

  // --- TRANSACTION OPERATIONS ---

  recordTransaction(txn: Omit<Transaction, 'id' | 'timestamp'>): Transaction {
    const db = this.getDb();
    const newTxn: Transaction = {
      ...txn,
      id: generateId(),
      timestamp: new Date().toISOString()
    };
    db.transactions.push(newTxn);
    this.saveDb(db);
    return newTxn;
  }
}

export const dbService = new LocalDatabase();
