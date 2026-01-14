
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { dbService, User, Reading } from '../services/db';
import { ACTION_POINTS, SIGILS, GameStats } from '../services/gamificationConfig';

interface PendingReading {
  type: Reading['type'];
  title: string;
  content: string;
  subtitle?: string;
  image_url?: string;
}

// Extend User for Gamification
interface GamifiedUser extends User {
  gamification?: {
    karma: number;
    streak: number;
    lastVisit: string;
    readingsCount: number;
    unlockedSigils: string[];
  };
}

interface AuthContextType {
  user: GamifiedUser | null;
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
  // Gamification Actions
  awardKarma: (amount: number, actionName?: string) => void;
  newSigilUnlocked: string | null; // For UI notification
  clearSigilNotification: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useUser = useAuth;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<GamifiedUser | null>(null);
  const [history, setHistory] = useState<Reading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingReading, setPendingReading] = useState<PendingReading | null>(null);
  const [newSigilUnlocked, setNewSigilUnlocked] = useState<string | null>(null);

  // --- GAMIFICATION LOGIC ---
  const checkDailyStreak = (currentUser: GamifiedUser) => {
      const today = new Date().toDateString();
      const lastVisit = currentUser.gamification?.lastVisit ? new Date(currentUser.gamification.lastVisit).toDateString() : null;
      
      let newStreak = currentUser.gamification?.streak || 0;
      let karmaAwarded = 0;

      // Initialize if missing
      if (!currentUser.gamification) {
          currentUser.gamification = { karma: 0, streak: 1, lastVisit: new Date().toISOString(), readingsCount: 0, unlockedSigils: [] };
          return currentUser;
      }

      if (lastVisit !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          
          if (lastVisit === yesterday.toDateString()) {
              newStreak += 1;
          } else {
              newStreak = 1; // Reset if broken
          }
          
          currentUser.gamification.streak = newStreak;
          currentUser.gamification.lastVisit = new Date().toISOString();
          currentUser.gamification.karma += ACTION_POINTS.DAILY_LOGIN;
          karmaAwarded = ACTION_POINTS.DAILY_LOGIN;
          
          // Determine logic to persist this update immediately would go here
          // For now, we rely on the state update loop or dbService update
      }
      return currentUser;
  };

  const checkSigils = (u: GamifiedUser) => {
      if (!u.gamification) return;
      const stats: GameStats = u.gamification;
      
      SIGILS.forEach(sigil => {
          if (!stats.unlockedSigils.includes(sigil.id) && sigil.condition(stats)) {
              stats.unlockedSigils.push(sigil.id);
              setNewSigilUnlocked(sigil.name);
              // Audio Cue
              if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
          }
      });
  };

  const awardKarma = useCallback((amount: number) => {
      if (!user) return;
      
      setUser(prev => {
          if (!prev) return null;
          const updated = { ...prev };
          if (!updated.gamification) updated.gamification = { karma: 0, streak: 1, lastVisit: new Date().toISOString(), readingsCount: 0, unlockedSigils: [] };
          
          updated.gamification.karma += amount;
          checkSigils(updated);
          
          // Persist to local storage mock (In a real app, API call)
          localStorage.setItem(`glyph_gamify_${updated.id}`, JSON.stringify(updated.gamification));
          
          return updated;
      });
  }, [user]);

  // --- END GAMIFICATION LOGIC ---

  const refreshUser = useCallback(() => {
    const userId = localStorage.getItem('gylph_user_id');
    if (userId) {
      const dbUser = dbService.getUser(userId);
      if (dbUser) {
        // Merge Gamification Data from LocalStorage (Simulated separate DB table)
        const gamifyData = localStorage.getItem(`glyph_gamify_${userId}`);
        let fullUser: GamifiedUser = { ...dbUser };
        
        if (gamifyData) {
            fullUser.gamification = JSON.parse(gamifyData);
        } else {
            fullUser.gamification = { karma: 0, streak: 1, lastVisit: new Date().toISOString(), readingsCount: 0, unlockedSigils: [] };
        }

        fullUser = checkDailyStreak(fullUser);
        localStorage.setItem(`glyph_gamify_${userId}`, JSON.stringify(fullUser.gamification));

        setUser(fullUser);
        setHistory(dbService.getReadings(dbUser.id));
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
        await new Promise(r => setTimeout(r, 500)); 
        const validUser = await dbService.validateUser(email, password);

        if (validUser) {
            localStorage.setItem('gylph_user_id', validUser.id);
            // Trigger refresh to load gamification data
            setTimeout(refreshUser, 50); 
            
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
            const newUser = await dbService.createUser(email, name, password);
            localStorage.setItem('gylph_user_id', newUser.id);
            // Init Gamification
            const gamifyInit = { karma: 100, streak: 1, lastVisit: new Date().toISOString(), readingsCount: 0, unlockedSigils: [] };
            localStorage.setItem(`glyph_gamify_${newUser.id}`, JSON.stringify(gamifyInit));
            
            setTimeout(refreshUser, 50);
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
          setTimeout(refreshUser, 50);
          
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
      setUser(prev => prev ? { ...prev, credits: updatedUser.credits } : null);
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
      
      // Update Gamification
      setUser(prev => {
          if (!prev || !prev.gamification) return prev;
          const updated = { ...prev };
          updated.gamification!.readingsCount += 1;
          updated.gamification!.karma += ACTION_POINTS.READING_COMPLETE;
          
          checkSigils(updated);
          localStorage.setItem(`glyph_gamify_${updated.id}`, JSON.stringify(updated.gamification));
          return updated;
      });
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

  const clearSigilNotification = () => setNewSigilUnlocked(null);

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
      commitPendingReading,
      awardKarma,
      newSigilUnlocked,
      clearSigilNotification
    }}>
      {children}
    </AuthContext.Provider>
  );
};
