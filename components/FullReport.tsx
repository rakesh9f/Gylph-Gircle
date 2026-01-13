import React from 'react';
import { Link } from 'react-router-dom';
import Button from './shared/Button';
import { useTranslation } from '../hooks/useTranslation';

interface FullReportProps {
  reading: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
}

const FullReport: React.FC<FullReportProps> = ({ reading, title, subtitle, imageUrl }) => {
  const { t } = useTranslation();

  return (
    <div className="animate-fade-in-up w-full">
      <div className="w-full text-center bg-gradient-to-b from-green-900/30 to-black/50 p-6 rounded-xl border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.1)] mb-6">
        <p className="text-green-400 font-bold mb-6 flex items-center justify-center gap-2 text-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {t('paymentSuccessful')}
        </p>
        
        <div className="text-left bg-black/40 p-6 rounded-lg border border-amber-500/10 mb-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/50"></div>
            <h3 className="text-xl font-cinzel text-amber-200 mb-4 border-b border-amber-500/20 pb-2">{title}</h3>
            {subtitle && <p className="text-amber-500/70 text-xs font-bold uppercase tracking-widest mb-4">{subtitle}</p>}
            
            <div className={`text-amber-100/90 font-lora leading-relaxed space-y-4 text-justify ${imageUrl ? 'md:flex md:gap-6' : ''}`}>
               {imageUrl && (
                   <div className="md:w-1/3 mb-4 md:mb-0 flex-shrink-0">
                       <img src={imageUrl} alt="Chart" className="w-full rounded-lg border border-amber-500/20 shadow-lg" />
                   </div>
               )}
               <div className={imageUrl ? 'md:w-2/3' : 'w-full'}>
                   <p className="italic">"{reading}"</p>
                   <div className="mt-4 pt-4 border-t border-amber-500/10 grid md:grid-cols-2 gap-4">
                      <div>
                        <strong className="text-amber-400 block mb-1">Key Insight</strong>
                        <p className="text-sm text-amber-200/70">Transformation is imminent. Trust the process.</p>
                      </div>
                      <div>
                        <strong className="text-amber-400 block mb-1">Actionable Advice</strong>
                        <p className="text-sm text-amber-200/70">Take a leap of faith today.</p>
                      </div>
                   </div>
               </div>
            </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Button className="w-full sm:w-auto text-sm bg-gray-700 hover:bg-gray-600 border-gray-500" onClick={() => alert('Downloading PDF...')}>
                <span className="flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0l-4 4m4-4v12" />
                    </svg>
                    {t('downloadPDF')}
                </span>
            </Button>
            <Button className="w-full sm:w-auto text-sm bg-gray-700 hover:bg-gray-600 border-gray-500" onClick={() => alert('Emailing report...')}>
                 <span className="flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {t('emailReport')}
                </span>
            </Button>
        </div>
        
        <Link to="/home">
            <Button className="w-full bg-gradient-to-r from-amber-700 to-maroon-800 hover:from-amber-600 hover:to-maroon-700 border-amber-500/50 shadow-xl">
                 <span className="flex items-center justify-center gap-2 font-cinzel tracking-wider">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    {t('backToDashboard')}
                </span>
            </Button>
        </Link>
      </div>
    </div>
  );
};

export default FullReport;