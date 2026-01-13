
import React from 'react';
import { MAJOR_ARCANA } from '../services/tarotData';
import { useOffline } from '../context/OfflineProvider';
import { useTranslation } from '../hooks/useTranslation';

// Helper to get unique icon path for each card
const getCardIcon = (index: number) => {
  // Simplified for brevity, reusing generic path logic if needed or full list
  // Keeping full list logic structure
  const icons = [
    "M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z", // Fool
    "M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm-8 4a8 8 0 0 1 8-8 8 8 0 0 1 8 8 8 8 0 0 1-8-8 8 8 0 0 1-8-8 8 8 0 0 1-8-8z", // Magician
    // ... mapped to index, fallback to generic
  ];
  return icons[index] || "M12 2L2 22h20L12 2z"; // Default triangle
};

interface TarotCardProps {
  card: { name: string; number: string };
  isSelected: boolean;
  onClick: () => void;
  index: number;
}

const TarotCard: React.FC<TarotCardProps> = ({ card, isSelected, onClick, index }) => {
  const hue = (index * 25) % 360;
  const { isOnline } = useOffline();
  const { t, isRTL } = useTranslation();

  // Dynamic Translation of Card Name
  const translatedName = t(card.name);

  const handleClick = () => {
    if (navigator.vibrate) navigator.vibrate(20);
    onClick();
  };
  
  return (
    <div
      onClick={handleClick}
      className={`
        group relative aspect-[2/3.4] w-full cursor-pointer select-none
        perspective-1000 z-10 
        transition-transform duration-500 ease-out
        ${isSelected ? 'scale-110 z-30' : 'hover:-translate-y-4 hover:scale-105 hover:z-20'}
      `}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div 
        className={`
          relative w-full h-full rounded-xl transition-all duration-700
          transform-style-3d shadow-xl
          ${isSelected 
            ? 'rotate-y-180 shadow-[0_0_40px_rgba(217,70,239,0.5)] border-neon-magenta' 
            : 'group-hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] border-gold-400'
          }
          ${!isOnline ? 'grayscale-[0.5]' : ''}
        `}
      >
        {/* Front of Card (Card Back) */}
        <div className="absolute inset-0 w-full h-full rounded-xl backface-hidden flex items-center justify-center overflow-hidden border-2 border-gold-600/50 bg-indigo-deep">
             <div className="absolute inset-0 bg-gradient-to-br from-indigo-deep via-midnight to-mystic-900"></div>
             <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold-500 via-transparent to-transparent group-hover:animate-pulse"></div>
             <div className="absolute inset-2 border border-gold-500/20 rounded-lg flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-2 border-gold-500/50 flex items-center justify-center bg-midnight/80 backdrop-blur-sm shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                    <span className="text-3xl text-gold-400 font-cinzel animate-float">✦</span>
                </div>
             </div>
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-40"></div>
        </div>

        {/* Back of Card (The Reveal) */}
        <div className="absolute inset-0 w-full h-full rounded-xl bg-gradient-to-b from-indigo-deep via-midnight to-indigo-deep border-2 border-neon-magenta overflow-hidden flex flex-col items-center justify-between p-3 rotate-y-180 backface-hidden shadow-inner">
          <div className="absolute inset-0 opacity-20 bg-neon-magenta blur-xl"></div>
          <div className="absolute inset-1.5 border border-mystic-500/40 rounded-[6px] pointer-events-none flex flex-col justify-between py-1 px-1 z-10">
             <div className="flex justify-between"><span className="text-[10px] text-neon-magenta">✦</span><span className="text-[10px] text-neon-magenta">✦</span></div>
             <div className="flex justify-between"><span className="text-[10px] text-neon-magenta">✦</span><span className="text-[10px] text-neon-magenta">✦</span></div>
          </div>
          
          <div className="font-cinzel text-gold-400 text-sm font-bold z-20 mt-1 drop-shadow-md">{card.number}</div>
  
          <div className="relative w-full flex-grow flex items-center justify-center z-20">
               <div className="absolute inset-0 bg-gradient-to-t from-mystic-500/20 to-transparent opacity-60"></div>
               <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center bg-midnight/60 backdrop-blur-md border border-neon-magenta/50 shadow-[0_0_20px_rgba(217,70,239,0.4)] animate-float"
                  style={{ boxShadow: `0 0 25px hsla(${hue}, 80%, 60%, 0.3)` }}
                >
                    <span className="text-3xl text-gold-200">
                        {/* Dynamic Icon Placeholder based on index */}
                        {['🤡','🧙','🌙','👸','👑','⛪','💞','🛒','🦁','🧘','🎡','⚖️','🙃','💀','🏺','👿','🏰','⭐','🌔','🌞','🎺','🌍'][index] || '🔮'}
                    </span>
               </div>
          </div>
  
          {/* Dynamic Translated Name */}
          <div className={`
            font-bold text-center z-20 uppercase tracking-widest w-full truncate px-1 mb-2 bg-gradient-to-r from-transparent via-mystic-900/80 to-transparent py-1.5 border-t border-b border-mystic-500/20 text-amber-50
            ${isRTL ? 'font-sans' : 'font-cinzel'}
            text-[10px] sm:text-xs
          `}>
              {translatedName}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TarotCard;
