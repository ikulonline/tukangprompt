// src/components/ImagePromptOutput.tsx
import React, { useState } from 'react';
import Textarea from './ui/Textarea';
import Button from './ui/Button';
import Tabs from './ui/Tabs';
import LoadingSpinner from './ui/LoadingSpinner';

interface GeneratedPrompts {
  dall_e_prompt: string;
  midjourney_prompt: string;
}

interface ImagePromptOutputProps {
  prompts: GeneratedPrompts | null;
  isLoading: boolean;
  error: string | null;
}

// BARU: Icon components
const ClipboardIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-4 h-4 mr-2"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
  </svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-4 h-4 mr-2 text-green-500"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  </svg>
);


const PromptDisplay: React.FC<{ promptText: string; modelName: string }> = ({ promptText, modelName }) => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  const handleCopy = async () => {
    if (!promptText) return;
    try {
      await navigator.clipboard.writeText(promptText);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (err) {
      console.error('Gagal menyalin prompt:', err);
      alert(`Gagal menyalin. Anda bisa menyalin secara manual.`);
    }
  };

  return (
    <div className="space-y-3">
      <Textarea
        label={`Prompt untuk ${modelName}`}
        value={promptText}
        readOnly
        rows={5}
        className="bg-slate-50 dark:bg-slate-700 text-sm"
        containerClassName="mb-0"
      />
      <Button onClick={handleCopy} variant="secondary" size="sm" className="w-full sm:w-auto inline-flex items-center">
        {copyStatus === 'copied' ? (
          <>
            <CheckIcon /> Tersalin!
          </>
        ) : (
          <>
            <ClipboardIcon /> Salin Prompt
          </>
        )}
      </Button>
    </div>
  );
};

const ImagePromptOutput: React.FC<ImagePromptOutputProps> = ({ prompts, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="mt-8 p-6 bg-white dark:bg-slate-800 shadow-lg ring-1 ring-slate-200 dark:ring-slate-700 rounded-lg flex flex-col items-center justify-center min-h-[200px]">
        <LoadingSpinner size="md" />
        <p className="mt-3 text-slate-600 dark:text-slate-300">Menghasilkan prompt...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 p-6 bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300">
        <h4 className="font-semibold text-lg mb-2">Terjadi Kesalahan</h4>
        <p>{error}</p>
      </div>
    );
  }

  if (!prompts) {
    return null; // Jangan tampilkan apa-apa jika tidak ada prompt dan tidak loading/error
  }

  const tabsData = [
    {
      id: 'dalle',
      label: 'Umum / DALL-E',
      content: <PromptDisplay promptText={prompts.dall_e_prompt} modelName="DALL-E / Umum" />,
    },
    {
      id: 'midjourney',
      label: 'Midjourney',
      content: <PromptDisplay promptText={prompts.midjourney_prompt} modelName="Midjourney" />,
    },
  ];

  return (
    <div className="mt-8 p-6 bg-white dark:bg-slate-800 shadow-xl ring-1 ring-slate-200 dark:ring-slate-700 rounded-lg">
      <h3 className="text-xl font-semibold text-sky-600 dark:text-sky-400 mb-5">
        Hasil Prompt Gambar Anda:
      </h3>
      <Tabs tabs={tabsData} />
    </div>
  );
};

export default ImagePromptOutput;