import React, { useState, useCallback, useRef, useEffect } from 'react';
// @ts-ignore
import { Link } from 'react-router-dom';
import { getFaceReading } from '../services/geminiService';
import { calculateFaceReading, FaceAnalysis } from '../services/faceReadingEngine';
import Button from './shared/Button';
import ProgressBar from './shared/ProgressBar';
import { useTranslation } from '../hooks/useTranslation';
import { usePayment } from '../context/PaymentContext';
import FullReport from './FullReport';
import { useAuth } from '../context/AuthContext';

const FaceReading: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [reading, setReading] = useState<string>('');
  const [analysisData, setAnalysisData] = useState<FaceAnalysis | null>(null);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [isPaid, setIsPaid] = useState<boolean>(false);
  
  // Camera State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { t, language } = useTranslation();
  const { openPayment } = usePayment();
  const { user } = useAuth();

  // Admin Check
  const ADMIN_EMAILS = ['master@gylphcircle.com', 'admin@gylphcircle.com'];
  const isAdmin = user && ADMIN_EMAILS.includes(user.email);

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  useEffect(() => {
    if (isCameraOpen && videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [isCameraOpen, cameraStream]);

  const handleStartCamera = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      setCameraStream(stream);
      setIsCameraOpen(true);
    } catch (err) {
      console.error(err);
      setError("Unable to access camera. Please check permissions or upload a file.");
    }
  };

  const handleStopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraOpen(false);
  };

  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Optional: Mirror image for selfie natural look
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        
        ctx.drawImage(videoRef.current, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "face_capture.jpg", { type: "image/jpeg" });
            setImageFile(file);
            setImagePreview(URL.createObjectURL(blob));
            handleStopCamera();
            
            setReading('');
            setAnalysisData(null);
            setError('');
            setIsPaid(false);
          }
        }, 'image/jpeg');
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setReading('');
      setAnalysisData(null);
      setError('');
      setIsPaid(false);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getLanguageName = (code: string) => {
      const map: Record<string, string> = {
          en: 'English', hi: 'Hindi', ta: 'Tamil', te: 'Telugu',
          bn: 'Bengali', mr: 'Marathi', es: 'Spanish', fr: 'French',
          ar: 'Arabic', pt: 'Portuguese'
      };
      return map[code] || 'English';
  };

  const handleGetReading = useCallback(async () => {
    if (!imageFile) {
      setError('Please upload an image of your face first.');
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setReading('');
    setAnalysisData(null);
    setError('');

    const timer = setInterval(() => {
        setProgress(prev => {
            if (prev >= 90) return prev;
            return prev + (Math.random() * 8);
        });
    }, 600);

    try {
      const result = await getFaceReading(imageFile, getLanguageName(language));
      
      clearInterval(timer);
      setProgress(100);
      
      if (result.rawMetrics) {
          const analysis = calculateFaceReading(result.rawMetrics);
          setAnalysisData(analysis);
      }
      setReading(result.textReading);

    } catch (err: any) {
      clearInterval(timer);
      setError(`Failed to get reading: ${err.message}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  }, [imageFile, language]);
  
  const handleReadMore = () => {
    openPayment(() => {
        setIsPaid(true);
    });
  };

  // Helper for rendering structured text (Markdown-like)
  const renderStructuredText = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n').filter(l => l.trim().length > 0);

    return (
      <div className="space-y-3 font-lora text-amber-100/90 leading-relaxed text-sm">
        {lines.map((line, idx) => {
          const isBullet = line.trim().startsWith('-') || line.trim().startsWith('•') || line.trim().startsWith('*');
          const cleanLine = line.replace(/^[-•*]\s*/, '');
          
          const parts = cleanLine.split(/(\*\*.*?\*\*)/g);
          const content = parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <span key={i} className="text-amber-400 font-bold">{part.slice(2, -2)}</span>;
            }
            return part;
          });

          if (isBullet) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="text-amber-500 mt-1.5 text-[8px]">●</span>
                <p>{content}</p>
              </div>
            );
          }
          return <p key={idx}>{content}</p>;
        })}
      </div>
    );
  };

  const renderVedicDashboard = () => {
      if (!analysisData) return null;
      const { zones, planetary, charts } = analysisData;

      return (
          <div className="space-y-6 mt-6 animate-fade-in-up">
              {/* 1. Zone Dominance */}
              <div className="bg-black/30 p-4 rounded border border-amber-500/10">
                  <h4 className="text-amber-400 font-bold text-xs uppercase tracking-widest mb-3">Mukha Trikona (3 Zones)</h4>
                  
                  {/* Visual Bars */}
                  <div className="space-y-3 mb-3">
                      <div>
                          <div className="flex justify-between text-xs mb-1">
                              <span className="text-amber-100">Upper (Forehead)</span>
                              <span className="text-amber-400 font-bold">{zones.upper}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-800 rounded-full">
                              <div className="h-full bg-blue-500" style={{ width: `${zones.upper}%` }}></div>
                          </div>
                      </div>
                      <div>
                          <div className="flex justify-between text-xs mb-1">
                              <span className="text-amber-100">Middle (Eyes/Nose)</span>
                              <span className="text-amber-400 font-bold">{zones.middle}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-800 rounded-full">
                              <div className="h-full bg-green-500" style={{ width: `${zones.middle}%` }}></div>
                          </div>
                      </div>
                      <div>
                          <div className="flex justify-between text-xs mb-1">
                              <span className="text-amber-100">Lower (Mouth/Chin)</span>
                              <span className="text-amber-400 font-bold">{zones.lower}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-800 rounded-full">
                              <div className="h-full bg-red-500" style={{ width: `${zones.lower}%` }}></div>
                          </div>
                      </div>
                  </div>
                  <div className="text-center bg-gray-800/50 p-2 rounded text-xs text-amber-200">
                      Dominant: <strong className="text-white">{zones.dominance}</strong> ({analysisData.personality.primary})
                  </div>
              </div>

              {/* 2. Planetary Influences Grid */}
              <div className="bg-black/30 p-4 rounded border border-amber-500/10">
                  <h4 className="text-amber-400 font-bold text-xs uppercase tracking-widest mb-3">Planetary Influences</h4>
                  <div className="grid grid-cols-4 gap-2">
                      {Object.entries(planetary).map(([planet, score]) => (
                          <div key={planet} className="bg-gray-900 p-2 rounded text-center border border-gray-700">
                              <div className="text-[10px] uppercase text-gray-400 mb-1">{planet}</div>
                              <div className={`font-bold text-sm ${(score as number) > 80 ? 'text-green-400' : 'text-amber-100'}`}>{score as number}</div>
                          </div>
                      ))}
                  </div>
              </div>

              {/* 3. Detailed Charts (Grid of 6 Cards) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  
                  {/* Chart 2: Forehead */}
                  <div className="bg-gray-900/60 p-3 rounded border border-amber-500/20">
                      <h5 className="text-[10px] text-amber-500 uppercase tracking-widest mb-2">Forehead Wisdom</h5>
                      <div className="flex justify-between text-xs border-b border-gray-700 pb-1 mb-1">
                          <span>Jupiter</span> <span className="text-white">{charts.foreheadAnalysis.jupiter}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                          <span>Career</span> <span className="text-green-300">{charts.foreheadAnalysis.career}</span>
                      </div>
                  </div>

                  {/* Chart 3: Nose */}
                  <div className="bg-gray-900/60 p-3 rounded border border-amber-500/20">
                      <h5 className="text-[10px] text-amber-500 uppercase tracking-widest mb-2">Nose Ambition</h5>
                      <div className="flex justify-between text-xs border-b border-gray-700 pb-1 mb-1">
                          <span>Mars Score</span> <span className="text-red-300 font-bold">{charts.noseClassification.mars}</span>
                      </div>
                      <div className="text-xs text-center text-amber-100 mt-1 italic">
                          "{charts.noseClassification.wealth}"
                      </div>
                  </div>

                  {/* Chart 4: Eyes */}
                  <div className="bg-gray-900/60 p-3 rounded border border-amber-500/20">
                      <h5 className="text-[10px] text-amber-500 uppercase tracking-widest mb-2">Eye Character</h5>
                      <div className="text-xs text-white mb-1 font-bold">{charts.eyeCharacteristics.type}</div>
                      <div className="text-[10px] text-gray-400">{charts.eyeCharacteristics.personality}</div>
                  </div>

                  {/* Chart 5: Jaw */}
                  <div className="bg-gray-900/60 p-3 rounded border border-amber-500/20">
                      <h5 className="text-[10px] text-amber-500 uppercase tracking-widest mb-2">Jaw Discipline</h5>
                      <div className="flex justify-between text-xs border-b border-gray-700 pb-1 mb-1">
                          <span>Saturn</span> <span className="text-blue-300 font-bold">{charts.jawAnalysis.saturn}</span>
                      </div>
                      <div className="text-[10px] text-gray-400">{charts.jawAnalysis.approach}</div>
                  </div>

                  {/* Chart 6: Symmetry */}
                  <div className="bg-gray-900/60 p-3 rounded border border-amber-500/20 col-span-1 md:col-span-2 flex justify-between items-center">
                      <div>
                          <h5 className="text-[10px] text-amber-500 uppercase tracking-widest">Karmic Symmetry</h5>
                          <span className="text-xs text-white block">{charts.symmetryHealth.karmic} Balance</span>
                      </div>
                      <div className="text-right">
                          <span className="text-xs text-green-400 font-bold block">{charts.symmetryHealth.health}</span>
                      </div>
                  </div>
              </div>
          </div>
      );
  };

  return (
    <>
      <div>
          <Link to="/home" className="inline-flex items-center text-amber-200 hover:text-amber-400 transition-colors mb-4 group">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t('backToHome')}
          </Link>
          <div className="max-w-4xl mx-auto p-6 bg-gray-800 bg-opacity-50 rounded-xl shadow-2xl border border-amber-500/20">
            <h2 className="text-3xl font-bold text-center text-amber-300 mb-6">{t('aiFaceReading')}</h2>
            <p className="text-center text-amber-100 mb-8">
              {t('uploadFacePrompt')}
            </p>

            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div className="flex flex-col items-center">
                {isCameraOpen ? (
                    <div className="w-full relative bg-black rounded-lg overflow-hidden border-2 border-amber-500 shadow-xl">
                        <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline 
                            muted
                            className="w-full h-64 object-cover transform scale-x-[-1]" 
                        />
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 z-10">
                            <button 
                                onClick={handleStopCamera}
                                className="bg-red-600/80 hover:bg-red-600 text-white p-2 rounded-full backdrop-blur-sm"
                                title="Close Camera"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <button 
                                onClick={handleCapture}
                                className="bg-white/90 hover:bg-white text-black p-4 rounded-full shadow-lg backdrop-blur-sm border-4 border-amber-500/50 transform active:scale-95 transition-transform"
                                title="Take Selfie"
                            >
                                <div className="w-4 h-4 bg-red-600 rounded-full"></div>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="w-full">
                        <label htmlFor="face-upload" className="w-full">
                          <div className="w-full h-64 border-2 border-dashed border-amber-400 rounded-lg flex flex-col justify-center items-center cursor-pointer hover:bg-amber-900/20 transition-colors">
                            {imagePreview ? (
                              <img src={imagePreview} alt="Face preview" className="object-contain h-full w-full rounded-lg" />
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
                        <input id="face-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                        
                        <div className="mt-4">
                             <Button onClick={handleStartCamera} className="w-full bg-gray-800 hover:bg-gray-700 border-gray-600 text-sm py-2 flex items-center justify-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Take Selfie
                             </Button>
                        </div>
                    </div>
                )}

                {imageFile && !isCameraOpen && (
                  <Button onClick={handleGetReading} disabled={isLoading} className="mt-6 w-full">
                      {isLoading ? t('analyzing') : t('getYourReading')}
                  </Button>
                )}
              </div>

              <div className="min-h-[16rem] bg-black bg-opacity-30 p-6 rounded-lg border border-amber-500/20">
                <h3 className="text-2xl font-semibold text-amber-300 mb-4">{t('yourReading')}</h3>
                
                {isLoading && (
                    <ProgressBar 
                        progress={progress} 
                        message="Mapping Facial Landmarks..." 
                        estimatedTime="Approx. 10 seconds"
                    />
                )}
                
                {error && <p className="text-red-400">{error}</p>}
                
                {analysisData && !isLoading && (
                   <div className="space-y-4 text-amber-100 w-full">
                        {/* Render New Vedic Dashboard (Free Preview) */}
                        {renderVedicDashboard()}

                        {!isPaid ? (
                            <>
                                <div className="mt-6 bg-black/40 p-5 rounded-lg border border-amber-500/20 shadow-inner">
                                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-amber-500/20">
                                        <span className="text-xl">🕉️</span>
                                        <h4 className="text-amber-300 font-cinzel font-bold text-sm">Vedic Insight Summary</h4>
                                    </div>
                                    {renderStructuredText(reading)}
                                </div>

                                <div className="pt-4 border-t border-amber-500/20 flex flex-col gap-2 mt-4">
                                   <Button onClick={handleReadMore} className="w-full bg-gradient-to-r from-amber-600 to-maroon-700 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.4)]">
                                       {t('readMore')}
                                   </Button>
                                   {isAdmin && (
                                      <button 
                                        onClick={() => setIsPaid(true)} 
                                        className="text-xs text-amber-500 hover:text-amber-300 underline font-mono"
                                      >
                                          👑 Admin Access: Skip Payment
                                      </button>
                                   )}
                               </div>
                            </>
                        ) : (
                            <FullReport reading={reading} title={t('aiFaceReading')} />
                        )}
                   </div>
                )}
                {!isLoading && !reading && !error && (
                  <p className="text-amber-200 opacity-60">{t('faceReadingPlaceholder')}</p>
                )}
              </div>
            </div>
          </div>
      </div>
    </>
  );
};

export default FaceReading;