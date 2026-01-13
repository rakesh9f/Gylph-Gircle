import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import type { Language } from '../context/LanguageContext';

interface HeaderProps {
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  const { t, setLanguage, language } = useTranslation();

  return (
    <header className="bg-black bg-opacity-30 backdrop-blur-sm shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/home" className="cursor-pointer">
            <h1 className="text-2xl md:text-3xl font-bold text-amber-400 tracking-wider">{t('glyphCircle')}</h1>
        </Link>
        <div className="flex items-center gap-4">
            <div className="relative">
                <select 
                    value={language} 
                    onChange={(e) => setLanguage(e.target.value as Language)}
                    className="bg-gray-800 border border-amber-500/30 text-amber-100 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5 appearance-none"
                >
                    <option value="en">English</option>
                    <option value="hi">हिन्दी</option>
                    <option value="ta">தமிழ்</option>
                    <option value="te">తెలుగు</option>
                    <option value="bn">বাংলা</option>
                    <option value="mr">मराठी</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="ar">العربية</option>
                    <option value="pt">Português</option>
                </select>
            </div>
            <button
              onClick={onLogout}
              className="bg-maroon-700 hover:bg-maroon-600 border border-amber-500 text-amber-100 font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
            >
              {t('logout')}
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;