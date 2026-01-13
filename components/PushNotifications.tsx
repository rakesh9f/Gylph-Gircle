
import React, { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import Button from './shared/Button';

interface NotificationContextType {
  permission: NotificationPermission;
  requestPermission: () => Promise<void>;
  sendNotification: (title: string, body?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used within PushNotifications wrapper");
  return context;
};

export const PushNotifications: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert("This browser does not support desktop notifications");
      return;
    }
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') {
        // Mobile vibration
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        
        new Notification("🔮 Cosmic Connection Established", {
          body: "You will now receive daily insights from the stars!",
          icon: "https://cdn-icons-png.flaticon.com/512/3063/3063822.png"
        });
      }
    } catch (error) {
      console.error("Permission request failed", error);
    }
  };

  const sendNotification = (title: string, body?: string) => {
    if (permission === 'granted') {
      if (navigator.vibrate) navigator.vibrate([200]);
      
      const options: any = {
        body,
        icon: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png',
        badge: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png',
        vibrate: [200, 100, 200],
        tag: 'glyph-circle-alert',
        renotify: true
      };

      try {
          new Notification(title, options);
      } catch (e) {
          console.error("Notification dispatch error", e);
      }
    } else {
        console.log("Notification permission not granted, requesting...");
        // Optionally auto-request (can be annoying, better to rely on user action)
    }
  };

  return (
    <NotificationContext.Provider value={{ permission, requestPermission, sendNotification }}>
      {children}
      {permission === 'default' && (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 via-gray-900/95 to-gray-900/80 border-t border-amber-500/30 p-4 z-[100] animate-fade-in-up backdrop-blur-xl shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
           <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/50 animate-pulse">
                     <span className="text-xl">🔔</span>
                  </div>
                  <div>
                      <h4 className="text-amber-300 font-bold font-cinzel text-lg">Enable Cosmic Updates?</h4>
                      <p className="text-amber-100/70 text-sm font-lora">Get your daily horoscope & tarot reading delivered at 8 AM.</p>
                  </div>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                  <button 
                    onClick={() => setPermission('denied')} 
                    className="flex-1 sm:flex-none px-4 py-2 text-sm text-amber-200/60 hover:text-amber-100 font-bold transition-colors"
                  >
                    Later
                  </button>
                  <Button onClick={requestPermission} className="flex-1 sm:flex-none py-2 px-6 text-sm bg-amber-600 hover:bg-amber-500 border-none shadow-lg">
                    Allow
                  </Button>
              </div>
           </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};
