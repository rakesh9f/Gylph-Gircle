import React from 'react';
import { MAJOR_ARCANA } from '../services/tarotData';

// Helper to get unique icon path for each card
const getCardIcon = (index: number) => {
  const icons = [
    "M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z", // Fool
    "M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm-8 4a8 8 0 0 1 8-8 8 8 0 0 1 8 8 8 8 0 0 1-8-8 8 8 0 0 1-8-8z", // Magician
    "M12 3a9 9 0 1 0 0 18 9 9 0 1 1 0-18z", // High Priestess
    "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z", // Empress
    "M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11h-14zm14 3c0 .66-.34 1.29-.9 1.6l-5.3 2.8c-.46.25-1.12.25-1.6 0l-5.3-2.8A1.83 1.83 0 0 1 5 19h14z", // Emperor
    "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z", // Hierophant
    "M12 7c-2.76 0-5 2.24-5 5 0 .65.13 1.26.36 1.83C9.88 15.22 12 17.5 12 17.5s2.12-2.28 4.64-3.67c.23-.57.36-1.18.36-1.83 0-2.76-2.24-5-5-5z M12 2l2.5 4h-5L12 2z m0 20l-2.5-4h5L12 22z m10-10l-4-2.5v5L22 12z M2 12l4 2.5v-5L2 12z", // Lovers
    "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z", // Chariot
    "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5zm4 4h-2v-2h2v2zm0-4h-2V7h2v5z", // Strength
    "M12 2L2 22h20L12 2zm0 5l6 12H6l6-12z", // Hermit
    "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9l-1 5 5-2 5 2-1-5 4-3h-5l-2-5-2 5H5l4 3z", // Wheel
    "M12 2L2 22h20L12 2zm0 3.5l6 12H6l6-12z", // Justice
    "M12 22L2 2h20L12 22z", // Hanged Man
    "M12 2c-4.97 0-9 4.03-9 9 0 4.17 2.84 7.67 6.69 8.69L12 22l2.31-2.31C18.16 18.67 21 15.17 21 11c0-4.97-4.03-9-9-9zm0 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z", // Death
    "M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM7 8V7h2v3.06C8.16 9.57 7.45 8.86 7 8zm10 0c-.45.86-1.16 1.57-2 2.06V7h2v1z", // Temperance
    "M19 3H5c-1.1 0-2 .9-2 2v1c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l3.59-3.59L17 12l-5 5z", // Devil
    "M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08.07-.12C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15C12.96 17.55 11 21 11 21z", // Tower
    "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z", // Star
    "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z", // Moon
    "M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 9c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z M12 2L2 22h20L12 2z", // Sun
    "M2 20h20v2H2v-2zm10-18C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5zm4 4h-2v-2h2v2zm0-4h-2V7h2v5z", // Judgement
    "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" // World
  ];
  return icons[index] || icons[0];
};

interface TarotCardProps {
  card: typeof MAJOR_ARCANA[0];
  isSelected: boolean;
  onClick: () => void;
  index: number;
}

const TarotCard: React.FC<TarotCardProps> = ({ card, isSelected, onClick, index }) => {
  const hue = (index * 25) % 360;
  
  return (
    <div
      onClick={onClick}
      className={`
        group relative aspect-[2/3.4] w-full cursor-pointer select-none
        perspective-1000 z-10 hover:z-20
        transition-transform duration-500 ease-out
        ${isSelected ? 'scale-110 z-30' : 'hover:-translate-y-4 hover:scale-105'}
      `}
    >
      <div 
        className={`
          relative w-full h-full rounded-xl transition-all duration-700
          transform-style-3d shadow-xl
          ${isSelected 
            ? 'rotate-y-180 shadow-[0_0_40px_rgba(217,70,239,0.5)] border-neon-magenta' 
            : 'group-hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] border-gold-400'
          }
        `}
      >
        {/* Front of Card (Card Back Design) - Visible initially */}
        <div 
            className="absolute inset-0 w-full h-full rounded-xl backface-hidden flex items-center justify-center overflow-hidden border-2 border-gold-600/50 bg-indigo-deep"
        >
             {/* Background Gradient */}
             <div className="absolute inset-0 bg-gradient-to-br from-indigo-deep via-midnight to-mystic-900"></div>
             
             {/* Mystical Pattern */}
             <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold-500 via-transparent to-transparent group-hover:animate-pulse"></div>
             
             {/* Center Symbol */}
             <div className="absolute inset-2 border border-gold-500/20 rounded-lg flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-2 border-gold-500/50 flex items-center justify-center bg-midnight/80 backdrop-blur-sm shadow-[0_0_15px_rgba(245,158,11,0.2)] group-hover:shadow-[0_0_25px_rgba(245,158,11,0.6)] transition-shadow duration-500">
                    <span className="text-3xl text-gold-400 font-cinzel animate-float">✦</span>
                </div>
             </div>
             
             {/* Texture Overlay */}
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-40"></div>
        </div>

        {/* Back of Card (The Reveal) - Hidden initially */}
        <div 
          className="absolute inset-0 w-full h-full rounded-xl bg-gradient-to-b from-indigo-deep via-midnight to-indigo-deep border-2 border-neon-magenta overflow-hidden flex flex-col items-center justify-between p-3 rotate-y-180 backface-hidden shadow-inner"
        >
          {/* Neon Glow Container */}
          <div className="absolute inset-0 opacity-20 bg-neon-magenta blur-xl"></div>
          
          {/* Inner Decorative Frame */}
          <div className="absolute inset-1.5 border border-mystic-500/40 rounded-[6px] pointer-events-none flex flex-col justify-between py-1 px-1 z-10">
             <div className="flex justify-between"><span className="text-[10px] text-neon-magenta">✦</span><span className="text-[10px] text-neon-magenta">✦</span></div>
             <div className="flex justify-between"><span className="text-[10px] text-neon-magenta">✦</span><span className="text-[10px] text-neon-magenta">✦</span></div>
          </div>
          
          {/* Top Number */}
          <div className="font-cinzel text-gold-400 text-sm font-bold z-20 mt-1 drop-shadow-md">{card.number}</div>
  
          {/* Center Symbol with Glow */}
          <div className="relative w-full flex-grow flex items-center justify-center z-20">
               <div className="absolute inset-0 bg-gradient-to-t from-mystic-500/20 to-transparent opacity-60"></div>
               <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center bg-midnight/60 backdrop-blur-md border border-neon-magenta/50 shadow-[0_0_20px_rgba(217,70,239,0.4)] animate-float"
                  style={{ boxShadow: `0 0 25px hsla(${hue}, 80%, 60%, 0.3)` }}
                >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 text-gold-200 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
                        <path d={getCardIcon(index)} />
                    </svg>
               </div>
          </div>
  
          {/* Bottom Name */}
          <div className="font-cinzel text-amber-50 text-xs font-bold text-center z-20 uppercase tracking-widest w-full truncate px-1 mb-2 bg-gradient-to-r from-transparent via-mystic-900/80 to-transparent py-1.5 border-t border-b border-mystic-500/20">
              {card.name}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TarotCard;