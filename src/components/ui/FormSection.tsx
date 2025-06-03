

import React, { ReactNode } from 'react';

interface FormSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
  initiallyOpen?: boolean;
  isCollapsible?: boolean;
}

const FormSection: React.FC<FormSectionProps> = ({ title, children, className = '', initiallyOpen = true, isCollapsible = false }) => {
  const [isOpen, setIsOpen] = React.useState(initiallyOpen);

  const toggleOpen = () => {
    if (isCollapsible) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={`bg-white dark:bg-slate-800 shadow-lg ring-1 ring-slate-200 dark:ring-slate-700 rounded-lg p-6 mb-8 ${className}`}>
      <h3 
        className={`text-xl font-semibold text-sky-600 dark:text-sky-400 mb-5 ${isCollapsible ? 'cursor-pointer flex justify-between items-center' : ''}`}
        onClick={toggleOpen}
        role={isCollapsible ? "button" : undefined}
        aria-expanded={isCollapsible ? isOpen : undefined}
        tabIndex={isCollapsible ? 0 : undefined}
        onKeyDown={isCollapsible ? (e) => (e.key === 'Enter' || e.key === ' ') && toggleOpen() : undefined}
      >
        {title}
        {isCollapsible && (
          <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-0' : '-rotate-90'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </span>
        )}
      </h3>
      {isOpen && children}
    </div>
  );
};

export default FormSection;