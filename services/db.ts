import { v4 as uuidv4 } from 'uuid';

// Types representing our Database Schema
export interface User {
  id: string;
  email: string | null;
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
  image_url?: string; // For charts or card images
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

const DB_KEY = 'gylph_circle_prod_db_v1';

// Initial Empty State
const INITIAL_DB: DatabaseSchema = {
  users: [],
  readings: [],
  transactions: []
};

// Helper to generate UUIDs (simple fallback if uuid pkg issues)
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

  // Get or Create a user for the current device
  initializeUser(): User {
    const db = this.getDb();
    let userId = localStorage.getItem('gylph_user_id');
    
    let user = userId ? db.users.find(u => u.id === userId) : null;

    if (!user) {
      // Create new user
      user = {
        id: generateId(),
        email: null,
        credits: 0, // Start with 0 or free credits
        created_at: new Date().toISOString()
      };
      db.users.push(user);
      this.saveDb(db);
      localStorage.setItem('gylph_user_id', user.id);
    }

    return user;
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
    db.readings.unshift(newReading); // Add to top
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
