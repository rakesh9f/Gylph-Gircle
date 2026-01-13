import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import Card from './shared/Card';
import { Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';

const ReadingHistory: React.FC = () => {
  const { history, toggleFavorite, isLoading } = useUser();
  const { t } = useTranslation();
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');

  const filteredHistory = filter === 'all' 
    ? history 
    : history.filter(r => r.is_favorite);

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'tarot': return '🔮';
      case 'palmistry': return '✋';
      case 'astrology': return '🌟';
      case 'numerology': return '🔢';
      case 'face-reading': return '😐';
      case 'remedy': return '🧘';
      default: return '📜';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
           <Link to="/home" className="inline-flex items-center text-amber-200 hover:text-amber-400 transition-colors mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t('backToHome')}
          </Link>
          <h2 className="text-3xl font-cinzel font-bold text-amber-300">My Journey</h2>
          <p className="text-amber-200/60 text-sm">Your spiritual timeline and saved insights.</p>
        </div>

        <div className="flex bg-black/40 rounded-lg p-1 mt-4 md:mt-0 border border-amber-500/20">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${filter === 'all' ? 'bg-amber-600 text-white' : 'text-amber-200 hover:text-white'}`}
          >
            All Readings
          </button>
          <button
            onClick={() => setFilter('favorites')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${filter === 'favorites' ? 'bg-amber-600 text-white' : 'text-amber-200 hover:text-white'}`}
          >
            Favorites
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-amber-200 animate-pulse">Loading your history...</div>
      ) : filteredHistory.length === 0 ? (
        <Card className="p-12 text-center bg-black/20 border-dashed">
          <p className="text-amber-200/50 text-lg mb-4">No readings found in your timeline.</p>
          <Link to="/home" className="text-amber-400 hover:text-amber-300 underline font-cinzel">
            Start your first reading
          </Link>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredHistory.map((reading) => (
            <div key={reading.id} className="relative group perspective-1000">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-600 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-60 transition duration-500"></div>
              <Card className="relative bg-gray-900/90 border-amber-500/10 group-hover:border-amber-500/30 transition-all duration-300">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-black/50 border border-amber-500/30 flex items-center justify-center text-xl">
                        {getTypeIcon(reading.type)}
                      </div>
                      <div>
                        <h3 className="text-xl font-cinzel font-bold text-amber-100">{reading.title}</h3>
                        <p className="text-xs text-amber-500 uppercase tracking-widest">{reading.subtitle || reading.type}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleFavorite(reading.id)}
                      className={`transform transition-all duration-300 hover:scale-110 ${reading.is_favorite ? 'text-amber-400' : 'text-gray-600 hover:text-amber-200'}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={reading.is_favorite ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </button>
                  </div>

                  <div className="text-amber-100/80 font-lora italic border-l-2 border-amber-500/20 pl-4 mb-4 line-clamp-3">
                    "{reading.content}"
                  </div>

                  <div className="flex justify-between items-center text-xs text-amber-200/40 border-t border-amber-500/10 pt-4">
                    <span>{formatDate(reading.timestamp)}</span>
                    <span className="flex items-center gap-1 text-green-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Verified & Paid
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReadingHistory;
