
import React, { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, name, error, className = '', containerClassName = '', ...props }, ref) => {
    return (
      <div className={`mb-4 ${containerClassName}`}>
        {label && (
          <label htmlFor={name} className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
            {label}
          </label>
        )}
        <input
          id={name}
          name={name}
          ref={ref} // Forward the ref here
          className={`w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input'; // Optional: for better debugging

export default Input;