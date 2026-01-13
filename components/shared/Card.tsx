
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-black bg-opacity-40 backdrop-blur-md rounded-xl shadow-lg border border-amber-500/20 overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

export default Card;
