
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { dbService, User, Reading } from '../services/db';
import { encryptData } from '../services/security'; // Reusing security for simple hashing

interface PendingReading {
  type: Reading['type'];
  title: string;
  content: string;
  subtitle?: string;
  image_url?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  history: Reading[];
  credits: number;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  // Compatibility with existing components
  refreshUser: () => void;
  addCredits: (amount: number) => void;
  saveReading: (reading: PendingReading) => void;
  toggleFavorite: (readingId: string) => void;
  pendingReading: PendingReading | null;
  setPendingReading: (reading: PendingReading | null) => void;
  commitPendingReading: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Compatibility hook for existing code using useUser
export const useUser = useAuth;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [history, setHistory] = useState<Reading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingReading, setPendingReading] = useState<PendingReading | null>(null);

  // Helper to hash passwords (using AES encryption for demo security)
  const hashPassword = async (password: string) => {
    // In a real app, use bcrypt/argon2. Here we use our encryption util for consistency/demo.
    // We are essentially encrypting the password with the device key.
    // For local-only auth, checking against stored match works.
    // For better mock, we'll just store plain text in dbService in this context? 
    // No, let's just use simple base64 for demo to avoid complex async crypto issues in sync db calls, 
    // OR allow the db service to handle raw strings and we validate logic here.
    return btoa(password); // Simple encoding for demo
  };

  const refreshUser = useCallback(() => {
    const userId = localStorage.getItem('gylph_user_id');
    if (userId) {
      const currentUser = dbService.getUser(userId);
      if (currentUser) {
        setUser(currentUser);
        setHistory(dbService.getReadings(currentUser.id));
      } else {
        localStorage.removeItem('gylph_user_id'); // Invalid ID cleanup
        setUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
        // Simulate network delay
        await new Promise(r => setTimeout(r, 800));
        
        const existingUser = dbService.getUserByEmail(email);
        const inputHash = await hashPassword(password);

        if (existingUser && existingUser.password_hash === inputHash) {
            localStorage.setItem('gylph_user_id', existingUser.id);
            setUser(existingUser);
            setHistory(dbService.getReadings(existingUser.id));
        } else {
            throw new Error("Invalid email or password");
        }
    } catch (e: any) {
        setError(e.message);
        throw e;
    } finally {
        setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
        await new Promise(r => setTimeout(r, 800));
        const passHash = await hashPassword(password);
        
        try {
            const newUser = dbService.createUser(email, name, passHash);
            localStorage.setItem('gylph_user_id', newUser.id);
            setUser(newUser);
            setHistory([]);
        } catch (e: any) {
            throw new Error("User already exists with this email");
        }
    } catch (e: any) {
        setError(e.message);
        throw e;
    } finally {
        setIsLoading(false);
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('gylph_user_id');
    setUser(null);
    setHistory([]);
  }, []);

  const addCredits = useCallback((amount: number) => {
    if (user) {
      const updatedUser = dbService.addCredits(user.id, amount);
      setUser(updatedUser);
    }
  }, [user]);

  const saveReading = useCallback((readingData: PendingReading) => {
    if (user) {
      const saved = dbService.saveReading({
        ...readingData,
        user_id: user.id,
        paid: true,
      });
      setHistory(prev => [saved, ...prev]);
    }
  }, [user]);

  const commitPendingReading = useCallback(() => {
    if (pendingReading && user) {
      saveReading(pendingReading);
      setPendingReading(null);
    }
  }, [pendingReading, user, saveReading]);

  const toggleFavorite = useCallback((readingId: string) => {
    const updated = dbService.toggleFavorite(readingId);
    if (updated) {
      setHistory(prev => prev.map(r => r.id === readingId ? updated : r));
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      credits: user?.credits || 0,
      isLoading,
      error,
      history,
      login,
      register,
      logout,
      refreshUser,
      addCredits,
      saveReading,
      toggleFavorite,
      pendingReading,
      setPendingReading,
      commitPendingReading
    }}>
      {children}
    </AuthContext.Provider>
  );
};
