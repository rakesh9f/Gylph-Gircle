
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import type { Language } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';

interface HeaderProps {
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const ADMIN_EMAILS = ['master@gylphcircle.com', 'admin@gylphcircle.com'];
  const isAdmin = user && ADMIN_EMAILS.includes(user.email);

  return (
    <header className="bg-black bg-opacity-30 backdrop-blur-sm shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex flex-wrap justify-between items-center gap-4">
        <Link to="/home" className="cursor-pointer flex-shrink-0">
            <h1 className="text-2xl md:text-3xl font-bold text-amber-400 tracking-wider font-cinzel">{t('glyphCircle')}</h1>
        </Link>
        
        <div className="flex items-center gap-3 md:gap-6 flex-wrap justify-end">
            
            {/* Admin Config Button */}
            {isAdmin && (
                <Link 
                    to="/admin/config" 
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 text-amber-400 border border-amber-500/30 hover:bg-amber-900 hover:text-white transition-colors"
                    title="Configuration"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </Link>
            )}

            {/* Language Switcher */}
            <div className="relative z-50">
                <LanguageSwitcher />
            </div>

            <button
              onClick={onLogout}
              className="bg-maroon-700 hover:bg-maroon-600 border border-amber-500/50 text-amber-100 font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 text-sm whitespace-nowrap"
            >
              {t('logout')}
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
