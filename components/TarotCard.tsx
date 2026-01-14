
import React, { useMemo } from 'react';
import { useOffline } from '../context/OfflineProvider';
import { useTranslation } from '../hooks/useTranslation';

interface TarotCardProps {
  card: { name: string; number: string; type?: string; suit?: string };
  isSelected: boolean;
  onClick: () => void;
  index: number;
}

// Helper to generate visual themes based on card properties
const getCardTheme = (card: any, index: number) => {
  // Default Theme (Fallback)
  let theme = {
    bgGradient: 'bg-gradient-to-b from-gray-800 to-gray-950',
    border: 'border-gray-600',
    accent: 'text-gray-400',
    glow: 'shadow-[0_0_15px_rgba(156,163,175,0.3)]',
    orb: 'bg-gray-500/20',
    icon: '⚔️'
  };

  // 1. MAJOR ARCANA (The most powerful cards)
  if (card.type === 'Major' || !card.suit) {
    theme = {
      bgGradient: 'bg-gradient-to-b from-indigo-900 via-purple-900 to-black',
      border: 'border-amber-400',
      accent: 'text-amber-300',
      glow: 'shadow-[0_0_20px_rgba(251,191,36,0.5)]',
      orb: 'bg-amber-500/20',
      // Map specific icons to Major Arcana or fallback to generic mystic symbols
      icon: ['🃏', '🧙', '🌙', '👸', '👑', '⛪', '💞', '🛒', '🦁', '🧘', '🎡', '⚖️', '🙃', '💀', '🏺', '👿', '🏰', '⭐', '🌔', '🌞', '🎺', '🌍'][index % 22] || '🔮'
    };
  } 
  // 2. SUITS (Minor Arcana)
  else {
    switch (card.suit) {
      case 'Wands': // Fire / Passion / Action
        theme = {
          bgGradient: 'bg-gradient-to-b from-red-900 via-orange-900 to-black',
          border: 'border-orange-500/60',
          accent: 'text-orange-300',
          glow: 'shadow-[0_0_15px_rgba(249,115,22,0.3)]',
          orb: 'bg-orange-500/20',
          icon: '🔥'
        };
        break;
      case 'Cups': // Water / Emotion / Relationships
        theme = {
          bgGradient: 'bg-gradient-to-b from-blue-900 via-cyan-900 to-black',
          border: 'border-cyan-400/60',
          accent: 'text-cyan-300',
          glow: 'shadow-[0_0_15px_rgba(34,211,238,0.3)]',
          orb: 'bg-cyan-500/20',
          icon: '🏆'
        };
        break;
      case 'Swords': // Air / Intellect / Conflict
        theme = {
          bgGradient: 'bg-gradient-to-b from-slate-800 via-gray-800 to-black',
          border: 'border-gray-400/60',
          accent: 'text-gray-300',
          glow: 'shadow-[0_0_15px_rgba(209,213,219,0.3)]',
          orb: 'bg-slate-500/20',
          icon: '🗡️'
        };
        break;
      case 'Pentacles': // Earth / Material / Wealth
        theme = {
          bgGradient: 'bg-gradient-to-b from-emerald-900 via-green-900 to-black',
          border: 'border-emerald-500/60',
          accent: 'text-emerald-300',
          glow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]',
          orb: 'bg-emerald-500/20',
          icon: '🪙'
        };
        break;
    }
  }
  
  return theme;
};

const TarotCard: React.FC<TarotCardProps> = ({ card, isSelected, onClick, index }) => {
  const { t, isRTL } = useTranslation();
  const theme = useMemo(() => getCardTheme(card, index), [card, index]);
  const translatedName = t(card.name);

  const handleClick = () => {
    if (navigator.vibrate) navigator.vibrate(20);
    onClick();
  };

  return (
    <div
      onClick={handleClick}
      className={`
        group relative w-full cursor-pointer
        aspect-[2/3] 
        perspective-1000 z-10 
        transition-all duration-500 ease-out
        ${isSelected ? 'scale-100 z-40' : 'hover:-translate-y-4 hover:z-30 hover:scale-105'}
      `}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* CARD CONTAINER (Flip logic) */}
      <div 
        className={`
          relative w-full h-full rounded-xl transition-all duration-700 transform-style-3d
          ${isSelected ? 'rotate-y-180' : ''}
          ${!isSelected ? 'group-hover:shadow-[0_0_25px_rgba(251,191,36,0.2)]' : ''}
        `}
      >
        
        {/* ==============================
            FRONT (The Card Back Pattern)
            Visible BEFORE selection
           ============================== */}
        <div 
          className="absolute inset-0 w-full h-full rounded-xl backface-hidden 
                     border border-amber-600/30 bg-[#0F0F23] overflow-hidden shadow-xl"
        >
            {/* Pattern Background */}
            <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, rgba(245,158,11,0.3) 1px, transparent 0)`,
                backgroundSize: '16px 16px'
            }}></div>
            
            {/* Center Eye Emblem */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border border-amber-500/30 flex items-center justify-center relative">
                     <div className="absolute inset-0 border border-amber-500/10 rounded-full animate-ping opacity-30"></div>
                     <span className="text-2xl filter drop-shadow-[0_0_5px_rgba(245,158,11,0.8)] opacity-80">👁️</span>
                </div>
            </div>

            {/* Corner Ornaments */}
            <div className="absolute top-1 left-1 text-amber-500/30 text-[10px]">✦</div>
            <div className="absolute top-1 right-1 text-amber-500/30 text-[10px]">✦</div>
            <div className="absolute bottom-1 left-1 text-amber-500/30 text-[10px]">✦</div>
            <div className="absolute bottom-1 right-1 text-amber-500/30 text-[10px]">✦</div>
        </div>


        {/* ==============================
            BACK (The Reveal / Face)
            Visible AFTER selection
           ============================== */}
        <div 
          className={`
            absolute inset-0 w-full h-full rounded-xl overflow-hidden rotate-y-180 backface-hidden
            flex flex-col items-center justify-between p-3
            border-2 ${theme.border}
            ${theme.bgGradient}
            ${theme.glow}
          `}
        >
          {/* Header: Number */}
          <div className={`w-full flex justify-between px-1.5 pt-1 font-cinzel text-[10px] sm:text-xs font-bold ${theme.accent} opacity-80`}>
              <span>{card.number.split(' ')[0]}</span>
              {card.type === 'Major' && <span>M</span>}
          </div>

          {/* CRYSTAL BALL ANIMATION - SCALED TO CARD WIDTH */}
          <div className="relative flex-grow flex items-center justify-center w-full">
             <div className="relative w-[75%] aspect-square flex items-center justify-center">
                 {/* Orb Glow */}
                 <div className={`absolute inset-0 rounded-full ${theme.orb} blur-xl animate-pulse`}></div>
                 
                 {/* The Crystal Ball Itself */}
                 <div className="relative w-full h-full rounded-full bg-gradient-to-br from-white/10 to-transparent border border-white/20 shadow-inner flex items-center justify-center overflow-hidden backdrop-blur-sm">
                     {/* Mist */}
                     <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-50"></div>
                     
                     {/* Icon - Responsive Text Size */}
                     <span className="relative z-10 text-[3rem] sm:text-[4rem] md:text-[5rem] filter drop-shadow-lg transform transition-transform duration-700 leading-none">
                        {theme.icon}
                     </span>
                     
                     {/* Reflection */}
                     <div className="absolute top-[15%] left-[20%] w-[20%] h-[10%] bg-white/30 rounded-full blur-[2px] rotate-[-45deg]"></div>
                 </div>
             </div>
          </div>

          {/* Footer: Name */}
          <div className="w-full text-center pb-1">
              <div className={`
                w-full py-1.5 
                bg-black/30 backdrop-blur-md rounded border-t ${theme.border}
                text-amber-50 font-cinzel font-bold text-[10px] sm:text-xs tracking-wide
                truncate px-2
              `}>
                {translatedName}
              </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TarotCard;
