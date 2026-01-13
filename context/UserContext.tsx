import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { dbService, User, Reading } from '../services/db';

interface PendingReading {
  type: Reading['type'];
  title: string;
  content: string;
  subtitle?: string;
  image_url?: string;
}

interface UserContextType {
  user: User | null;
  credits: number;
  isLoading: boolean;
  history: Reading[];
  refreshUser: () => void;
  addCredits: (amount: number) => void;
  saveReading: (reading: PendingReading) => void;
  toggleFavorite: (readingId: string) => void;
  // Pending reading mechanism to bridge generation -> payment -> save
  pendingReading: PendingReading | null;
  setPendingReading: (reading: PendingReading | null) => void;
  commitPendingReading: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [history, setHistory] = useState<Reading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingReading, setPendingReading] = useState<PendingReading | null>(null);

  const refreshUser = useCallback(() => {
    try {
      const currentUser = dbService.initializeUser();
      setUser(currentUser);
      const userReadings = dbService.getReadings(currentUser.id);
      setHistory(userReadings);
    } catch (e) {
      console.error("Failed to initialize user", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

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
        paid: true, // Assuming saving happens after payment or unlock
      });
      setHistory(prev => [saved, ...prev]);
    }
  }, [user]);

  const commitPendingReading = useCallback(() => {
    if (pendingReading && user) {
      saveReading(pendingReading);
      setPendingReading(null); // Clear after saving
    }
  }, [pendingReading, user, saveReading]);

  const toggleFavorite = useCallback((readingId: string) => {
    const updated = dbService.toggleFavorite(readingId);
    if (updated) {
      setHistory(prev => prev.map(r => r.id === readingId ? updated : r));
    }
  }, []);

  return (
    <UserContext.Provider value={{
      user,
      credits: user?.credits || 0,
      isLoading,
      history,
      refreshUser,
      addCredits,
      saveReading,
      toggleFavorite,
      pendingReading,
      setPendingReading,
      commitPendingReading
    }}>
      {children}
    </UserContext.Provider>
  );
};
