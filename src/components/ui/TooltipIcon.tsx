
import React, { useState } from 'react';

interface TooltipIconProps {
  text: string;
  className?: string;
  iconClassName?: string;
}

const TooltipIcon: React.FC<TooltipIconProps> = ({ text, className = '', iconClassName = '' }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className={`relative inline-flex items-center ml-2 ${className}`}>
      <button
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        className={`p-1 rounded-full text-xs font-semibold text-sky-600 dark:text-sky-400 border border-sky-500 dark:border-sky-400 hover:bg-sky-100 dark:hover:bg-sky-700 focus:outline-none focus:ring-1 focus:ring-sky-500 ${iconClassName}`}
        aria-label="Informasi tambahan"
      >
        ?
      </button>
      {isVisible && (
        <div
          role="tooltip"
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-xs text-white bg-slate-700 dark:bg-slate-600 rounded-md shadow-lg z-10"
        >
          {text}
        </div>
      )}
    </div>
  );
};

export default TooltipIcon;
