
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

  const handleInitiatePayment = () => {
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
        initRazorpay(activeProvider);
    } else if (activeProvider.provider_type === 'stripe') {
        // Simulate Stripe
        setTimeout(() => {
            handlePaymentSuccess('stripe_mock_id_123');
        }, 1500);
    } else {
        // Simulate PayPal / Generic
        setTimeout(() => {
            handlePaymentSuccess('paypal_mock_id_123');
        }, 1500);
    }
  };

  const initRazorpay = (provider: PaymentProvider) => {
    const options = {
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
        contact: "9999999999"
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

        <div className="p-8 text-center">
            <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            </div>
            
            <h3 className="text-2xl font-cinzel font-bold text-amber-100 mb-2">
                Secure Gateway
            </h3>
            <p className="text-amber-200/60 text-sm mb-6">
                Pay <span className="text-white font-bold">{activeProvider ? `${activeProvider.currency === 'INR' ? '₹' : '$'}${activeProvider.currency === 'INR' ? '49.00' : '0.99'}` : price}</span> to unlock deep insights.
            </p>

            <div className="space-y-3">
                <Button onClick={handleInitiatePayment} disabled={isLoading} className="w-full bg-gradient-to-r from-blue-600 to-blue-800 border-none shadow-lg">
                    {isLoading ? 'Connecting...' : `Pay via ${activeProvider?.name || 'Card'}`}
                </Button>
            </div>

            <div className="mt-6 flex flex-col items-center justify-center gap-1 text-[10px] text-amber-500/40 uppercase tracking-widest">
                <div className="flex gap-2">
                    <span>{activeProvider?.provider_type || 'Secure'}</span>
                    <span>•</span>
                    <span>256-bit SSL</span>
                </div>
                {activeProvider && (
                    <span className="text-[9px] text-gray-600">Routing via {activeProvider.country_codes}</span>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
