// src/pages/MyHistoryPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { PromptHistoryEntry, ImagePromptFormState, VideoPromptFormState, GeneratedPrompts, GeneratedVideoPrompts } from '../types';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import FormSection from '../components/ui/FormSection';
import Textarea from '../components/ui/Textarea';

const MyHistoryPage: React.FC = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState<PromptHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedDetailsId, setExpandedDetailsId] = useState<number | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!session?.access_token) {
      setError("Sesi tidak valid. Silakan login kembali.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/get-prompt-history', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengambil riwayat prompt.');
      }
      setHistory(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleReuseParameters = (item: PromptHistoryEntry) => {
    navigate('/dashboard', {
      state: {
        loadedConfig: { // Reusing the same state structure as MyConfigsPage for simplicity
          type: item.prompt_type,
          parameters: item.input_parameters,
        }
      }
    });
  };

  const toggleDetails = (id: number) => {
    setExpandedDetailsId(expandedDetailsId === id ? null : id);
  };
  
  const getSnippet = (item: PromptHistoryEntry): string => {
    const params = item.input_parameters;
    let snippet = "";
    if (item.prompt_type === 'image') {
      const imgParams = params as ImagePromptFormState;
      snippet = imgParams.subjectDescription || "Deskripsi subjek tidak ada";
    } else if (item.prompt_type === 'video') {
      const videoParams = params as VideoPromptFormState;
      snippet = videoParams.sceneDescription || "Deskripsi adegan tidak ada";
    }
    return snippet.length > 100 ? snippet.substring(0, 97) + "..." : snippet;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full py-10">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <FormSection title="Riwayat Prompt Saya">
        {error && <p className="text-red-500 dark:text-red-400 mb-4 p-4 bg-red-50 dark:bg-red-900/30 rounded-md">{error}</p>}
        
        <div className="mb-6">
          <Button onClick={fetchHistory} variant="outline" size="sm" isLoading={isLoading} disabled={isLoading}>
            {isLoading ? 'Memuat Ulang...' : 'Muat Ulang Riwayat'}
          </Button>
        </div>

        {history.length === 0 && !error && (
          <p className="text-slate-500 dark:text-slate-400">Anda belum memiliki riwayat prompt. Hasilkan prompt baru di Dashboard untuk melihatnya di sini!</p>
        )}
        {history.length > 0 && (
          <div className="space-y-6">
            {history.map(item => (
              <div key={item.id} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-md shadow ring-1 ring-slate-200 dark:ring-slate-700">
                <div className="flex flex-col sm:flex-row justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-lg text-sky-700 dark:text-sky-300 capitalize">
                      {item.prompt_type === 'image' ? 'Prompt Gambar' : 'Prompt Video'}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 italic" title={item.prompt_type === 'image' ? (item.input_parameters as ImagePromptFormState).subjectDescription : (item.input_parameters as VideoPromptFormState).sceneDescription}>
                      "{getSnippet(item)}"
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                      Dibuat: {new Date(item.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="mt-3 sm:mt-0 flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 flex-shrink-0">
                    <Button variant="secondary" size="sm" onClick={() => toggleDetails(item.id)} className="w-full sm:w-auto">
                      {expandedDetailsId === item.id ? 'Sembunyikan Detail' : 'Lihat Detail Output'}
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => handleReuseParameters(item)} className="w-full sm:w-auto">
                      Gunakan Lagi
                    </Button>
                  </div>
                </div>
                {expandedDetailsId === item.id && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <h5 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Detail Output yang Dihasilkan:</h5>
                    <Textarea 
                        value={JSON.stringify(item.generated_prompts, null, 2)} 
                        readOnly 
                        rows={8}
                        className="text-xs bg-slate-100 dark:bg-slate-900 font-mono"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </FormSection>
    </div>
  );
};

export default MyHistoryPage;