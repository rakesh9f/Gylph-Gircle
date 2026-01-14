
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAstroNumeroReading } from '../services/geminiService';
import Button from './shared/Button';
import Loader from './shared/Loader';
import Card from './shared/Card';
import { useTranslation } from '../hooks/useTranslation';
import { usePayment } from '../context/PaymentContext';
import FullReport from './FullReport';
import { useDb } from '../hooks/useDb';

interface NumerologyAstrologyProps {
  mode: 'numerology' | 'astrology';
}

const NumerologyAstrology: React.FC<NumerologyAstrologyProps> = ({ mode }) => {
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    pob: '',
    tob: '',
  });
  const [reading, setReading] = useState<string>('');
  const [chartData, setChartData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { t, language } = useTranslation();
  const { openPayment } = usePayment();
  const { db } = useDb();

  // Get Chart Images from DB
  const defaultAstroChart = db.image_assets?.find(a => a.id === 'chart_kundali_default')?.path || 'https://via.placeholder.com/300?text=Chart';
  const defaultNumeroChart = db.image_assets?.find(a => a.id === 'chart_numerology_default')?.path || 'https://via.placeholder.com/300?text=Grid';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.name || !formData.dob) {
        return 'Name and Date of Birth are required.';
    }
    if (mode === 'astrology' && (!formData.pob || !formData.tob)) {
        return 'Place and Time of Birth are required for Astrology.';
    }
    return '';
  }

  // Helper mapping for language codes to full names for prompt
  const getLanguageName = (code: string) => {
      const map: Record<string, string> = {
          en: 'English', hi: 'Hindi', ta: 'Tamil', te: 'Telugu',
          bn: 'Bengali', mr: 'Marathi', es: 'Spanish', fr: 'French',
          ar: 'Arabic', pt: 'Portuguese'
      };
      return map[code] || 'English';
  };

  const handleGetReading = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
        setError(validationError);
        return;
    }

    setIsLoading(true);
    setReading('');
    setChartData(null);
    setError('');
    setIsPaid(false);

    try {
      const result = await getAstroNumeroReading({ 
          mode, 
          ...formData, 
          language: getLanguageName(language) 
      });
      setReading(result.reading);
      setChartData(result.chartData);
    } catch (err: any) {
      setError(`Failed to get reading: ${err.message}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  }, [formData, mode, language]);
  
  const handleReadMore = () => {
    openPayment(() => {
        setIsPaid(true);
    });
  };

  // --- CHART DRAWING LOGIC ---
  useEffect(() => {
    if ((reading || chartData || mode === 'numerology') && !isLoading && canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Background
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (mode === 'numerology' && formData.dob) {
            drawLoShuGrid(ctx, canvas.width, canvas.height, formData.dob);
        } else if (mode === 'astrology' && chartData) {
            drawNorthIndianChart(ctx, canvas.width, canvas.height, chartData);
        }
    }
  }, [reading, chartData, mode, isLoading, formData.dob]);

  const drawLoShuGrid = (ctx: CanvasRenderingContext2D, w: number, h: number, dob: string) => {
      // Extract digits from DOB (YYYY-MM-DD)
      const digits = dob.replace(/[^0-9]/g, '');
      
      // Lo Shu Positions
      // 4 9 2
      // 3 5 7
      // 8 1 6
      const posMap: Record<string, {x: number, y: number}> = {
          '4': {x: 0, y: 0}, '9': {x: 1, y: 0}, '2': {x: 2, y: 0},
          '3': {x: 0, y: 1}, '5': {x: 1, y: 1}, '7': {x: 2, y: 1},
          '8': {x: 0, y: 2}, '1': {x: 1, y: 2}, '6': {x: 2, y: 2}
      };

      const cellW = w / 3;
      const cellH = h / 3;

      // Draw Grid Lines
      ctx.strokeStyle = '#F59E0B'; // Amber
      ctx.lineWidth = 2;
      
      // Verticals
      ctx.beginPath();
      ctx.moveTo(cellW, 0); ctx.lineTo(cellW, h);
      ctx.moveTo(cellW * 2, 0); ctx.lineTo(cellW * 2, h);
      // Horizontals
      ctx.moveTo(0, cellH); ctx.lineTo(w, cellH);
      ctx.moveTo(0, cellH * 2); ctx.lineTo(w, cellH * 2);
      ctx.stroke();

      // Draw Numbers
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 24px Cinzel';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Count frequency of each digit
      const counts: Record<string, number> = {};
      for (const char of digits) {
          counts[char] = (counts[char] || 0) + 1;
      }

      // Render
      Object.keys(posMap).forEach(num => {
          if (counts[num]) {
              const {x, y} = posMap[num];
              const centerX = (x * cellW) + (cellW / 2);
              const centerY = (y * cellH) + (cellH / 2);
              const text = num.repeat(counts[num]); // e.g. "11" if appearing twice
              ctx.fillText(text, centerX, centerY);
          }
      });
  };

  const drawNorthIndianChart = (ctx: CanvasRenderingContext2D, w: number, h: number, houses: any) => {
      // Draw Square Border
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2;
      ctx.strokeRect(2, 2, w-4, h-4);

      // Draw Diagonals
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(w, h);
      ctx.moveTo(w, 0); ctx.lineTo(0, h);
      ctx.stroke();

      // Draw Midpoint Diamond
      ctx.beginPath();
      ctx.moveTo(w/2, 0); ctx.lineTo(w, h/2);
      ctx.lineTo(w/2, h); ctx.lineTo(0, h/2);
      ctx.lineTo(w/2, 0);
      ctx.stroke();

      // Label Houses (Approximate centers of the 12 zones)
      // North Indian Layout mapping
      const zones = [
          {id: "1", x: w/2, y: h/4, label: "1"}, // Top Diamond
          {id: "2", x: w/4, y: h/8, label: "2"}, // Top Left Tri
          {id: "3", x: w/8, y: h/4, label: "3"}, // Left Top Tri
          {id: "4", x: w/4, y: h/2, label: "4"}, // Left Diamond
          {id: "5", x: w/8, y: (h/4)*3, label: "5"}, // Left Bot Tri
          {id: "6", x: w/4, y: (h/8)*7, label: "6"}, // Bot Left Tri
          {id: "7", x: w/2, y: (h/4)*3, label: "7"}, // Bot Diamond
          {id: "8", x: (w/4)*3, y: (h/8)*7, label: "8"}, // Bot Right Tri
          {id: "9", x: (w/8)*7, y: (h/4)*3, label: "9"}, // Right Bot Tri
          {id: "10", x: (w/4)*3, y: h/2, label: "10"}, // Right Diamond
          {id: "11", x: (w/8)*7, y: h/4, label: "11"}, // Right Top Tri
          {id: "12", x: (w/4)*3, y: h/8, label: "12"}, // Top Right Tri
      ];

      ctx.fillStyle = '#FBBF24'; // Amber-400
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';

      zones.forEach(z => {
          // Draw Planets
          if (houses && houses[z.label]) {
              const planets = houses[z.label];
              ctx.font = 'bold 12px Cinzel';
              ctx.fillStyle = '#fff';
              // Stack planets vertically
              planets.forEach((p: string, i: number) => {
                  ctx.fillText(p.substring(0, 3), z.x, z.y + (i * 12));
              });
          }
      });
  };

  const featureName = mode === 'astrology' ? t('astrology') : t('numerology');
  const featureTitle = mode === 'astrology' ? t('astrologyReading') : t('numerologyReading');

  return (
    <>
      <div className="max-w-4xl mx-auto">
          <Link to="/home" className="inline-flex items-center text-amber-200 hover:text-amber-400 transition-colors mb-4 group">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t('backToHome')}
          </Link>
        <Card>
          <div className="p-6">
            <h2 className="text-3xl font-bold text-center text-amber-300 mb-6">{featureTitle}</h2>
            <p className="text-center text-amber-100 mb-8">
              {t('enterDetailsPrompt', { featureName: featureName.toLowerCase() })}
            </p>

            <form onSubmit={handleGetReading} className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-amber-200 mb-2 font-bold">{t('fullName')}</label>
                <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} className="w-full p-3 bg-gray-900 border border-amber-500/30 rounded-lg text-amber-50 focus:ring-1 focus:ring-amber-500" placeholder="e.g. John Doe" />
              </div>
              <div className={mode === 'numerology' ? "md:col-span-2" : ""}>
                <label htmlFor="dob" className="block text-amber-200 mb-2 font-bold">Date of Birth</label>
                <input type="date" name="dob" id="dob" value={formData.dob} onChange={handleInputChange} className="w-full p-3 bg-gray-900 border border-amber-500/30 rounded-lg text-amber-50 focus:ring-1 focus:ring-amber-500" />
                <span className="text-xs text-amber-200/50 mt-1 block pl-1">Format: DD/MM/YYYY (Use calendar icon to select)</span>
              </div>
              
              {mode === 'astrology' && (
                <>
                    <div>
                      <label htmlFor="pob" className="block text-amber-200 mb-2 font-bold">{t('pob')}</label>
                      <input type="text" name="pob" id="pob" value={formData.pob} onChange={handleInputChange} className="w-full p-3 bg-gray-900 border border-amber-500/30 rounded-lg text-amber-50 focus:ring-1 focus:ring-amber-500" placeholder="e.g. New York, USA" />
                    </div>
                    <div>
                      <label htmlFor="tob" className="block text-amber-200 mb-2 font-bold">{t('tob')}</label>
                      <input type="time" name="tob" id="tob" value={formData.tob} onChange={handleInputChange} className="w-full p-3 bg-gray-900 border border-amber-500/30 rounded-lg text-amber-50 focus:ring-1 focus:ring-amber-500" />
                    </div>
                </>
              )}

              <div className="md:col-span-2 text-center">
                  <Button type="submit" disabled={isLoading} className="mt-4 w-full md:w-auto px-12">
                      {isLoading ? t('generating') : "Reveal My Destiny"}
                  </Button>
              </div>
            </form>
            {error && <p className="text-red-400 text-center mb-4 bg-red-900/20 p-2 rounded">{error}</p>}
          </div>
        </Card>
        
        {(isLoading || reading) && (
          <Card className="mt-8 animate-fade-in-up">
              <div className="p-6">
                  <h3 className="text-2xl font-semibold text-amber-300 mb-4 text-center">{t('yourSummary', { featureName })}</h3>
                  {isLoading && <Loader />}
                  {reading && (
                      <div className="w-full">
                          {!isPaid ? (
                              <div className="grid md:grid-cols-2 gap-8 items-center">
                                  {/* Dynamic Canvas Chart */}
                                  <div className="bg-black/40 p-4 rounded-lg border border-amber-500/20 flex justify-center">
                                      <canvas 
                                        ref={canvasRef} 
                                        width={300} 
                                        height={300} 
                                        className="max-w-full h-auto rounded shadow-lg bg-[#1a1a1a]"
                                      />
                                  </div>
                                  <div className="space-y-4 text-amber-100">
                                      {/* Truncate reading for preview */}
                                      <div className="whitespace-pre-wrap italic font-lora border-l-2 border-amber-500/30 pl-4">
                                          {/* Simple cleanup for preview */}
                                          {reading.replace(/#/g, '').replace(/\*\*/g, '').split(' ').slice(0, 30).join(' ')}...
                                      </div>
                                      <div className="pt-4 border-t border-amber-500/20">
                                          <Button onClick={handleReadMore} className="w-full bg-gradient-to-r from-amber-600 to-maroon-700 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.4)]">
                                            {t('readMore')}
                                          </Button>
                                      </div>
                                  </div>
                              </div>
                          ) : (
                              <FullReport 
                                reading={reading} 
                                title={t('yourSummary', { featureName })} 
                                imageUrl={mode === 'astrology' ? defaultAstroChart : defaultNumeroChart}
                              />
                          )}
                      </div>
                  )}
              </div>
          </Card>
        )}

      </div>
    </>
  );
};

export default NumerologyAstrology;
