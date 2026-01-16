
import React, { useState } from 'react';
// @ts-ignore
import { Link } from 'react-router-dom';
import Card from './shared/Card';
import Button from './shared/Button';
import ProgressBar from './shared/ProgressBar';
import { useDb } from '../hooks/useDb';
import { useTranslation } from '../hooks/useTranslation';
import { usePayment } from '../context/PaymentContext';
import { getGemstoneGuidance } from '../services/geminiService';
import { SmartDatePicker } from './SmartAstroInputs';
import FullReport from './FullReport';
import { useAuth } from '../context/AuthContext';

const GemstoneGuide: React.FC = () => {
  const { db } = useDb();
  const { t, language } = useTranslation();
  const { openPayment } = usePayment();
  const { saveReading, user } = useAuth();

  const [activeTab, setActiveTab] = useState<'oracle' | 'library'>('oracle');
  
  // Oracle State
  const [formData, setFormData] = useState({ name: '', dob: '', intent: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [error, setError] = useState('');

  // Library State
  const [selectedGem, setSelectedGem] = useState<any>(null);

  const ADMIN_EMAILS = ['master@gylphcircle.com', 'admin@gylphcircle.com'];
  const isAdmin = user && ADMIN_EMAILS.includes(user.email);

  const getLanguageName = (code: string) => {
      const map: Record<string, string> = { en: 'English', hi: 'Hindi', fr: 'French', es: 'Spanish' };
      return map[code] || 'English';
  };

  const handleConsultOracle = async () => {
      if (!formData.name || !formData.dob || !formData.intent) {
          setError('Please complete all fields.');
          return;
      }

      setIsLoading(true);
      setProgress(0);
      setResult(null);
      setError('');
      setIsPaid(false);

      const timer = setInterval(() => setProgress(p => (p >= 90 ? p : p + 5)), 250);

      try {
          const apiResult = await getGemstoneGuidance(formData.name, formData.dob, formData.intent, getLanguageName(language));
          
          clearInterval(timer);
          setProgress(100);
          setResult(apiResult);

          // Save history
          saveReading({
              type: 'astrology',
              title: `Gemstone for ${formData.intent}`,
              content: apiResult.fullReading,
              subtitle: apiResult.primaryGem.name,
              image_url: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?q=80&w=400"
          });

      } catch (err: any) {
          clearInterval(timer);
          setError(err.message || "The oracle is silent.");
      } finally {
          setIsLoading(false);
      }
  };

  const handleReadMore = () => openPayment(() => setIsPaid(true));

  return (
    <div className="min-h-screen py-8 px-4">
        <div className="max-w-5xl mx-auto">
            <Link to="/home" className="inline-flex items-center text-amber-200 hover:text-amber-400 transition-colors mb-6 group">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                {t('backToHome')}
            </Link>

            <div className="text-center mb-8">
                <h1 className="text-4xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200 mb-2">
                    Crystal Oracle & Mantra Guide
                </h1>
                <p className="text-amber-100/60 font-lora">Discover your power stone and sacred sound vibration.</p>
            </div>

            {/* TABS */}
            <div className="flex justify-center mb-8">
                <div className="bg-gray-900/80 p-1 rounded-full border border-amber-500/30 flex">
                    <button 
                        onClick={() => setActiveTab('oracle')}
                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'oracle' ? 'bg-amber-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        🔮 Personal Reading
                    </button>
                    <button 
                        onClick={() => setActiveTab('library')}
                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'library' ? 'bg-amber-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        📚 Stone Library
                    </button>
                </div>
            </div>

            {/* ORACLE TAB */}
            {activeTab === 'oracle' && (
                <div className="grid md:grid-cols-2 gap-8 items-start">
                    <Card className="p-6 border-l-4 border-emerald-500">
                        <h3 className="text-xl font-bold text-emerald-300 mb-6 font-cinzel">Consult the Oracle</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs text-gray-400 uppercase mb-1">Your Name</label>
                                <input 
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-emerald-500"
                                    placeholder="Enter full name"
                                />
                            </div>
                            <div>
                                <SmartDatePicker value={formData.dob} onChange={(d) => setFormData({...formData, dob: d})} />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 uppercase mb-1">What do you seek?</label>
                                <textarea 
                                    value={formData.intent}
                                    onChange={(e) => setFormData({...formData, intent: e.target.value})}
                                    className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-emerald-500 h-24 resize-none"
                                    placeholder="e.g. Wealth, Peace of mind, Marriage stability..."
                                />
                            </div>
                            <Button onClick={handleConsultOracle} disabled={isLoading} className="w-full bg-gradient-to-r from-emerald-700 to-teal-800">
                                {isLoading ? "Channeling..." : "Reveal My Gemstone"}
                            </Button>
                            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                        </div>
                    </Card>

                    <div className="min-h-[400px]">
                        {isLoading && <div className="mt-20"><ProgressBar progress={progress} message="Analyzing Planetary Alignments..." /></div>}
                        
                        {!result && !isLoading && (
                            <div className="h-full flex flex-col items-center justify-center text-emerald-300/30 border-2 border-dashed border-emerald-500/20 rounded-xl p-8">
                                <span className="text-6xl mb-4">💎</span>
                                <p>Your prescribed gemstone and mantra will appear here.</p>
                            </div>
                        )}

                        {result && !isLoading && (
                            <div className="space-y-6 animate-fade-in-up">
                                {/* GEMSTONE RESULT */}
                                <div className="bg-black/60 border border-emerald-500/40 rounded-xl p-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -z-10"></div>
                                    <h4 className="text-xs text-emerald-400 uppercase tracking-widest mb-2">Recommended Gemstone</h4>
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-700 shadow-lg border-2 border-white/20"></div>
                                        <div>
                                            <h2 className="text-3xl font-cinzel font-bold text-white">{result.primaryGem.name}</h2>
                                            <p className="text-emerald-200 text-sm italic">{result.primaryGem.sanskritName}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 text-gray-300 text-sm bg-gray-900/50 p-3 rounded">
                                        <p className="mb-2"><strong className="text-emerald-400">Why:</strong> {result.primaryGem.reason}</p>
                                        <p><strong className="text-emerald-400">How to Wear:</strong> {result.primaryGem.wearingMethod}</p>
                                    </div>
                                </div>

                                {/* MANTRA RESULT */}
                                <div className="bg-black/60 border border-purple-500/40 rounded-xl p-6 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -z-10"></div>
                                    <h4 className="text-xs text-purple-400 uppercase tracking-widest mb-2">Sacred Mantra</h4>
                                    <div className="text-center my-4">
                                        <p className="text-2xl font-bold text-amber-200 font-cinzel">{result.mantra.sanskrit}</p>
                                        <p className="text-sm text-gray-400 mt-1 italic">"{result.mantra.pronunciation}"</p>
                                    </div>
                                    <div className="flex gap-2 justify-center">
                                        <button className="bg-purple-900/50 hover:bg-purple-800 text-purple-200 px-3 py-1 rounded text-xs flex items-center gap-2 transition-colors">
                                            <span>🔊</span> Listen
                                        </button>
                                        <button className="bg-purple-900/50 hover:bg-purple-800 text-purple-200 px-3 py-1 rounded text-xs flex items-center gap-2 transition-colors">
                                            <span>📿</span> 108 Counter
                                        </button>
                                    </div>
                                </div>

                                {/* FULL REPORT UNLOCK */}
                                <div>
                                    {!isPaid ? (
                                        <div className="bg-gray-900/80 p-4 rounded-xl border border-amber-500/20 text-center">
                                            <p className="text-amber-100 mb-4 text-sm">Unlock detailed planetary analysis, consecration rituals (Prana Pratishtha), and lifetime predictions.</p>
                                            <Button onClick={handleReadMore} className="w-full bg-gradient-to-r from-amber-600 to-amber-800">
                                                {t('readMore')}
                                            </Button>
                                            {isAdmin && <button onClick={() => setIsPaid(true)} className="text-xs text-amber-500 underline mt-2">Admin Skip</button>}
                                        </div>
                                    ) : (
                                        <FullReport 
                                            reading={result.fullReading} 
                                            title="Gemstone & Mantra Report" 
                                            subtitle="Vedic Remedial Measures"
                                            imageUrl="https://images.unsplash.com/photo-1615485290382-441e4d049cb5?q=80&w=800"
                                        />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* LIBRARY TAB */}
            {activeTab === 'library' && (
                <div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {(db.gemstones || []).map((gem: any) => (
                            <div 
                                key={gem.id} 
                                onClick={() => setSelectedGem(gem)}
                                className="group bg-gray-900 border border-gray-700 hover:border-amber-500/50 rounded-xl overflow-hidden cursor-pointer transition-all hover:-translate-y-1"
                            >
                                <div className="h-32 bg-gray-800 relative">
                                    <img src={gem.image} alt={gem.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black to-transparent h-12"></div>
                                    <span className="absolute bottom-2 left-2 text-white font-bold font-cinzel">{gem.name}</span>
                                </div>
                                <div className="p-3 text-xs text-gray-400">
                                    <p><span className="text-amber-500">Planet:</span> {gem.planet}</p>
                                    <p><span className="text-amber-500">Zodiac:</span> {gem.zodiac}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* GEM DETAIL MODAL */}
                    {selectedGem && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedGem(null)}>
                            <Card className="max-w-md w-full bg-gray-900 border-amber-500/30 overflow-hidden" onClick={(e: any) => e.stopPropagation()}>
                                <div className="h-48 relative">
                                    <img src={selectedGem.image} alt={selectedGem.name} className="w-full h-full object-cover" />
                                    <button onClick={() => setSelectedGem(null)} className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors">&times;</button>
                                </div>
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-2xl font-bold text-amber-100 font-cinzel">{selectedGem.name}</h2>
                                        <span className="text-sm font-mono text-amber-500 bg-amber-900/30 px-2 py-1 rounded">{selectedGem.sanskrit}</span>
                                    </div>
                                    
                                    <div className="space-y-3 text-sm text-gray-300">
                                        <div className="flex justify-between border-b border-gray-700 pb-2">
                                            <span>Ruling Planet</span>
                                            <span className="font-bold text-white">{selectedGem.planet}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-700 pb-2">
                                            <span>Zodiac Signs</span>
                                            <span className="font-bold text-white">{selectedGem.zodiac}</span>
                                        </div>
                                        <div>
                                            <span className="block text-amber-500 mb-1">Key Benefits</span>
                                            <p className="leading-relaxed">{selectedGem.benefits}</p>
                                        </div>
                                    </div>

                                    <Button onClick={() => { setActiveTab('oracle'); setSelectedGem(null); setFormData(p => ({...p, intent: `Guidance on ${selectedGem.name}`})); }} className="w-full mt-6 bg-gray-800 hover:bg-gray-700 text-xs">
                                        Check if this suits me
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            )}
        </div>
    </div>
  );
};

export default GemstoneGuide;
