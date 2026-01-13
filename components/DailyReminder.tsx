
import React, { useEffect } from 'react';
import { useNotifications } from './PushNotifications';

const DailyReminder: React.FC = () => {
  const { sendNotification, permission } = useNotifications();

  useEffect(() => {
    // Check loop
    const checkTime = () => {
      if (permission !== 'granted') return;

      const now = new Date();
      const lastSent = localStorage.getItem('glyph_daily_sent_date');
      const todayStr = now.toDateString();

      // Trigger Logic: 
      // 1. If it is after 8 AM
      // 2. AND we haven't sent a notification today
      if (now.getHours() >= 8 && lastSent !== todayStr) {
         sendNotification(
            "🌟 Your Daily Guidance is Ready",
            "The stars have shifted. Tap to reveal your card for the day."
         );
         localStorage.setItem('glyph_daily_sent_date', todayStr);
      }
    };

    // Run check immediately on mount, then every minute
    checkTime();
    const interval = setInterval(checkTime, 60000);

    return () => clearInterval(interval);
  }, [permission, sendNotification]);

  // Simulate a welcome notification if it's the very first visit with permissions
  useEffect(() => {
     const hasWelcomed = localStorage.getItem('glyph_welcome_push');
     if (permission === 'granted' && !hasWelcomed) {
         setTimeout(() => {
             sendNotification("✨ Welcome Seeker", "Your spiritual journey has begun. Notifications are active.");
             localStorage.setItem('glyph_welcome_push', 'true');
         }, 5000);
     }
  }, [permission, sendNotification]);

  return null;
};

export default DailyReminder;
