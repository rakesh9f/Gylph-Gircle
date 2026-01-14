
import React, { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getTarotReading } from '../services/geminiService';
import Card from './shared/Card';
import Loader from './shared/Loader';
import Button from './shared/Button';
import { useTranslation } from '../hooks/useTranslation';
import { usePayment } from '../context/PaymentContext';
import TarotCard from './TarotCard';
import FullReport from './FullReport';

// --- DECK GENERATION LOGIC (78 Cards) ---
const SUITS = ['Wands', 'Cups', 'Swords', 'Pentacles'];
const RANKS = ['Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Page', 'Knight', 'Queen', 'King'];
const MAJOR_NAMES = [
  'The Fool', 'The Magician', 'The High Priestess', 'The Empress', 'The Emperor', 
  'The Hierophant', 'The Lovers', 'The Chariot', 'Strength', 'The Hermit', 
  'Wheel of Fortune', 'Justice', 'The Hanged Man', 'Death', 'Temperance', 
  'The Devil', 'The Tower', 'The Star', 'The Moon', 'The Sun', 'Judgement', 'The World'
];

interface CardData {
    number: string;
    name: string;
    type: 'Major' | 'Minor';
    suit?: string;
}

const GENERATE_DECK = (): CardData[] => {
    const deck: CardData[] = [];
    // Add Major Arcana
    MAJOR_NAMES.forEach((name, i) => {
        deck.push({ 
            number: i.toString(),
            name, 
            type: 'Major' 
        });
    });
    // Add Minor Arcana
    SUITS.forEach(suit => {
        RANKS.forEach((rank, i) => {
            deck.push({
                number: `${rank} of ${suit}`,
                name: `${rank} of ${suit}`,
                type: 'Minor',
                suit
            });
        });
    });
    return deck;
};

const FULL_DECK = GENERATE_DECK();

const Tarot: React.FC = () => {
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
  const [reading, setReading] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const { t } = useTranslation();
  const { openPayment } = usePayment();

  // Shuffle deck on mount
  const shuffledDeck = useMemo(() => {
      return [...FULL_DECK].sort(() => Math.random() - 0.5);
  }, []);

  const handleCardSelect = useCallback(async (card: CardData) => {
    if (isPaid) return; 
    
    setSelectedCard(card);
    setIsLoading(true);
    setReading('');
    setError('');
    setIsPaid(false);

    try {
      const result = await getTarotReading(card.name);
      setReading(result);
    } catch (err: any) {
      console.error(err);
      setError(`The spirits are quiet... (${err.message}). Trying fallback.`);
      setReading("The card you have drawn is powerful. Trust your intuition as the path unfolds before you.");
    } finally {
      setIsLoading(false);
    }
  }, [isPaid]);
  
  const handleReadMore = () => {
    openPayment(() => {
        setIsPaid(true);
    });
  };

  const handleCloseModal = () => {
      setSelectedCard(null);
      setReading('');
      setIsPaid(false);
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 relative min-h-screen pb-12">
          {/* Background Particle Effects */}
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
             <div className="absolute top-10 left-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl animate-float"></div>
             <div className="absolute bottom-20 right-20 w-96 h-96 bg-maroon-900/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s'}}></div>
          </div>

          <Link to="/home" className="relative z-10 inline-flex items-center text-amber-200 hover:text-amber-400 transition-colors mb-4 group">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t('backToHome')}
          </Link>

        <div className="relative z-10 mb-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 mb-4 font-cinzel drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {t('tarotReading')}
            </h2>
            <p className="text-amber-100/80 font-lora italic text-lg max-w-2xl mx-auto">
                The deck contains 78 mysteries. Let your intuition guide your hand.
            </p>
        </div>

        {/* 
           Card Grid 
           - Adjusted grid cols for better visibility on mobile (3 cols) vs desktop (8 cols).
           - Reduced gap slightly to fit more cards without scrolling too much.
        */}
        <div className="relative z-10 grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4 justify-items-center pb-20">
          {shuffledDeck.map((card, idx) => (
            <TarotCard 
               key={`${card.name}-${idx}`}
               card={card}
               index={idx}
               isSelected={selectedCard?.name === card.name}
               onClick={() => handleCardSelect(card)}
            />
          ))}
        </div>
        
        {/* Reading Modal */}
        {(isLoading || selectedCard) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in-up">
              <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto border-amber-400/40 shadow-[0_0_50px_rgba(0,0,0,0.8)] bg-gray-900/95">
                  <div className="p-6 sm:p-8 relative">
                      <button 
                        onClick={handleCloseModal}
                        className="absolute top-4 right-4 text-amber-500 hover:text-white transition-colors z-20"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>

                      <div className="flex flex-col items-center">
                          {selectedCard && (
                              <div className="w-48 sm:w-56 aspect-[2/3] mb-8 transform hover:scale-105 transition-transform duration-700">
                                <TarotCard 
                                    card={selectedCard} 
                                    index={0} 
                                    isSelected={true} 
                                    onClick={() => {}} 
                                />
                              </div>
                          )}
                          
                          {isLoading && (
                            <div className="flex flex-col items-center">
                                <Loader />
                                <p className="mt-4 text-amber-200 animate-pulse font-cinzel tracking-widest">Consulting the Oracle...</p>
                            </div>
                          )}
                          
                          {error && <p className="text-red-400 text-center bg-red-900/20 p-4 rounded border border-red-500/30 mb-4">{error}</p>}
                          
                          {(reading || error) && selectedCard && !isLoading && (
                              <div className="text-center space-y-6 w-full animate-fade-in-up">
                                  {!isPaid ? (
                                    <>
                                        <div>
                                            <h3 className="text-3xl sm:text-4xl font-bold text-amber-300 mb-2 font-cinzel drop-shadow-lg">{selectedCard.name}</h3>
                                            <div className="text-amber-500 text-sm font-bold tracking-[0.3em] uppercase mb-6 flex items-center justify-center gap-4">
                                                <span className="h-px w-8 bg-amber-500/50"></span>
                                                {selectedCard.type} Arcana
                                                <span className="h-px w-8 bg-amber-500/50"></span>
                                            </div>
                                        </div>
                                        
                                        <div className="relative text-amber-100 leading-relaxed font-lora text-lg italic bg-black/40 p-6 rounded-lg border border-amber-500/20 shadow-inner">
                                            <span className="absolute top-2 left-2 text-4xl text-amber-500/20 font-serif">“</span>
                                            {reading}
                                            <span className="absolute bottom-[-10px] right-4 text-4xl text-amber-500/20 font-serif">”</span>
                                        </div>
                                        
                                        <div className="pt-6 w-full animate-pulse">
                                            <Button onClick={handleReadMore} className="w-full sm:w-auto px-12 py-4 text-lg bg-gradient-to-r from-amber-600 to-maroon-700 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.4)]">
                                                {t('readMore')}
                                            </Button>
                                        </div>
                                    </>
                                  ) : (
                                    <FullReport 
                                        reading={reading} 
                                        title={selectedCard.name}
                                        subtitle={`${selectedCard.type} Arcana`}
                                    />
                                  )}
                              </div>
                          )}
                      </div>
                  </div>
              </Card>
          </div>
        )}
      </div>
    </>
  );
};

export default Tarot;
