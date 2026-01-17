
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { dbService, User, Reading } from '../services/db';
import { ACTION_POINTS, SIGILS, GameStats } from '../services/gamificationConfig';

interface PendingReading {
  type: Reading['type'];
  title: string;
  content: string;
  subtitle?: string;
  image_url?: string;
  meta_data?: any;
}

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
  awardKarma: (amount: number, actionName?: string) => void;
  newSigilUnlocked: string | null; 
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

  // --- SYNC GAMIFICATION (Local Storage for UI speed) ---
  const syncGamification = (dbUser: User): GamifiedUser => {
      const gamifyData = localStorage.getItem(`glyph_gamify_${dbUser.id}`);
      let fullUser: GamifiedUser = { ...dbUser };
      
      if (gamifyData) {
          fullUser.gamification = JSON.parse(gamifyData);
      } else {
          fullUser.gamification = { karma: 0, streak: 1, lastVisit: new Date().toISOString(), readingsCount: 0, unlockedSigils: [] };
      }
      return checkDailyStreak(fullUser);
  };

  const checkDailyStreak = (currentUser: GamifiedUser) => {
      const today = new Date().toDateString();
      const lastVisit = currentUser.gamification?.lastVisit ? new Date(currentUser.gamification.lastVisit).toDateString() : null;
      
      let newStreak = currentUser.gamification?.streak || 0;

      if (lastVisit !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          
          if (lastVisit === yesterday.toDateString()) {
              newStreak += 1;
          } else {
              newStreak = 1; 
          }
          
          if (currentUser.gamification) {
              currentUser.gamification.streak = newStreak;
              currentUser.gamification.lastVisit = new Date().toISOString();
              currentUser.gamification.karma += ACTION_POINTS.DAILY_LOGIN;
          }
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
              if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
          }
      });
  };

  // --- MAIN REFRESH LOGIC ---
  const refreshUser = useCallback(async () => {
    // Check if Supabase keys are present
    if (!isSupabaseConfigured()) {
        console.warn("Supabase not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env");
        setIsLoading(false);
        return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
        let profile = await dbService.getUserProfile(session.user.id);
        
        // Auto-create profile if missing (e.g., first Google Login)
        if (!profile) {
            try {
                profile = await dbService.createUserProfile({
                    id: session.user.id,
                    email: session.user.email!,
                    name: session.user.user_metadata.full_name || 'Seeker',
                    role: 'user',
                    credits: 10
                }) as User;
            } catch (e) {
                console.error("Failed to recover profile:", e);
            }
        }

        if (profile) {
            const gamifiedUser = syncGamification(profile);
            setUser(gamifiedUser);
            
            const readings = await dbService.getReadings(profile.id);
            setHistory(readings);

            // Set Admin Session for specialized routes
            if (profile.role === 'admin') {
                localStorage.setItem('glyph_admin_session', JSON.stringify({ 
                    user: profile.email, 
                    role: 'admin', 
                    method: 'Supabase Auth' 
                }));
            }
        }
    } else {
        setUser(null);
        setHistory([]);
        localStorage.removeItem('glyph_admin_session');
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refreshUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        refreshUser();
    });

    return () => subscription.unsubscribe();
  }, [refreshUser]);

  // --- ACTIONS ---

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        setError(error.message);
        setIsLoading(false);
        throw error;
    }
    // refreshUser triggered by listener
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    // 1. SignUp with Supabase Auth
    const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: { data: { full_name: name } }
    });

    if (error) {
        setError(error.message);
        setIsLoading(false);
        throw error;
    }

    // 2. Create Profile immediately in public.users
    if (data.user) {
        try {
            await dbService.createUserProfile({
                id: data.user.id,
                email: email,
                name: name,
                role: 'user', 
                credits: 50 // Signup Bonus
            });
        } catch (dbError: any) {
            console.error("Profile creation failed:", dbError);
            // Don't block flow, profile can be created on login
        }
    }
  };

  const googleLogin = async (email?: string, name?: string, googleId?: string) => {
      setIsLoading(true);
      // Initiate OAuth
      const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: window.location.origin }
      });
      
      if (error) {
          console.error("Google Auth Error:", error);
          setIsLoading(false);
          setError(error.message);
      }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('glyph_admin_session');
    setUser(null);
    setHistory([]);
  };

  const addCredits = useCallback(async (amount: number) => {
    if (user) {
      try {
        const updated = await dbService.addCredits(user.id, amount);
        setUser(prev => prev ? { ...prev, credits: updated.credits } : null);
      } catch (error) {
        console.error("Failed to add credits:", error);
      }
    }
  }, [user]);

  const saveReading = useCallback(async (readingData: PendingReading) => {
    if (user) {
      try {
        const saved = await dbService.saveReading({
          ...readingData,
          user_id: user.id,
          paid: true,
        });
        setHistory(prev => [saved, ...prev]);
        awardKarma(ACTION_POINTS.READING_COMPLETE);
      } catch (error) {
        console.error("Failed to save reading:", error);
      }
    }
  }, [user]);

  const commitPendingReading = useCallback(() => {
    if (pendingReading && user) {
      saveReading(pendingReading);
      setPendingReading(null);
    }
  }, [pendingReading, user, saveReading]);

  const toggleFavorite = useCallback(async (readingId: string) => {
    const reading = history.find(r => r.id === readingId);
    if (reading) {
        const newStatus = await dbService.toggleFavorite(readingId, reading.is_favorite);
        setHistory(prev => prev.map(r => r.id === readingId ? { ...r, is_favorite: newStatus } : r));
    }
  }, [history]);

  const awardKarma = useCallback((amount: number) => {
      if (!user) return;
      setUser(prev => {
          if (!prev) return null;
          const updated = { ...prev };
          if (!updated.gamification) updated.gamification = { karma: 0, streak: 1, lastVisit: new Date().toISOString(), readingsCount: 0, unlockedSigils: [] };
          
          updated.gamification.karma += amount;
          checkSigils(updated);
          localStorage.setItem(`glyph_gamify_${updated.id}`, JSON.stringify(updated.gamification));
          return updated;
      });
  }, [user]);

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
