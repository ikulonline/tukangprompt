
import React, { InputHTMLAttributes } from 'react';
import { RadioOption } from '../../types';

interface RadioGroupProps {
  label?: string;
  name: string;
  options: RadioOption[];
  selectedValue: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  containerClassName?: string;
  radioContainerClassName?: string;
  inline?: boolean;
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  name,
  options,
  selectedValue,
  onChange,
  error,
  containerClassName = 'mb-4',
  radioContainerClassName = 'flex items-center mr-4 mb-2',
  inline = true,
}) => {
  return (
    <div className={containerClassName}>
      {label && (
        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
          {label}
        </label>
      )}
      <div className={inline ? 'flex flex-wrap' : ''}>
        {options.map(option => (
          <div key={option.value} className={radioContainerClassName}>
            <input
              id={`${name}-${option.value}`}
              name={name}
              type="radio"
              value={option.value}
              checked={selectedValue === option.value}
              onChange={onChange}
              className="h-4 w-4 text-sky-600 border-slate-300 dark:border-slate-600 focus:ring-sky-500 dark:bg-slate-700 dark:checked:bg-sky-500"
            />
            <label htmlFor={`${name}-${option.value}`} className="ml-2 block text-sm text-slate-700 dark:text-slate-200">
              {option.label}
            </label>
          </div>
        ))}
      </div>
      {error && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{error}</p>}
    </div>
  );
};

export default RadioGroup;
