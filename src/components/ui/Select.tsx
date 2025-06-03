
import React, { SelectHTMLAttributes, forwardRef } from 'react';
import { SelectOption } from '../../types'; // Import SelectOption

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  containerClassName?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, name, options, error, className = '', containerClassName = '', ...props }, ref) => {
    return (
      <div className={`mb-4 ${containerClassName}`}>
        {label && (
          <label htmlFor={name} className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
            {label}
          </label>
        )}
        <select
          id={name}
          name={name}
          ref={ref}
          className={`w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className}`}
          {...props}
        >
          {options.map(option => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
