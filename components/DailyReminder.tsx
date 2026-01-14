
import React, { useEffect } from 'react';
import { useNotifications } from './PushNotifications';
import { useDb } from '../hooks/useDb';

const DailyReminder: React.FC = () => {
  const { sendNotification, permission } = useNotifications();
  const { db } = useDb();

  useEffect(() => {
    // Check loop
    const checkNotifications = () => {
      if (permission !== 'granted') return;

      const now = new Date();
      const todayStr = now.toDateString();
      
      // --- 1. Daily Horoscope Reminder (8 AM) ---
      // "Configure daily reminders for horoscope readings (e.g., 8 AM daily)"
      const lastDaily = localStorage.getItem('glyph_daily_sent_date');
      // Check if it's past 8 AM and we haven't sent it today
      if (now.getHours() >= 8 && lastDaily !== todayStr) {
         sendNotification(
            "🔮 Horoscope Ready",
            "The stars have aligned. Tap to reveal your daily guidance."
         );
         localStorage.setItem('glyph_daily_sent_date', todayStr);
      }

      // --- 2. New Store Item Notification (Simulated at 12 PM) ---
      // "Notifications for new store items"
      const lastStore = localStorage.getItem('glyph_store_sent_date');
      // Trigger around noon to avoid spamming at 8 AM
      if (now.getHours() >= 12 && lastStore !== todayStr) {
          // Check for active store items in the mock DB
          const activeItems = db.store_items?.filter((i: any) => i.status === 'active') || [];
          
          if (activeItems.length > 0) {
              // Pick a random item to feature
              const item = activeItems[Math.floor(Math.random() * activeItems.length)];
              sendNotification(
                  "✨ New in Sanctuary",
                  `${item.name} is now available. Discover its mystical properties.`
              );
              localStorage.setItem('glyph_store_sent_date', todayStr);
          }
      }
    };

    // Run check immediately on mount, then every minute to catch the time
    checkNotifications();
    const interval = setInterval(checkNotifications, 60000);

    return () => clearInterval(interval);
  }, [permission, sendNotification, db]);

  // Simulate a welcome notification if it's the very first visit with permissions
  useEffect(() => {
     const hasWelcomed = localStorage.getItem('glyph_welcome_push');
     if (permission === 'granted' && !hasWelcomed) {
         setTimeout(() => {
             sendNotification(
                 "✨ Welcome Seeker", 
                 "Your spiritual journey has begun. You will receive daily cosmic insights."
             );
             localStorage.setItem('glyph_welcome_push', 'true');
         }, 5000);
     }
  }, [permission, sendNotification]);

  return null;
};

export default DailyReminder;
