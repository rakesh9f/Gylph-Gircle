
import React, { useState, useEffect } from 'react';
// @ts-ignore
import { Link } from 'react-router-dom';
import { SERVICE_OPTIONS, BACKGROUND_IMAGES } from '../constants';
import { useDb } from '../hooks/useDb';
import { useAuth } from '../context/AuthContext';
import Card from './shared/Card';
import { useTranslation } from '../hooks/useTranslation';
import { cloudManager } from '../services/cloudManager';
import { biometricService } from '../services/biometricService';

const Home: React.FC = () => {
  const [bgIndex, setBgIndex] = useState(0);
  const { db } = useDb();
  const { user } = useAuth();
  const activeFeature = db.featured_content?.find((c: any) => c.status === 'active');
  const { t } = useTranslation();
  const [showBioSetup, setShowBioSetup] = useState(false);

  // --- DYNAMIC SERVICES LOGIC ---
  // Merge static constant metadata (like icons) with dynamic DB data (images, names)
  const dbServices = (db.services || []);
  
  const displayServices = SERVICE_OPTIONS.map(staticOpt => {
      // Find matching entry in DB (by ID)
      const dynamicEntry = dbServices.find((s: any) => s.id === staticOpt.id);
      
      // If found in DB, prefer DB values for name/desc/image
      if (dynamicEntry) {
          return {
              ...staticOpt,
              ...dynamicEntry, // Overwrites name, description, and adds image if present
              // Ensure we use the static icon as fallback if DB doesn't have one (DB usually won't have React Node icons)
              icon: staticOpt.icon
          };
      }
      return staticOpt;
  }).filter(s => {
      // Filter out if marked inactive in DB
      if (s.status === 'inactive') return false;
      return true;
  });

  const ADMIN_EMAILS = ['master@gylphcircle.com', 'admin@gylphcircle.com'];
  const isAdmin = user && ADMIN_EMAILS.includes(user.email);

  useEffect(() => {
    const timer = setInterval(() => {
      setBgIndex((prevIndex) => (prevIndex + 1) % BACKGROUND_IMAGES.length);
    }, 8000); 
    
    if (user && !localStorage.getItem('glyph_bio_registered')) {
        biometricService.isAvailable().then(avail => {
            if (avail) setShowBioSetup(true);
        });
    }

    return () => clearInterval(timer);
  }, [user]);

  const handleRegisterBiometric = async (e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      if (!user) return;
      
      const btn = document.getElementById('bio-setup-btn');
      if(btn) btn.innerText = "Scanning...";
      
      try {
          if (navigator.vibrate) navigator.vibrate(50);
          const credId = await biometricService.register(user.id, user.name);
          
          if (credId) {
              if (navigator.vibrate) navigator.vibrate([50, 100]);
              alert("Biometrics Registered Successfully! You can now log in using fingerprint or Face ID.");
              localStorage.setItem('glyph_bio_registered', 'true');
              setShowBioSetup(false);
          } else {
              alert("Registration incomplete. Please try again.");
              if(btn) btn.innerText = "Setup";
          }
      } catch (err: any) {
          console.error(err);
          if (err.name !== 'NotAllowedError' && err.message !== 'The operation was canceled.') {
             alert(`Registration failed: ${err.message || 'Unknown error'}`);
          }
          if(btn) btn.innerText = "Retry";
      }
  };

  return (
    <div className="-mt-8 -mx-4 relative min-h-[calc(100vh-80px)] overflow-hidden">
      {/* Dynamic Background Slider */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        {BACKGROUND_IMAGES.map((image, index) => (
          <div
            key={index}
            className="absolute inset-0 bg-cover bg-center will-change-transform will-change-opacity"
            style={{ 
                backgroundImage: `url(${image})`, 
                opacity: index === bgIndex ? 1 : 0,
                transform: index === bgIndex ? 'scale(1.1)' : 'scale(1.0)',
                transition: 'opacity 2000ms ease-in-out, transform 8000ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                zIndex: -1
            }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A]/80 via-[#310000]/40 to-[#450a0a]/90 mix-blend-multiply z-0 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.8)_100%)] z-0 pointer-events-none" />
      </div>

      <div className="relative z-10 container mx-auto px-4 pt-32 pb-16 md:py-20 flex flex-col items-center">
        
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-20 max-w-5xl mx-auto animate-fade-in-up">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-cinzel font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 mb-6 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] tracking-wide">
                {t('welcomeToPath')}
            </h1>
            <div className="flex items-center justify-center gap-4 mb-8 opacity-80">
                <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-amber-500"></div>
                <div className="text-amber-400 text-xl">✦</div>
                <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-amber-500"></div>
            </div>
            <p className="text-xl md:text-2xl text-amber-100/90 font-lora italic max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
                {t('chooseService')}
            </p>
        </div>
        
        {/* Biometric Setup Prompt */}
        {showBioSetup && (
            <div className="w-full max-w-md mb-8 animate-fade-in-up">
                <div 
                    onClick={(e) => handleRegisterBiometric(e)}
                    className="bg-purple-900/60 hover:bg-purple-900/80 border border-purple-500/50 p-4 rounded-xl flex items-center justify-between backdrop-blur-md shadow-[0_0_20px_rgba(139,92,246,0.2)] cursor-pointer transition-all active:scale-95 group"
                >
                    <div className="flex items-center gap-3">
                        <span className="text-2xl animate-pulse">👆</span>
                        <div>
                            <h4 className="text-purple-100 font-bold text-sm group-hover:text-purple-50">Secure Your Sanctuary</h4>
                            <p className="text-purple-300 text-xs">Enable fingerprint login for instant access.</p>
                        </div>
                    </div>
                    <button 
                        id="bio-setup-btn"
                        className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-lg"
                    >
                        Setup
                    </button>
                </div>
            </div>
        )}
        
        {/* Featured Content Card */}
         {activeFeature && (
            <div className="w-full max-w-5xl mb-24 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <Card className="border border-amber-500/30 bg-black/40 backdrop-blur-xl overflow-hidden group hover:border-amber-400/60 transition-colors duration-500 shadow-2xl">
                  <div className="md:flex h-full">
                    {activeFeature.image_url && (
                        <div className="md:w-2/5 h-72 md:h-auto feature-image-container">
                            <img 
                                src={cloudManager.resolveImage(activeFeature.image_url)} 
                                alt={activeFeature.title} 
                                className="dynamic-image" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent md:bg-gradient-to-l pointer-events-none"></div>
                        </div>
                    )}
                    <div className={`p-8 md:p-12 flex flex-col justify-center ${activeFeature.image_url ? 'md:w-3/5' : 'w-full'}`}>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="h-px w-8 bg-amber-500"></span>
                            <span className="text-amber-400 text-xs font-bold uppercase tracking-[0.25em] font-cinzel">Mystic Insight</span>
                        </div>
                        <h3 className="text-3xl font-cinzel font-bold text-amber-100 mb-6 group-hover:text-amber-300 transition-colors">{activeFeature.title}</h3>
                        <p className="text-amber-200/80 text-lg font-lora leading-relaxed border-l-2 border-amber-500/20 pl-6">{activeFeature.text}</p>
                    </div>
                  </div>
                </Card>
            </div>
        )}

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-10 max-w-7xl mx-auto w-full px-2">
          {displayServices.map((service: any, idx: number) => {
            // Determine image to show: prefer DB image (service.image) if available and valid
            const hasImage = service.image && service.image.length > 5;
            const imageUrl = hasImage ? cloudManager.resolveImage(service.image) : null;

            return (
                <Link 
                    to={service.path} 
                    key={service.id} 
                    className="group relative transform transition-all duration-500 hover:-translate-y-2 hover:z-10"
                    style={{ animation: `fadeInUp 0.8s ease-out forwards ${0.4 + idx * 0.1}s`, opacity: 0 }}
                >
                <div className="absolute -inset-0.5 bg-gradient-to-br from-amber-600/20 to-maroon-600/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-700"></div>
                <Card className="h-full bg-gradient-to-b from-gray-900/80 to-black/80 backdrop-blur-md border border-amber-500/20 group-hover:border-amber-400/50 group-hover:bg-black/80 transition-all duration-500 relative overflow-hidden flex flex-col">
                    
                    {imageUrl && (
                        <div className="h-48 feature-image-container border-b border-amber-500/10">
                            <img 
                                src={imageUrl} 
                                alt={service.name} 
                                className="dynamic-image opacity-80 group-hover:opacity-100"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none'; // Hide if broken
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none"></div>
                        </div>
                    )}

                    <div className={`flex flex-col items-center p-8 text-center relative z-10 ${imageUrl ? '-mt-12' : ''}`}>
                    <div className="absolute top-4 right-4 text-amber-500/30 group-hover:text-amber-400/80 transition-colors duration-500 animate-float">✧</div>
                    <div className={`mb-6 p-4 rounded-full bg-black/60 border border-amber-500/30 text-amber-400 group-hover:text-amber-100 group-hover:bg-gradient-to-br group-hover:from-maroon-800 group-hover:to-amber-700 group-hover:border-amber-400/50 transform group-hover:scale-110 transition-all duration-500 shadow-[0_0_15px_rgba(251,191,36,0.1)] backdrop-blur-xl ${imageUrl ? 'shadow-2xl' : ''}`}>
                        {service.icon}
                    </div>
                    
                    <h3 className="text-2xl font-cinzel font-bold mb-4 text-amber-100 group-hover:text-amber-300 transition-colors tracking-wide">{t(service.id) || service.name}</h3>
                    <div className="w-16 h-px bg-amber-500/30 mb-6 group-hover:w-32 group-hover:bg-gradient-to-r group-hover:from-transparent group-hover:via-amber-400 group-hover:to-transparent transition-all duration-700"></div>
                    <p className="text-amber-200/60 font-lora text-sm leading-7 mb-8 group-hover:text-amber-100/90 transition-colors">
                        {t(`${service.id}Desc`) || service.description}
                    </p>
                    <div className="mt-auto opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                        <span className="text-amber-400 text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2 group-hover:gap-3 transition-all">
                            Enter <span className="text-lg leading-none">›</span>
                        </span>
                    </div>
                    </div>
                </Card>
                </Link>
            );
          })}

          {isAdmin && (
             <Link 
                to="/admin/config" 
                className="group relative transform transition-all duration-500 hover:-translate-y-2 hover:z-10"
                style={{ animation: `fadeInUp 0.8s ease-out forwards 1s`, opacity: 0 }}
             >
              <div className="absolute -inset-0.5 bg-gradient-to-br from-green-600/20 to-blue-600/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-700"></div>
              <Card className="h-full bg-gradient-to-b from-gray-900/90 to-blue-950/80 backdrop-blur-md border border-green-500/40 group-hover:border-green-400 group-hover:bg-black/80 transition-all duration-500 relative overflow-hidden">
                <div className="flex flex-col items-center p-8 h-full text-center relative z-10">
                  <div className="absolute top-4 right-4 text-green-500/30 group-hover:text-green-400/80">⚙️</div>
                  <div className="mb-8 p-5 rounded-full bg-black/40 border border-green-500/30 text-green-400 group-hover:text-white group-hover:bg-green-700 transition-all duration-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-cinzel font-bold mb-4 text-green-100 group-hover:text-green-300 tracking-wide">Configuration</h3>
                  <div className="w-16 h-px bg-green-500/30 mb-6 group-hover:w-32 group-hover:bg-gradient-to-r group-hover:from-transparent group-hover:via-green-400 group-hover:to-transparent transition-all duration-700"></div>
                  <p className="text-green-200/60 font-lora text-sm leading-7 mb-8 group-hover:text-green-100/90">
                    Manage database tables, toggle features, and configure app settings.
                  </p>
                  <div className="mt-auto opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                      <span className="text-green-400 text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2 group-hover:gap-3 transition-all">
                          Manage <span className="text-lg leading-none">›</span>
                      </span>
                  </div>
                </div>
              </Card>
             </Link>
          )}

        </div>
      </div>
    </div>
  );
};

export default Home;
