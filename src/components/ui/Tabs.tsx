// src/components/ui/Tabs.tsx
import React, { useState, ReactNode } from 'react';

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  initialTabId?: string;
}

const Tabs: React.FC<TabsProps> = ({ tabs, initialTabId }) => {
  const [activeTabId, setActiveTabId] = useState<string>(initialTabId || (tabs.length > 0 ? tabs[0].id : ''));

  if (tabs.length === 0) {
    return null;
  }

  const activeTab = tabs.find(tab => tab.id === activeTabId);

  return (
    <div>
      <div className="border-b border-slate-300 dark:border-slate-700 mb-4">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-150
                ${
                  activeTabId === tab.id
                    ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-500'
                }
                focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-t-md
              `}
              aria-current={activeTabId === tab.id ? 'page' : undefined}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div>
        {activeTab ? activeTab.content : <p>Pilih tab untuk melihat konten.</p>}
      </div>
    </div>
  );
};

export default Tabs;
