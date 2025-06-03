// src/components/ui/Textarea.tsx
import React, { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
  // readOnly prop is implicitly supported by TextareaHTMLAttributes
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, name, error, className = '', containerClassName = '', rows = 3, ...props }, ref) => {
    return (
      <div className={`mb-4 ${containerClassName}`}>
        {label && (
          <label htmlFor={name} className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
            {label}
          </label>
        )}
        <textarea
          id={name}
          name={name}
          ref={ref}
          rows={rows}
          className={`w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm 
            ${error ? 'border-red-500 focus:ring-red-500' : ''} 
            ${props.readOnly ? 'bg-slate-50 dark:bg-slate-700 cursor-default' : ''} 
            ${className}`}
          {...props} // props including readOnly will be spread here
        />
        {error && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
