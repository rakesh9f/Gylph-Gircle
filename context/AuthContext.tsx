
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { dbService, User, Reading } from '../services/db';

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
  googleLogin: (email: string, name: string, googleId: string) => Promise<void>;
  logout: () => void;
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

  const refreshUser = useCallback(() => {
    const userId = localStorage.getItem('gylph_user_id');
    if (userId) {
      const currentUser = dbService.getUser(userId);
      if (currentUser) {
        setUser(currentUser);
        setHistory(dbService.getReadings(currentUser.id));
      } else {
        localStorage.removeItem('gylph_user_id');
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
        await new Promise(r => setTimeout(r, 500)); // Simulate net delay
        const validUser = await dbService.validateUser(email, password);

        if (validUser) {
            localStorage.setItem('gylph_user_id', validUser.id);
            setUser(validUser);
            setHistory(dbService.getReadings(validUser.id));
            
            // Auto-set Admin Session if role matches (Fixes Redirect Loop)
            if (validUser.role === 'admin') {
                localStorage.setItem('glyph_admin_session', JSON.stringify({ 
                    user: validUser.email, 
                    role: 'admin', 
                    method: 'Standard Login' 
                }));
            }
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
        await new Promise(r => setTimeout(r, 500));
        
        try {
            const newUser = await dbService.createUser(email, name, password); // Service handles hashing
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

  const googleLogin = async (email: string, name: string, googleId: string) => {
      setIsLoading(true);
      try {
          const user = await dbService.createGoogleUser(email, name, googleId);
          localStorage.setItem('gylph_user_id', user.id);
          setUser(user);
          setHistory(dbService.getReadings(user.id));
          
          // Check for Admin Privilege via email
          if(user.role === 'admin') {
              localStorage.setItem('glyph_admin_session', JSON.stringify({ 
                  user: user.email, 
                  role: 'admin',
                  method: 'Google Login'
              }));
          }
      } catch (e) {
          console.error("Google Login Context Error", e);
      } finally {
          setIsLoading(false);
      }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('gylph_user_id');
    localStorage.removeItem('glyph_admin_session');
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
      googleLogin,
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
