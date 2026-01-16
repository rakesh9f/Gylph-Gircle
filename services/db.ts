
import { v4 as uuidv4 } from 'uuid';
import { sqliteService } from './sqliteService';

// Types (Keep existing types)
export interface User {
  id: string;
  email: string;
  name: string;
  password?: string;
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

// Wrapper class that now bridges logic to sqliteService
class LocalDatabase {
  
  constructor() {
    // Note: sqliteService.init() is called by DbContext provider.
    // Methods here assume init is done or in progress.
  }

  nuclearReset() {
    console.warn("Nuclear reset logic now handled by SQLiteService migration checks.");
  }

  validateUser(email: string, pass: string): User | null {
    const users: User[] = sqliteService.getAll('users');
    const user = users.find(u => u.email === email && u.password === pass);
    return user || null;
  }

  getAdminByEmail(email: string): User | null {
    const users: User[] = sqliteService.getAll('users');
    return users.find(u => u.email === email && u.role === 'admin') || null;
  }

  getAllUsers(): User[] {
    return sqliteService.getAll('users');
  }

  getUser(id: string): User | undefined {
    // getById returns generic object, cast to User
    return sqliteService.getById('users', id) as User;
  }

  async createUser(email: string, name: string, password?: string): Promise<User> {
      const users: User[] = sqliteService.getAll('users');
      if (users.find(u => u.email === email)) {
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
      
      // Await persistence
      await sqliteService.insert('users', newUser);
      return newUser;
  }

  async createGoogleUser(email: string, name: string, googleId: string): Promise<User> {
      const users: User[] = sqliteService.getAll('users');
      let user = users.find(u => u.email === email);
      
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
          
          // Auto-Admin logic
          if(email === 'rakesh9f@gmail.com') {
              user.role = 'admin';
              user.credits = 99999;
          }
          
          await sqliteService.insert('users', user);
      }
      return user;
  }

  getReadings(userId: string): Reading[] {
      const readings: Reading[] = sqliteService.getAll('readings');
      // Note: Filter in memory for simplicity with current generic getAll
      return readings
        .filter(r => r.user_id === userId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Updated to async to ensure persistence awaits
  async saveReading(reading: Omit<Reading, 'id' | 'timestamp' | 'is_favorite'>): Promise<Reading> {
      const newReading: Reading = {
          id: uuidv4(),
          timestamp: new Date().toISOString(),
          is_favorite: false,
          ...reading
      };
      await sqliteService.insert('readings', newReading);
      return newReading;
  }

  async toggleFavorite(readingId: string): Promise<Reading | null> {
      const reading = sqliteService.getById('readings', readingId) as Reading;
      if (reading) {
          const newVal = !reading.is_favorite;
          await sqliteService.update('readings', readingId, { is_favorite: newVal ? 1 : 0 }); // Store boolean as int/bit
          return { ...reading, is_favorite: newVal };
      }
      return null;
  }

  async addCredits(userId: string, amount: number): Promise<User> {
      const user = this.getUser(userId);
      if (user) {
          const newCredits = (user.credits || 0) + amount;
          await sqliteService.update('users', userId, { credits: newCredits });
          return { ...user, credits: newCredits };
      }
      throw new Error("User not found");
  }

  async recordTransaction(transaction: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction> {
      const newTransaction: Transaction = {
          id: uuidv4(),
          created_at: new Date().toISOString(),
          ...transaction
      };
      await sqliteService.insert('transactions', newTransaction);
      return newTransaction;
  }
}

export const dbService = new LocalDatabase();
