import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import PaymentModal from '../components/PaymentModal';

interface PaymentContextType {
  openPayment: (onSuccess: () => void, price?: string) => void;
  closePayment: () => void;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};

export const PaymentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [onSuccessCallback, setOnSuccessCallback] = useState<(() => void) | null>(null);
  const [price, setPrice] = useState('$9.99');

  const openPayment = useCallback((cb: () => void, cost: string = '$9.99') => {
    // We wrap cb in an arrow function if it's not one, but here we just store the reference.
    // However, useState accepts functional updates, so we must be careful.
    // To safely store a function in useState, use: () => cb
    setOnSuccessCallback(() => cb); 
    setPrice(cost);
    setIsOpen(true);
  }, []);

  const closePayment = useCallback(() => {
    setIsOpen(false);
    setOnSuccessCallback(null);
  }, []);

  const handlePaymentSuccess = useCallback(() => {
    if (onSuccessCallback) {
      onSuccessCallback();
    }
    closePayment();
  }, [onSuccessCallback, closePayment]);

  return (
    <PaymentContext.Provider value={{ openPayment, closePayment }}>
      {children}
      <PaymentModal 
        isVisible={isOpen} 
        onClose={closePayment} 
        onSuccess={handlePaymentSuccess}
        price={price}
      />
    </PaymentContext.Provider>
  );
};
