
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTarotReading } from '../services/geminiService';
import Card from './shared/Card';
import ProgressBar from './shared/ProgressBar';
import Button from './shared/Button';
import { useTranslation } from '../hooks/useTranslation';
import { usePayment } from '../context/PaymentContext';
import TarotCard from './TarotCard';
import FullReport from './FullReport';
import { useAuth } from '../context/AuthContext';
import { ACTION_POINTS } from '../services/gamificationConfig';

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
    MAJOR_NAMES.forEach((name, i) => deck.push({ number: i.toString(), name, type: 'Major' }));
    SUITS.forEach(suit => RANKS.forEach((rank, i) => deck.push({ number: `${rank} of ${suit}`, name: `${rank} of ${suit}`, type: 'Minor', suit })));
    return deck;
};

const FULL_DECK = GENERATE_DECK();

// --- VEDIC MAPPING LOGIC ---
const calculateTarotVedicData = (card: CardData) => {
    // 1. Map Suits to Elements (Tattvas)
    let elementalBalance = [];
    let vedicMetrics = [];

    if (card.type === 'Major') {
        elementalBalance = [
            { element: 'Fire', sanskrit: 'Agni', score: 30 },
            { element: 'Water', sanskrit: 'Jala', score: 20 },
            { element: 'Air', sanskrit: 'Vayu', score: 20 },
            { element: 'Ether', sanskrit: 'Akasha', score: 30 },
        ];
        vedicMetrics = [
            { label: 'Karma (Destiny)', sub: 'Prarabdha', value: 90 },
            { label: 'Wisdom (Jnana)', sub: 'Buddhi', value: 85 },
            { label: 'Power (Shakti)', sub: 'Kundalini', value: 75 },
        ];
    } else {
        switch (card.suit) {
            case 'Wands': // Fire
                elementalBalance = [
                    { element: 'Fire', sanskrit: 'Agni', score: 80 },
                    { element: 'Air', sanskrit: 'Vayu', score: 10 },
                    { element: 'Earth', sanskrit: 'Prithvi', score: 5 },
                    { element: 'Water', sanskrit: 'Jala', score: 5 },
                ];
                vedicMetrics = [
                    { label: 'Willpower', sub: 'Iccha Shakti', value: 85 },
                    { label: 'Action', sub: 'Kriya Shakti', value: 90 },
                    { label: 'Emotion', sub: 'Bhavana', value: 30 },
                ];
                break;
            case 'Cups': // Water
                elementalBalance = [
                    { element: 'Water', sanskrit: 'Jala', score: 85 },
                    { element: 'Air', sanskrit: 'Vayu', score: 5 },
                    { element: 'Fire', sanskrit: 'Agni', score: 5 },
                    { element: 'Earth', sanskrit: 'Prithvi', score: 5 },
                ];
                vedicMetrics = [
                    { label: 'Emotion', sub: 'Bhavana', value: 95 },
                    { label: 'Intuition', sub: 'Pratibha', value: 80 },
                    { label: 'Action', sub: 'Kriya', value: 40 },
                ];
                break;
            case 'Swords': // Air
                elementalBalance = [
                    { element: 'Air', sanskrit: 'Vayu', score: 85 },
                    { element: 'Fire', sanskrit: 'Agni', score: 10 },
                    { element: 'Water', sanskrit: 'Jala', score: 0 },
                    { element: 'Earth', sanskrit: 'Prithvi', score: 5 },
                ];
                vedicMetrics = [
                    { label: 'Intellect', sub: 'Buddhi', value: 95 },
                    { label: 'Conflict', sub: 'Sangharsha', value: 70 },
                    { label: 'Peace', sub: 'Shanti', value: 20 },
                ];
                break;
            case 'Pentacles': // Earth
                elementalBalance = [
                    { element: 'Earth', sanskrit: 'Prithvi', score: 90 },
                    { element: 'Water', sanskrit: 'Jala', score: 5 },
                    { element: 'Fire', sanskrit: 'Agni', score: 5 },
                    { element: 'Air', sanskrit: 'Vayu', score: 0 },
                ];
                vedicMetrics = [
                    { label: 'Wealth', sub: 'Artha', value: 90 },
                    { label: 'Stability', sub: 'Sthirata', value: 85 },
                    { label: 'Spirituality', sub: 'Moksha', value: 30 },
                ];
                break;
        }
    }
    return { elementalBalance, vedicMetrics };
};

const Tarot: React.FC = () => {
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
  const [reading, setReading] = useState<string>('');
  const [chartData, setChartData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [isPaid, setIsPaid] = useState<boolean>(false);
  
  // Animation State
  const [animatingCard, setAnimatingCard] = useState<{ card: CardData; startRect: DOMRect } | null>(null);
  const [isAnimationFlying, setIsAnimationFlying] = useState(false);

  const { t, language } = useTranslation();
  const { openPayment } = usePayment();
  const { user, awardKarma } = useAuth();

  const ADMIN_EMAILS = ['master@gylphcircle.com', 'admin@gylphcircle.com'];
  const isAdmin = user && ADMIN_EMAILS.includes(user.email);

  const shuffledDeck = useMemo(() => [...FULL_DECK].sort(() => Math.random() - 0.5), []);

  const getLanguageName = (code: string) => {
      const map: Record<string, string> = { en: 'English', hi: 'Hindi', fr: 'French', es: 'Spanish' };
      return map[code] || 'English';
  };

  const handleCardSelect = useCallback(async (card: CardData, e: React.MouseEvent<HTMLDivElement>) => {
    if (isPaid || animatingCard || selectedCard) return;
    
    // 1. Capture Position
    const rect = e.currentTarget.getBoundingClientRect();
    setAnimatingCard({ card, startRect: rect });
    
    setIsLoading(true);
    setProgress(0);
    setReading('');
    setChartData(null);
    setError('');
    setIsPaid(false);

    // 2. Start API Logic
    const timer = setInterval(() => {
        setProgress(prev => (prev >= 90 ? prev : prev + 15));
    }, 300);

    try {
      const vedicData = calculateTarotVedicData(card);
      setChartData(vedicData);

      const result = await getTarotReading(card.name, getLanguageName(language));
      clearInterval(timer);
      setProgress(100);
      setReading(result);
      awardKarma(ACTION_POINTS.READING_COMPLETE);

    } catch (err: any) {
      clearInterval(timer);
      setError(`The spirits are quiet... (${err.message})`);
    } finally {
      setIsLoading(false);
    }
  }, [isPaid, language, awardKarma, animatingCard, selectedCard]);
  
  // Animation Lifecycle
  useEffect(() => {
      if (animatingCard) {
          // Trigger fly phase in next frame to allow DOM render at start position
          requestAnimationFrame(() => {
              setIsAnimationFlying(true);
          });

          // End animation and show modal
          const timeout = setTimeout(() => {
              setSelectedCard(animatingCard.card);
              setAnimatingCard(null);
              setIsAnimationFlying(false);
          }, 800); // 800ms transition time

          return () => clearTimeout(timeout);
      }
  }, [animatingCard]);

  const handleReadMore = () => openPayment(() => setIsPaid(true));
  const handleCloseModal = () => { setSelectedCard(null); setReading(''); setIsPaid(false); };

  // Image URL for report
  const reportImage = "https://images.unsplash.com/photo-1630335017257-23b092301983?q=80&w=800";

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 relative min-h-screen pb-12">
          <Link to="/home" className="relative z-10 inline-flex items-center text-amber-200 hover:text-amber-400 transition-colors mb-4 group">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              {t('backToHome')}
          </Link>

        <div className="relative z-10 mb-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 mb-4 font-cinzel drop-shadow-lg">{t('tarotReading')}</h2>
            <p className="text-amber-100/80 font-lora italic text-lg max-w-2xl mx-auto">The deck contains 78 mysteries. Let your intuition guide your hand.</p>
        </div>

        <div className="relative z-10 grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4 justify-items-center pb-20">
          {shuffledDeck.map((card, idx) => (
            <TarotCard 
                key={`${card.name}-${idx}`} 
                card={card} 
                index={idx} 
                // Hide card in grid if it is being animated or selected to simulate "picking up"
                isSelected={animatingCard?.card.name === card.name || selectedCard?.name === card.name}
                onClick={(e) => handleCardSelect(card, e)} 
            />
          ))}
        </div>
        
        {/* ANIMATED FLYING CARD OVERLAY */}
        {animatingCard && (
            <div 
                className="fixed z-[60] transition-all duration-[800ms] ease-[cubic-bezier(0.25,0.8,0.25,1)]"
                style={isAnimationFlying ? {
                    top: '50%',
                    left: '50%',
                    width: '12rem', // Reduced from 18rem for mobile safety
                    height: '18rem',
                    transform: 'translate(-50%, -50%) scale(1.1)'
                } : {
                    top: animatingCard.startRect.top,
                    left: animatingCard.startRect.left,
                    width: animatingCard.startRect.width,
                    height: animatingCard.startRect.height,
                    transform: 'translate(0, 0) scale(1)'
                }}
            >
                <TarotCard 
                    card={animatingCard.card} 
                    index={0} 
                    isSelected={false} // Keep back facing while flying? Or flip? Let's keep back facing until it lands.
                    onClick={() => {}} 
                />
            </div>
        )}

        {(isLoading || selectedCard) && !animatingCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in-up">
              <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto border-amber-400/40 shadow-2xl bg-gray-900/95 custom-scrollbar">
                  <div className="p-4 sm:p-8 relative">
                      <button onClick={handleCloseModal} className="absolute top-2 right-2 sm:top-4 sm:right-4 text-amber-500 hover:text-white transition-colors z-20"><svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>

                      {/* Modal Content - Responsive Layout */}
                      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10">
                          
                          {/* Left: Card Visual */}
                          <div className="flex-shrink-0 flex justify-center w-full md:w-auto">
                              {selectedCard ? (
                                  <div className="w-48 sm:w-56 md:w-64 aspect-[2/3] transform transition-transform duration-700">
                                    <TarotCard 
                                        card={selectedCard} 
                                        index={0} 
                                        isSelected={true} 
                                        onClick={() => {}} 
                                    />
                                  </div>
                              ) : (
                                  <div className="w-48 sm:w-64 aspect-[2/3] bg-white/5 rounded-xl animate-pulse"></div>
                              )}
                          </div>
                          
                          {/* Right: Reading Content */}
                          <div className="flex-grow w-full">
                              {isLoading && (
                                <div className="py-8">
                                    <ProgressBar progress={progress} message="Interpreting the Card..." estimatedTime="Approx. 5 seconds" />
                                </div>
                              )}
                              
                              {error && <p className="text-red-400 text-center mb-4">{error}</p>}
                              
                              {(reading || error) && selectedCard && !isLoading && (
                                  <div className="text-center md:text-left space-y-4 w-full animate-fade-in-up">
                                      {!isPaid ? (
                                        <>
                                            <div>
                                                <h3 className="text-2xl sm:text-3xl font-bold text-amber-300 mb-1 font-cinzel">{selectedCard.name}</h3>
                                                <div className="text-amber-500 text-xs font-bold tracking-[0.3em] uppercase mb-4">{selectedCard.type} Arcana</div>
                                            </div>
                                            
                                            <div className="relative text-amber-100 leading-relaxed font-lora text-sm sm:text-base italic bg-black/40 p-4 sm:p-6 rounded-lg border border-amber-500/20 shadow-inner text-left max-h-60 overflow-y-auto custom-scrollbar">
                                                {reading.replace(/#/g, '').replace(/\*\*/g, '').split('\n').map((line, i) => (
                                                    <p key={i} className="mb-2">{line}</p>
                                                ))}
                                            </div>
                                            
                                            <div className="pt-4 w-full flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                                                <Button onClick={handleReadMore} className="w-full sm:w-auto px-8 bg-gradient-to-r from-amber-600 to-maroon-700 border-amber-400 text-sm">
                                                    {t('readMore')}
                                                </Button>
                                                {isAdmin && (
                                                    <button onClick={() => setIsPaid(true)} className="text-xs text-amber-500 hover:text-amber-300 underline self-center">
                                                        👑 Admin Skip
                                                    </button>
                                                )}
                                            </div>
                                        </>
                                      ) : (
                                        <FullReport 
                                            reading={reading} 
                                            title={selectedCard.name}
                                            subtitle={`${selectedCard.type} Arcana • Vedic Insight`}
                                            imageUrl={reportImage}
                                            chartData={chartData}
                                        />
                                      )}
                                  </div>
                              )}
                          </div>
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
