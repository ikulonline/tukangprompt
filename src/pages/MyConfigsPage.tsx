// src/pages/MyConfigsPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserPromptConfig } from '../types';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import FormSection from '../components/ui/FormSection';

const MyConfigsPage: React.FC = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [configs, setConfigs] = useState<UserPromptConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfigs = useCallback(async () => {
    if (!session?.access_token) {
      setError("Sesi tidak valid. Silakan login kembali.");
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

      if (!response.ok) {
        let errorJson;
        let errorMsg = `Gagal mengambil konfigurasi (HTTP ${response.status}).`;
        try {
          const text = await response.text(); // Get raw text first
          try {
            errorJson = JSON.parse(text);
            if (errorJson && errorJson.error) {
              errorMsg = errorJson.error; // Use specific error from JSON
            } else {
                // Use text if not JSON or JSON has no error field
                errorMsg = `Gagal mengambil konfigurasi (HTTP ${response.status}): ${text.substring(0, 200) || response.statusText || 'Tidak ada detail tambahan.'}`;
            }
          } catch (e) {
            // Failed to parse JSON, use raw text
             errorMsg = `Gagal mengambil konfigurasi (HTTP ${response.status}): ${text.substring(0, 200) || response.statusText || 'Respons bukan JSON.'}`;
          }
        } catch (textError) {
          // Failed to even get text, very unusual
          errorMsg = `Gagal mengambil konfigurasi (HTTP ${response.status}) dan gagal membaca detail error.`;
        }
        throw new Error(errorMsg);
      }

      const data = await response.json(); // If response.ok, this should be valid JSON
      setConfigs(data);

    } catch (e: any) {
      setError(e.message); // This will now set a more descriptive error
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

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
      alert("Sesi tidak valid untuk menghapus.");
      return;
    }
    if (!window.confirm("Apakah Anda yakin ingin menghapus konfigurasi ini? Tindakan ini tidak dapat dibatalkan.")) {
      return;
    }
    try {
      const response = await fetch('/api/delete-prompt-config', {
        method: 'POST', // Using POST to send body, as some environments restrict DELETE with body
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
      setConfigs(prevConfigs => prevConfigs.filter(c => c.id !== configId));
      alert('Konfigurasi berhasil dihapus.');
    } catch (e: any) {
      alert(`Error: ${e.message}`);
      console.error("Delete config error:", e);
    }
  };

  if (isLoading && configs.length === 0) { // Only show full page spinner on initial load
    return (
      <div className="flex justify-center items-center h-full py-10">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <FormSection title="Konfigurasi Prompt Saya">
        {error && <p className="text-red-500 dark:text-red-400 mb-4 p-4 bg-red-50 dark:bg-red-900/30 rounded-md">{error}</p>}
        
        <div className="mb-6">
          <Button onClick={fetchConfigs} variant="outline" size="sm" isLoading={isLoading} disabled={isLoading}>
            {isLoading ? 'Memuat Ulang...' : 'Muat Ulang Daftar Konfigurasi'}
          </Button>
        </div>

        {isLoading && configs.length === 0 && !error && ( // Show spinner inside section if loading and no data yet (but not on initial full load)
            <div className="flex justify-center py-4"><LoadingSpinner size="md" /></div>
        )}

        {!isLoading && configs.length === 0 && !error && (
          <p className="text-slate-500 dark:text-slate-400">Anda belum menyimpan konfigurasi apa pun. Buat prompt di Dashboard lalu simpan konfigurasinya!</p>
        )}
        
        {configs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {configs.map(config => (
              <div key={config.id} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-md shadow ring-1 ring-slate-200 dark:ring-slate-700 flex flex-col justify-between">
                <div>
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
                </div>
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