import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'outline' | 'ghost';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ onClick, children, variant = "primary", className = "", disabled = false, ...props }) => {
  const baseStyle = "flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 focus:ring-2 focus:ring-red-500",
    outline: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-2 focus:ring-slate-400",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100"
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;