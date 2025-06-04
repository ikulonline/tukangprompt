
// src/pages/MyConfigsPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserPromptConfig } from '../types';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import FormSection from '../components/ui/FormSection';

const MyConfigsPage: React.FC = () => {
  const { session, user } = useAuth();
  const navigate = useNavigate();
  const [configs, setConfigs] = useState<UserPromptConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfigs = async () => {
    if (!session?.access_token) {
      setError("Tidak dapat mengambil konfigurasi. Sesi tidak valid.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/get-user-configs', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengambil konfigurasi.');
      }
      setConfigs(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, [session]);

  const handleLoadConfig = (config: UserPromptConfig) => {
    navigate('/dashboard', { 
      state: { 
        loadedConfig: {
          type: config.prompt_type,
          parameters: config.parameters,
        }
      } 
    });
  };

  const handleDeleteConfig = async (configId: number) => {
    if (!session?.access_token) {
      alert("Tidak dapat menghapus. Sesi tidak valid.");
      return;
    }
    if (!window.confirm("Apakah Anda yakin ingin menghapus konfigurasi ini?")) {
      return;
    }
    try {
      const response = await fetch('/api/delete-prompt-config', {
        method: 'POST', // Netlify Functions default to POST for body, some might restrict DELETE
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config_id: configId }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal menghapus konfigurasi.');
      }
      // Refresh list
      setConfigs(prevConfigs => prevConfigs.filter(c => c.id !== configId));
      alert('Konfigurasi berhasil dihapus.');
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    }
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
      <FormSection title="Konfigurasi Prompt Saya">
        {error && <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>}
        {configs.length === 0 && !error && (
          <p className="text-slate-500 dark:text-slate-400">Anda belum menyimpan konfigurasi apa pun.</p>
        )}
        {configs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {configs.map(config => (
              <div key={config.id} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-md shadow ring-1 ring-slate-200 dark:ring-slate-700">
                <h4 className="font-semibold text-lg text-sky-700 dark:text-sky-300 truncate" title={config.config_name}>
                  {config.config_name}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                  Tipe: {config.prompt_type}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                  Dibuat: {new Date(config.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500">
                  Diperbarui: {new Date(config.updated_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
                <div className="mt-4 flex space-x-2">
                  <Button variant="primary" size="sm" onClick={() => handleLoadConfig(config)}>
                    Muat
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDeleteConfig(config.id)}>
                    Hapus
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </FormSection>
    </div>
  );
};

export default MyConfigsPage;
