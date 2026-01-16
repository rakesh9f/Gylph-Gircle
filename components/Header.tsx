import React, { useState } from 'react';
// @ts-ignore
import { Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import type { Language } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeSwitcher from './ThemeSwitcher';
import MasterToolsModal from './MasterToolsModal';

interface HeaderProps {
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isMasterToolsOpen, setIsMasterToolsOpen] = useState(false);

  const ADMIN_EMAILS = ['master@gylphcircle.com', 'admin@gylphcircle.com'];
  const isAdmin = user && ADMIN_EMAILS.includes(user.email);

  return (
    <header className="bg-black bg-opacity-30 backdrop-blur-sm shadow-md sticky top-0 z-50 border-b border-white/5 transition-colors duration-500">
      <div className="container mx-auto px-4 py-3 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-4">
            <Link to="/home" className="cursor-pointer flex-shrink-0 group">
                <h1 className="text-2xl md:text-3xl font-bold text-amber-400 tracking-wider font-cinzel group-hover:text-amber-300 transition-colors">
                  {t('glyphCircle')}
                </h1>
            </Link>
            
            <Link 
                to="/history" 
                className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-gray-800/50 hover:bg-amber-900/30 text-amber-200 border border-amber-500/20 transition-all"
                title="Your History"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </Link>
        </div>
        
        <div className="flex items-center gap-3 md:gap-4 flex-wrap justify-end">
            
            {/* Master Tools Pill Button */}
            {isAdmin && (
                <>
                    <button 
                        onClick={() => setIsMasterToolsOpen(true)}
                        className="hidden md:flex items-center gap-2 bg-gradient-to-r from-gray-900 to-black border border-amber-500/50 text-amber-100 px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.15)] hover:border-amber-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all transform hover:scale-105 group"
                    >
                        <span className="text-lg group-hover:animate-spin">⚙️</span>
                        <span className="text-xs font-bold uppercase tracking-wider font-cinzel">Master Tools</span>
                    </button>
                    {/* Mobile Icon Only */}
                    <button 
                        onClick={() => setIsMasterToolsOpen(true)}
                        className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 text-amber-400 border border-amber-500/30 hover:bg-amber-900"
                    >
                        ⚙️
                    </button>
                    
                    <MasterToolsModal 
                        isVisible={isMasterToolsOpen} 
                        onClose={() => setIsMasterToolsOpen(false)} 
                    />
                </>
            )}

            {/* Theme Switcher */}
            <ThemeSwitcher />

            {/* Language Switcher */}
            <div className="relative z-50">
                <LanguageSwitcher />
            </div>

            {/* Mobile History Link (Visible only on small screens) */}
            <Link 
                to="/history" 
                className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-gray-800/50 hover:bg-amber-900/30 text-amber-200 border border-amber-500/20"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </Link>

            <button
              onClick={onLogout}
              className="bg-maroon-700/80 hover:bg-maroon-600 border border-amber-500/50 text-amber-100 font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 text-sm whitespace-nowrap"
            >
              {t('logout')}
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;