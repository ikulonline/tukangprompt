import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  ...props
}) => {
  const baseStyles = "font-semibold rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center";

  const variantStyles = {
    primary: "bg-sky-500 hover:bg-sky-600 text-white focus-visible:ring-sky-500 dark:focus-visible:ring-sky-400",
    secondary: "bg-slate-600 hover:bg-slate-700 text-slate-100 focus-visible:ring-slate-500 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-100 dark:focus-visible:ring-slate-500",
    danger: "bg-red-600 hover:bg-red-700 text-white focus-visible:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600 dark:focus-visible:ring-red-400",
    ghost: "hover:bg-slate-200 text-slate-700 focus-visible:ring-slate-500 dark:hover:bg-slate-700 dark:text-slate-200 dark:focus-visible:ring-slate-500",
    outline: "border border-slate-300 hover:bg-slate-100 text-slate-700 focus-visible:ring-slate-500 dark:border-slate-600 dark:hover:bg-slate-700 dark:text-slate-200 dark:focus-visible:ring-slate-500",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const spinnerColorClass = (variant === 'primary' || variant === 'danger' || variant === 'secondary') ? 'text-white' : 'text-sky-500 dark:text-sky-400';

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <svg className={`animate-spin -ml-1 mr-3 h-5 w-5 ${spinnerColorClass}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;