
import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`bg-black bg-opacity-40 backdrop-blur-md rounded-xl shadow-lg border border-amber-500/20 overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
