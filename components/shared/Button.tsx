
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, className = '', ...props }) => {
  return (
    <button
      className={`bg-maroon-700 hover:bg-maroon-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-amber-50 font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg border border-amber-600 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
