
import React, { useState, useEffect } from 'react';
import Button from './shared/Button';
import Loader from './shared/Loader';
import { useTranslation } from '../hooks/useTranslation';
import { useUser } from '../context/UserContext';
import { dbService } from '../services/db';
import { securityService } from '../services/security';
import { paymentManager, PaymentProvider } from '../services/paymentManager';
import { useDb } from '../hooks/useDb';

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
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('upi');
  const { t } = useTranslation();
  const { user, commitPendingReading, pendingReading, refreshUser } = useUser();
  const { db } = useDb(); // Get updated providers list from context

  // Load SDKs on mount
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
          // Pass the list from DB context to the helper
          const providersList = db.payment_providers || [];
          const provider = paymentManager.getActiveProviderFromList(providersList, region);
          setActiveProvider(provider);
          
          if (region === 'IN') setPaymentMethod('upi');
          else setPaymentMethod('card');
      }
  }, [isVisible, db.payment_providers]);

  if (!isVisible) return null;

  const handlePaymentSuccess = async (paymentId: string) => {
    setIsLoading(true);
    
    if (user && activeProvider) {
      await dbService.recordTransaction({
        user_id: user.id,
        amount: activeProvider.provider_type === 'razorpay' ? 49.00 : 0.99, 
        description: pendingReading ? `${activeProvider.name}: ${pendingReading.title}` : `Credit Topup (${activeProvider.name})`,
        status: 'success'
      });

      if (pendingReading) {
        commitPendingReading();
      }

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
        // Fallback for demo if no provider configured
        console.warn("No provider configured. Falling back to mock success for demo.");
        setIsLoading(true);
        setTimeout(() => handlePaymentSuccess("mock_fallback_id"), 1000);
        return;
    }

    setIsLoading(true);

    if (activeProvider.provider_type === 'razorpay') {
        initRazorpay(activeProvider, specificMethod);
    } else {
        setTimeout(() => {
            handlePaymentSuccess(`${activeProvider.provider_type}_mock_id_123`);
        }, 1500);
    }
  };

  const initRazorpay = (provider: PaymentProvider, method?: string) => {
    const options: any = {
      key: provider.api_key,
      amount: 4900,
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
        method: method
      },
      theme: { color: "#F59E0B" },
      modal: {
        ondismiss: function() { setIsLoading(false); }
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
        alert("Payment Gateway Failed to Load.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in-up">
      <div className="bg-gray-900 border border-amber-500/30 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-amber-500 hover:text-white z-10">✕</button>

        <div className="p-6 text-center">
            <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-amber-500/50">
                <span className="text-2xl">🕉️</span>
            </div>
            
            <h3 className="text-xl font-cinzel font-bold text-amber-100 mb-1">Dakshina (Offering)</h3>
            <p className="text-amber-200/60 text-xs mb-6">
                Complete your transaction to receive divine insight.
                <br/>
                <span className="text-white font-bold text-lg mt-1 block">
                    {activeProvider ? `${activeProvider.currency === 'INR' ? '₹' : '$'}${activeProvider.currency === 'INR' ? '49.00' : '0.99'}` : price}
                </span>
            </p>

            <div className="flex p-1 bg-black/40 rounded-lg mb-4">
                <button onClick={() => setPaymentMethod('upi')} className={`flex-1 py-2 text-xs font-bold rounded transition-colors ${paymentMethod === 'upi' ? 'bg-amber-600 text-white' : 'text-gray-400 hover:text-white'}`}>UPI / Apps</button>
                <button onClick={() => setPaymentMethod('card')} className={`flex-1 py-2 text-xs font-bold rounded transition-colors ${paymentMethod === 'card' ? 'bg-amber-600 text-white' : 'text-gray-400 hover:text-white'}`}>Cards</button>
            </div>

            {paymentMethod === 'upi' && (
                <div className="space-y-3 mb-4 animate-fade-in-up">
                    <button onClick={() => handleInitiatePayment('upi')} className="w-full py-3 bg-gray-800 border border-gray-700 hover:border-amber-500 rounded text-sm text-gray-300 hover:text-white">Pay via Any UPI App</button>
                </div>
            )}

            {paymentMethod === 'card' && (
                <div className="space-y-3 mb-4 animate-fade-in-up">
                    <Button onClick={() => handleInitiatePayment('card')} disabled={isLoading} className="w-full bg-blue-700 hover:bg-blue-600 border-none shadow-lg text-xs py-3">
                        {isLoading ? 'Processing...' : 'Pay via Credit/Debit Card'}
                    </Button>
                </div>
            )}

            <div className="mt-4 flex flex-col items-center justify-center gap-1 text-[9px] text-gray-500 uppercase tracking-widest border-t border-gray-800 pt-3">
                <div className="flex gap-2 items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span>SECURE TRANSACTION</span>
                </div>
                <span>Processed by {activeProvider?.name || 'Secure Gateway'}</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
