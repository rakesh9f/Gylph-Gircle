
import React, { useState, useEffect } from 'react';
import Button from './shared/Button';
import Loader from './shared/Loader';
import { useTranslation } from '../hooks/useTranslation';
import { useUser } from '../context/UserContext';
import { dbService } from '../services/db';
import { checkSystemIntegrity } from '../services/security';

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

const RAZORPAY_TEST_KEY = "rzp_test_1DP5mmOlF5G5ag"; // Public Test Key

const PaymentModal: React.FC<PaymentModalProps> = ({ isVisible, onClose, onSuccess, price }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();
  const { user, commitPendingReading, pendingReading, refreshUser } = useUser();

  // Load Razorpay SDK
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  if (!isVisible) return null;

  const handlePaymentSuccess = async (paymentId: string) => {
    setIsLoading(true);
    
    if (user) {
      // 1. Record Encrypted Transaction (simulated by dbService logic, could utilize secureStorage internally)
      dbService.recordTransaction({
        user_id: user.id,
        amount: 49.00, // Fixed INR Price
        description: pendingReading ? `Razorpay: ${pendingReading.title}` : 'Razorpay Credit',
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

  const initRazorpay = () => {
    if (!checkSystemIntegrity()) {
        alert("Security Alert: Payment blocked due to insecure environment.");
        return;
    }

    setIsLoading(true);

    const options = {
      key: RAZORPAY_TEST_KEY,
      amount: 4900, // ₹49.00 in paise
      currency: "INR",
      name: "Glyph Circle",
      description: pendingReading?.title || "Mystical Services",
      image: "https://cdn-icons-png.flaticon.com/512/3063/3063822.png",
      handler: function (response: any) {
        // In prod, verify signature on backend: response.razorpay_signature
        handlePaymentSuccess(response.razorpay_payment_id);
      },
      prefill: {
        name: "Mystical Seeker",
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
                Pay <span className="text-white font-bold">₹49.00</span> to unlock deep insights.
            </p>

            <div className="space-y-3">
                <Button onClick={initRazorpay} disabled={isLoading} className="w-full bg-gradient-to-r from-blue-600 to-blue-800 border-none shadow-lg">
                    {isLoading ? 'Connecting...' : 'Pay via UPI / Card'}
                </Button>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-amber-500/40 uppercase tracking-widest">
                <span>Razorpay Secured</span>
                <span>•</span>
                <span>256-bit Encrypted</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
