
import { supabase } from './supabaseClient';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
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
  meta_data?: any;
}

export interface Transaction {
    id: string;
    user_id: string;
    amount: number;
    description: string;
    status: 'success' | 'failed' | 'pending';
    created_at: string;
}

class SupabaseDatabase {
  
  constructor() {}

  // --- USER METHODS ---

  async getUserProfile(userId: string): Promise<User | null> {
      const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();
      
      if (error) {
          console.warn("Supabase: Could not fetch user profile.", error.message);
          return null;
      }
      return data;
  }

  async createUserProfile(user: Partial<User>) {
      const { data, error } = await supabase
          .from('users')
          .insert([user])
          .select()
          .single();
      
      if (error) {
          console.error("Supabase: Error creating profile:", error.message);
          throw error;
      }
      return data;
  }

  // --- READINGS ---

  async getReadings(userId: string): Promise<Reading[]> {
      const { data, error } = await supabase
          .from('readings')
          .select('*')
          .eq('user_id', userId)
          .order('timestamp', { ascending: false });

      if (error) {
          console.error("Supabase: Error fetching readings:", error.message);
          return [];
      }
      return data || [];
  }

  async saveReading(reading: Omit<Reading, 'id' | 'timestamp' | 'is_favorite'>): Promise<Reading> {
      const newReading = {
          ...reading,
          timestamp: new Date().toISOString(),
          is_favorite: false,
          meta_data: reading.meta_data || {}
      };

      const { data, error } = await supabase
          .from('readings')
          .insert([newReading])
          .select()
          .single();

      if (error) throw error;
      return data;
  }

  async toggleFavorite(readingId: string, currentStatus: boolean): Promise<boolean> {
      const { error } = await supabase
          .from('readings')
          .update({ is_favorite: !currentStatus })
          .eq('id', readingId);
          
      if (error) {
          console.error("Error toggling favorite:", error);
          return currentStatus;
      }
      return !currentStatus;
  }

  // --- CREDITS & TRANSACTIONS ---

  async addCredits(userId: string, amount: number): Promise<User> {
      // 1. Get current credits
      const user = await this.getUserProfile(userId);
      if (!user) throw new Error("User not found");

      const newCredits = (user.credits || 0) + amount;

      // 2. Update
      const { data, error } = await supabase
          .from('users')
          .update({ credits: newCredits })
          .eq('id', userId)
          .select()
          .single();

      if (error) throw error;
      return data;
  }

  async recordTransaction(transaction: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction> {
      const newTx = {
          ...transaction,
          created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
          .from('transactions')
          .insert([newTx])
          .select()
          .single();

      if (error) throw error;
      return data;
  }

  // --- GENERIC ADMIN METHODS ---
  
  async getAll(table: string) {
      const { data, error } = await supabase.from(table).select('*');
      if (error) {
          console.warn(`Failed to fetch table ${table}: ${error.message}`);
          return [];
      }
      return data || [];
  }

  async updateEntry(table: string, id: string | number, updates: any) {
      const { error } = await supabase.from(table).update(updates).eq('id', id);
      if (error) throw error;
  }

  async createEntry(table: string, entry: any) {
      const { data, error } = await supabase.from(table).insert([entry]).select();
      if (error) throw error;
      return data;
  }
}

export const dbService = new SupabaseDatabase();
