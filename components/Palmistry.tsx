
import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getPalmReading } from '../services/geminiService';
import Button from './shared/Button';
import Loader from './shared/Loader';
import Modal from './shared/Modal';
import PaymentGateway from './PaymentGateway';
import { useTranslation } from '../hooks/useTranslation';

const Palmistry: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [reading, setReading] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const { t } = useTranslation();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setReading('');
      setError('');
      setIsPaid(false);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGetReading = useCallback(async () => {
    if (!imageFile) {
      setError('Please upload an image of your palm first.');
      return;
    }

    setIsLoading(true);
    setReading('');
    setError('');

    try {
      const result = await getPalmReading(imageFile);
      setReading(result);
    } catch (err: any)
      {
      setError(`Failed to get reading: ${err.message}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  }, [imageFile]);

  const handlePaymentSuccess = () => {
    setIsPaid(true);
    setIsPaymentModalOpen(false);
  };

  return (
    <>
      <Modal isVisible={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)}>
        <PaymentGateway onPaymentSuccess={handlePaymentSuccess} />
      </Modal>
      <div>
          <Link to="/home" className="inline-flex items-center text-amber-200 hover:text-amber-400 transition-colors mb-4 group">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t('backToHome')}
          </Link>
          <div className="max-w-4xl mx-auto p-6 bg-gray-800 bg-opacity-50 rounded-xl shadow-2xl border border-amber-500/20">
            <h2 className="text-3xl font-bold text-center text-amber-300 mb-6">{t('aiPalmReading')}</h2>
            <p className="text-center text-amber-100 mb-8">
              {t('uploadPalmPrompt')}
            </p>

            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div className="flex flex-col items-center">
                <label htmlFor="palm-upload" className="w-full">
                  <div className="w-full h-64 border-2 border-dashed border-amber-400 rounded-lg flex flex-col justify-center items-center cursor-pointer hover:bg-amber-900/20 transition-colors">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Palm preview" className="object-contain h-full w-full rounded-lg" />
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-amber-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <span className="text-amber-200">{t('uploadInstruction')}</span>
                      </>
                    )}
                  </div>
                </label>
                <input id="palm-upload" type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
                {imageFile && (
                  <Button onClick={handleGetReading} disabled={isLoading} className="mt-6">
                      {isLoading ? t('analyzing') : t('getYourReading')}
                  </Button>
                )}
              </div>

              <div className="min-h-[16rem] bg-black bg-opacity-30 p-6 rounded-lg border border-amber-500/20">
                <h3 className="text-2xl font-semibold text-amber-300 mb-4">{t('yourReading')}</h3>
                {isLoading && <Loader />}
                {error && <p className="text-red-400">{error}</p>}
                {reading && (
                  <div className="space-y-4 text-amber-100">
                    <p className="whitespace-pre-wrap">{reading}</p>
                      <div className="pt-4 border-t border-amber-500/20 flex flex-col sm:flex-row gap-4">
                        {!isPaid ? (
                          <Button onClick={() => setIsPaymentModalOpen(true)} className="w-full">{t('readMore')}</Button>
                        ) : (
                          <div className="w-full text-center">
                            <p className="text-green-400 font-bold mb-4">{t('paymentSuccessful')}</p>
                            <div className="flex gap-4">
                                <Button className="w-full" onClick={() => alert('Downloading PDF...')}>{t('downloadPDF')}</Button>
                                <Button className="w-full" onClick={() => alert('Emailing report...')}>{t('emailReport')}</Button>
                            </div>
                          </div>
                        )}
                      </div>
                  </div>
                )}
                {!isLoading && !reading && !error && (
                  <p className="text-amber-200 opacity-60">{t('readingPlaceholder')}</p>
                )}
              </div>
            </div>
          </div>
      </div>
    </>
  );
};

export default Palmistry;
