import React, { useState, useEffect } from 'react';
import Button from './shared/Button';
import Loader from './shared/Loader';
import { useTranslation } from '../hooks/useTranslation';
import { useDb } from '../hooks/useDb';
import { useUser } from '../context/UserContext';
import { dbService } from '../services/db';

interface PaymentModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  price: string;
}

type PaymentMethod = 'card' | 'upi' | 'paypal';

const PaymentModal: React.FC<PaymentModalProps> = ({ isVisible, onClose, onSuccess, price }) => {
  const [method, setMethod] = useState<PaymentMethod>('upi');
  const [isLoading, setIsLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [upiStatus, setUpiStatus] = useState<'waiting' | 'scanning' | 'success'>('waiting');
  
  const { t } = useTranslation();
  const { db } = useDb(); // Admin DB for merchant info
  const { user, commitPendingReading, pendingReading, refreshUser } = useUser(); // User Context for persistence

  const merchant = db.merchant_info?.[0] || { 
    paypal: 'payments@mysticalglyph.com', 
    upi: 'mysticalglyph@paytm',
    card: 'Glyph Circle Pvt Ltd' 
  };

  useEffect(() => {
    if (isVisible) {
      setMethod('upi');
      setUpiStatus('waiting');
      setIsLoading(false);
      setCardDetails({ number: '', expiry: '', cvv: '', name: '' });
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const handlePaymentCompletion = () => {
    if (user) {
      // 1. Record Transaction
      dbService.recordTransaction({
        user_id: user.id,
        amount: parseFloat(price.replace(/[^0-9.]/g, '')) || 9.99,
        description: pendingReading ? `Unlock: ${pendingReading.title}` : 'Credit Purchase',
        status: 'success'
      });

      // 2. Commit any pending reading to permanent DB
      if (pendingReading) {
        commitPendingReading();
      }

      // 3. Refresh user state
      refreshUser();
    }
    
    // 4. Trigger UI Success
    onSuccess();
  };

  const handleSuccess = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      handlePaymentCompletion();
    }, 2000);
  };

  const handleCardPayment = (e: React.FormEvent) => {
    e.preventDefault();
    handleSuccess();
  };

  const handleUpiPayment = () => {
    setUpiStatus('scanning');
    setTimeout(() => {
      setUpiStatus('success');
      setTimeout(handleSuccess, 1000);
    }, 2000);
  };

  const fillTestCard = () => {
    setCardDetails({
        number: '4111 1111 1111 1111',
        expiry: '12/25',
        cvv: '123',
        name: 'Demo User'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in-up">
      <div className="bg-gray-900 border border-amber-500/30 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 border-b border-amber-500/20 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-cinzel font-bold text-amber-400">{t('unlockReport')}</h3>
            <p className="text-amber-200/60 text-sm">
                {pendingReading ? `Unlock: ${pendingReading.title}` : 'Secure Payment Gateway'}
            </p>
          </div>
          <button onClick={onClose} className="text-amber-200/50 hover:text-amber-200 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <Loader />
                    <p className="mt-4 text-amber-200 animate-pulse">Processing secure payment...</p>
                </div>
            ) : (
                <>
                    <div className="text-center mb-8">
                        <p className="text-amber-100 text-sm mb-1">Total Amount</p>
                        <h2 className="text-4xl font-bold text-white">{price}</h2>
                    </div>

                    {/* Method Tabs */}
                    <div className="grid grid-cols-3 gap-2 mb-6 p-1 bg-black/40 rounded-lg">
                        <button 
                            onClick={() => setMethod('upi')}
                            className={`py-2 rounded-md text-sm font-bold transition-all ${method === 'upi' ? 'bg-amber-600 text-white shadow-lg' : 'text-amber-200/60 hover:text-amber-200'}`}
                        >
                            UPI / GPay
                        </button>
                        <button 
                            onClick={() => setMethod('card')}
                            className={`py-2 rounded-md text-sm font-bold transition-all ${method === 'card' ? 'bg-amber-600 text-white shadow-lg' : 'text-amber-200/60 hover:text-amber-200'}`}
                        >
                            Card
                        </button>
                        <button 
                            onClick={() => setMethod('paypal')}
                            className={`py-2 rounded-md text-sm font-bold transition-all ${method === 'paypal' ? 'bg-amber-600 text-white shadow-lg' : 'text-amber-200/60 hover:text-amber-200'}`}
                        >
                            PayPal
                        </button>
                    </div>

                    {/* UPI Content */}
                    {method === 'upi' && (
                        <div className="flex flex-col items-center animate-fade-in-up">
                            <div className="w-full text-center bg-black/40 p-3 rounded-lg border border-amber-500/10 mb-4">
                                <p className="text-amber-200/60 text-xs uppercase tracking-widest mb-1">Paying To:</p>
                                <p className="text-amber-100 font-mono font-bold text-sm">{merchant.upi}</p>
                            </div>

                            <div className="bg-white p-4 rounded-xl mb-4 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                                <svg className="w-48 h-48 text-black" viewBox="0 0 100 100" fill="currentColor">
                                     <path d="M10,10 h30 v30 h-30 z M50,10 h10 v10 h-10 z M70,10 h20 v20 h-20 z M10,50 h10 v10 h-10 z M10,70 h30 v20 h-30 z M50,50 h40 v40 h-40 z" fill="#000" opacity="0.8" />
                                     <rect x="15" y="15" width="20" height="20" fill="black" />
                                     <rect x="15" y="75" width="20" height="10" fill="black" />
                                     <rect x="55" y="55" width="30" height="30" fill="black" />
                                     <text x="50" y="50" fontSize="5" textAnchor="middle">DEMO QR</text>
                                </svg>
                            </div>
                            <p className="text-amber-200/80 text-sm mb-6 text-center">Scan with any UPI App<br/>(Google Pay, PhonePe, Paytm)</p>
                            <Button onClick={handleUpiPayment} className="w-full">
                                {upiStatus === 'waiting' ? 'Simulate Scan & Pay' : upiStatus === 'scanning' ? 'Processing...' : 'Paid!'}
                            </Button>
                        </div>
                    )}

                    {/* Card Content */}
                    {method === 'card' && (
                        <form onSubmit={handleCardPayment} className="space-y-4 animate-fade-in-up">
                            <div className="bg-amber-900/20 p-2 rounded text-center mb-2">
                                <p className="text-xs text-amber-200">Payment to: <span className="font-bold text-amber-100">{merchant.card}</span></p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-amber-500 uppercase mb-1">Name on Card</label>
                                <input 
                                    type="text" 
                                    required
                                    value={cardDetails.name}
                                    onChange={e => setCardDetails({...cardDetails, name: e.target.value})}
                                    className="w-full bg-black/40 border border-amber-500/30 rounded-lg p-3 text-white focus:ring-1 focus:ring-amber-500 outline-none"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-amber-500 uppercase mb-1">Card Number</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        required
                                        value={cardDetails.number}
                                        onChange={e => setCardDetails({...cardDetails, number: e.target.value})}
                                        className="w-full bg-black/40 border border-amber-500/30 rounded-lg p-3 text-white focus:ring-1 focus:ring-amber-500 outline-none font-mono"
                                        placeholder="0000 0000 0000 0000"
                                    />
                                    <button 
                                        type="button"
                                        onClick={fillTestCard}
                                        className="absolute right-2 top-2 text-xs bg-amber-900/50 px-2 py-1 rounded text-amber-200 hover:bg-amber-800"
                                    >
                                        Test
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-amber-500 uppercase mb-1">Expiry</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={cardDetails.expiry}
                                        onChange={e => setCardDetails({...cardDetails, expiry: e.target.value})}
                                        className="w-full bg-black/40 border border-amber-500/30 rounded-lg p-3 text-white focus:ring-1 focus:ring-amber-500 outline-none text-center"
                                        placeholder="MM/YY"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-amber-500 uppercase mb-1">CVV</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={cardDetails.cvv}
                                        onChange={e => setCardDetails({...cardDetails, cvv: e.target.value})}
                                        className="w-full bg-black/40 border border-amber-500/30 rounded-lg p-3 text-white focus:ring-1 focus:ring-amber-500 outline-none text-center"
                                        placeholder="123"
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full mt-4">Pay {price}</Button>
                        </form>
                    )}

                    {/* PayPal Content */}
                    {method === 'paypal' && (
                        <div className="flex flex-col items-center justify-center py-6 animate-fade-in-up">
                            <div className="w-full text-center bg-black/30 p-4 rounded-lg border border-amber-500/10 mb-6">
                                <p className="text-amber-200/60 text-xs uppercase tracking-widest mb-1">Paying To:</p>
                                <p className="text-amber-100 font-mono font-bold text-sm">{merchant.paypal}</p>
                            </div>
                            
                            <button 
                                onClick={handleSuccess}
                                className="w-full bg-[#0070ba] hover:bg-[#005ea6] text-white font-bold py-4 rounded-full flex items-center justify-center gap-2 transition-transform hover:scale-105 shadow-lg"
                            >
                                <span className="italic font-serif font-black text-xl">Pay</span>
                                <span className="italic font-serif font-black text-xl">Pal</span>
                            </button>
                            <p className="text-amber-200/40 text-xs mt-4">Secure PayPal Checkout</p>
                        </div>
                    )}
                </>
            )}
        </div>
        
        {/* Footer */}
        <div className="bg-black/40 p-4 border-t border-amber-500/10 flex justify-center items-center gap-2 text-xs text-amber-500/50">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>256-bit SSL Encrypted Connection</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
