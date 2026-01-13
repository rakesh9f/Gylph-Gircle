
import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAstroNumeroReading } from '../services/geminiService';
import Button from './shared/Button';
import Loader from './shared/Loader';
import Card from './shared/Card';
import { useTranslation } from '../hooks/useTranslation';
import { usePayment } from '../context/PaymentContext';
import FullReport from './FullReport';

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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const { t } = useTranslation();
  const { openPayment } = usePayment();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.name || !formData.dob) {
        return 'Name and Date of Birth are required.';
    }
    // Strict Input Validation based on mode
    if (mode === 'numerology') {
         // No extra checks needed for numerology besides name/dob
    }
    if (mode === 'astrology' && (!formData.pob || !formData.tob)) {
        return 'Place and Time of Birth are required for Astrology.';
    }
    return '';
  }

  const handleGetReading = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
        setError(validationError);
        return;
    }

    setIsLoading(true);
    setReading('');
    setError('');
    setIsPaid(false);

    try {
      const result = await getAstroNumeroReading({ mode, ...formData });
      setReading(result);
    } catch (err: any) {
      setError(`Failed to get reading: ${err.message}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  }, [formData, mode]);
  
  const handleReadMore = () => {
    openPayment(() => {
        setIsPaid(true);
    });
  };

  const featureName = mode === 'astrology' ? t('astrology') : t('numerology');
  const featureTitle = mode === 'astrology' ? t('astrologyReading') : t('numerologyReading');
  const chartUrl = mode === 'astrology' 
    ? 'https://i.imgur.com/b4H801o.png' // Kundali chart
    : 'https://i.imgur.com/v8kCV87.png'; // Numerology chart

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
                <label htmlFor="dob" className="block text-amber-200 mb-2 font-bold">{t('dob')}</label>
                <input type="date" name="dob" id="dob" value={formData.dob} onChange={handleInputChange} className="w-full p-3 bg-gray-900 border border-amber-500/30 rounded-lg text-amber-50 focus:ring-1 focus:ring-amber-500" />
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
                      {isLoading ? t('generating') : t('getMy', { featureName })}
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
                                  <div className="bg-black/20 p-4 rounded-lg border border-amber-500/20">
                                      <img src={chartUrl} alt={`${featureName} Chart`} className="w-full rounded-md shadow-lg" />
                                  </div>
                                  <div className="space-y-4 text-amber-100">
                                      <div className="whitespace-pre-wrap italic font-lora border-l-2 border-amber-500/30 pl-4">{reading}</div>
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
                                imageUrl={chartUrl}
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
