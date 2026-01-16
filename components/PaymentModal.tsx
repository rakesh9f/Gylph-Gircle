
import React, { useState, useEffect } from 'react';
import Button from './shared/Button';
import Loader from './shared/Loader';
import { useTranslation } from '../hooks/useTranslation';
import { useUser } from '../context/UserContext';
import { dbService } from '../services/db';
import { securityService } from '../services/security';
import { paymentManager, PaymentProvider } from '../services/paymentManager';

// Define Razorpay on Window
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  price: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isVisible, onClose, onSuccess, price }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeProvider, setActiveProvider] = useState<PaymentProvider | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('upi'); // Default to UPI for Indian users usually
  const { t } = useTranslation();
  const { user, commitPendingReading, pendingReading, refreshUser } = useUser();

  // Load SDKs on mount (simulated for now, would typically load specific script based on provider)
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Detect Region and Set Provider
  useEffect(() => {
      if (isVisible) {
          const region = paymentManager.detectUserCountry();
          const provider = paymentManager.getActiveProvider(region);
          setActiveProvider(provider);
          
          // Default method selection based on region
          if (region === 'IN') setPaymentMethod('upi');
          else setPaymentMethod('card');
      }
  }, [isVisible]);

  if (!isVisible) return null;

  const handlePaymentSuccess = async (paymentId: string) => {
    setIsLoading(true);
    
    if (user && activeProvider) {
      // 1. Record Encrypted Transaction
      dbService.recordTransaction({
        user_id: user.id,
        amount: activeProvider.provider_type === 'razorpay' ? 49.00 : 0.99, 
        description: pendingReading ? `${activeProvider.name}: ${pendingReading.title}` : `Credit Topup (${activeProvider.name})`,
        status: 'success'
      });

      // 2. Commit Reading
      if (pendingReading) {
        commitPendingReading();
      }

      // 3. Refresh State
      refreshUser();
    }

    setIsLoading(false);
    onSuccess();
    onClose();
  };

  const handleInitiatePayment = (specificMethod?: string) => {
    if (!securityService.checkSystemIntegrity()) {
        alert("Security Alert: Payment blocked due to insecure environment.");
        return;
    }

    if (!activeProvider) {
        alert("No active payment provider found for your region.");
        return;
    }

    setIsLoading(true);

    if (activeProvider.provider_type === 'razorpay') {
        initRazorpay(activeProvider, specificMethod);
    } else {
        // Mock success for other providers
        setTimeout(() => {
            handlePaymentSuccess(`${activeProvider.provider_type}_mock_id_123`);
        }, 1500);
    }
  };

  const initRazorpay = (provider: PaymentProvider, method?: string) => {
    const options: any = {
      key: provider.api_key,
      amount: 4900, // ₹49.00 in paise
      currency: provider.currency || "INR",
      name: "Glyph Circle",
      description: pendingReading?.title || "Mystical Services",
      image: "https://cdn-icons-png.flaticon.com/512/3063/3063822.png",
      handler: function (response: any) {
        handlePaymentSuccess(response.razorpay_payment_id);
      },
      prefill: {
        name: user?.name || "Mystical Seeker",
        email: user?.email || "seeker@glyph.circle",
        contact: "9999999999",
        method: method // Pre-select method if supported by checkout
      },
      theme: {
        color: "#F59E0B"
      },
      modal: {
        ondismiss: function() {
            setIsLoading(false);
        }
      }
    };

    try {
        const rzp1 = new window.Razorpay(options);
        rzp1.on('payment.failed', function (response: any){
            alert(response.error.description);
            setIsLoading(false);
        });
        rzp1.open();
    } catch (e) {
        console.error("Razorpay Error", e);
        setIsLoading(false);
        alert("Payment Gateway Failed to Load. Please check internet.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in-up">
      <div className="bg-gray-900 border border-amber-500/30 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden relative">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-amber-500 hover:text-white z-10">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 text-center">
            <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-amber-500/50">
                <span className="text-2xl">🕉️</span>
            </div>
            
            <h3 className="text-xl font-cinzel font-bold text-amber-100 mb-1">
                Dakshina (Offering)
            </h3>
            <p className="text-amber-200/60 text-xs mb-6">
                Complete your transaction to receive divine insight.
                <br/>
                <span className="text-white font-bold text-lg mt-1 block">
                    {activeProvider ? `${activeProvider.currency === 'INR' ? '₹' : '$'}${activeProvider.currency === 'INR' ? '49.00' : '0.99'}` : price}
                </span>
            </p>

            {/* PAYMENT TABS */}
            <div className="flex p-1 bg-black/40 rounded-lg mb-4">
                <button 
                    onClick={() => setPaymentMethod('upi')}
                    className={`flex-1 py-2 text-xs font-bold rounded transition-colors ${paymentMethod === 'upi' ? 'bg-amber-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                    UPI / Apps
                </button>
                <button 
                    onClick={() => setPaymentMethod('card')}
                    className={`flex-1 py-2 text-xs font-bold rounded transition-colors ${paymentMethod === 'card' ? 'bg-amber-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                    Cards
                </button>
            </div>

            {/* UPI SECTION */}
            {paymentMethod === 'upi' && (
                <div className="space-y-3 mb-4 animate-fade-in-up">
                    <div className="grid grid-cols-3 gap-2">
                        <button 
                            onClick={() => handleInitiatePayment('upi')}
                            className="flex flex-col items-center justify-center p-2 bg-gray-800 border border-gray-700 rounded hover:border-amber-500/50 hover:bg-gray-700 transition-all"
                        >
                            <img src="https://cdn-icons-png.flaticon.com/512/6124/6124998.png" alt="GPay" className="w-6 h-6 mb-1 filter invert opacity-90" />
                            <span className="text-[9px] text-gray-300">GPay</span>
                        </button>
                        <button 
                            onClick={() => handleInitiatePayment('upi')}
                            className="flex flex-col items-center justify-center p-2 bg-gray-800 border border-gray-700 rounded hover:border-amber-500/50 hover:bg-gray-700 transition-all"
                        >
                            <img src="https://cdn-icons-png.flaticon.com/512/825/825454.png" alt="BHIM" className="w-6 h-6 mb-1 filter invert opacity-90" />
                            <span className="text-[9px] text-gray-300">BHIM</span>
                        </button>
                        <button 
                            onClick={() => handleInitiatePayment('upi')}
                            className="flex flex-col items-center justify-center p-2 bg-gray-800 border border-gray-700 rounded hover:border-amber-500/50 hover:bg-gray-700 transition-all"
                        >
                            <img src="https://cdn-icons-png.flaticon.com/512/196/196566.png" alt="Paytm" className="w-6 h-6 mb-1 filter invert opacity-90" />
                            <span className="text-[9px] text-gray-300">Any UPI</span>
                        </button>
                    </div>
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Enter UPI ID (e.g. user@oksbi)" 
                            className="w-full bg-black/30 border border-gray-700 rounded p-2 text-xs text-white focus:border-amber-500 outline-none"
                        />
                        <button 
                            onClick={() => handleInitiatePayment('upi')}
                            className="absolute right-1 top-1 bg-amber-700 text-white text-[10px] px-2 py-1 rounded hover:bg-amber-600"
                        >
                            VERIFY
                        </button>
                    </div>
                </div>
            )}

            {/* CARD SECTION */}
            {paymentMethod === 'card' && (
                <div className="space-y-3 mb-4 animate-fade-in-up">
                    <Button onClick={() => handleInitiatePayment('card')} disabled={isLoading} className="w-full bg-blue-700 hover:bg-blue-600 border-none shadow-lg text-xs py-3">
                        {isLoading ? 'Processing...' : 'Pay via Credit/Debit Card'}
                    </Button>
                    <div className="flex justify-center gap-2 opacity-50">
                        <div className="w-8 h-5 bg-white rounded"></div>
                        <div className="w-8 h-5 bg-white rounded"></div>
                        <div className="w-8 h-5 bg-white rounded"></div>
                    </div>
                </div>
            )}

            <div className="mt-4 flex flex-col items-center justify-center gap-1 text-[9px] text-gray-500 uppercase tracking-widest border-t border-gray-800 pt-3">
                <div className="flex gap-2 items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span>SECURE TRANSACTION</span>
                </div>
                <span>Processed by {activeProvider?.name || 'Gateway'}</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
