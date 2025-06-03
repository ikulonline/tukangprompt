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
      <Button onClick={handleCopy} variant="secondary" size="sm" className="w-full sm:w-auto">
        {copyStatus === 'copied' ? 'Tersalin!' : 'Salin Prompt'}
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
