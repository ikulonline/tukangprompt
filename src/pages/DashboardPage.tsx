// src/pages/DashboardPage.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ImagePromptForm from '../components/forms/ImagePromptForm';
import VideoPromptForm from '../components/forms/VideoPromptForm'; // BARU
import FormSection from '../components/ui/FormSection';
import { supabase } from '../lib/supabaseClient';
import { SavedPrompt } from '../types';
import Button from '../components/ui/Button'; // BARU

type ActiveFormType = 'image' | 'video'; // BARU

const DashboardPage: React.FC = () => {
  const { user, profile, profileLoading } = useAuth();
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);
  const [savedPromptsLoading, setSavedPromptsLoading] = useState<boolean>(true);
  const [savedPromptsError, setSavedPromptsError] = useState<string | null>(null);
  const [activeFormType, setActiveFormType] = useState<ActiveFormType>('image'); // BARU

  useEffect(() => {
    const fetchSavedPrompts = async () => {
      if (!user) {
        setSavedPromptsLoading(false);
        return;
      }

      setSavedPromptsLoading(true);
      setSavedPromptsError(null);
      try {
        const { data, error } = await supabase
          .from('saved_prompts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }
        setSavedPrompts(data || []);
      } catch (e: any) {
        console.error("Error fetching saved prompts:", e);
        setSavedPromptsError(e.message || "Gagal memuat prompt tersimpan.");
      } finally {
        setSavedPromptsLoading(false);
      }
    };

    fetchSavedPrompts();
  }, [user]);


  if (profileLoading) {
    return (
      <div className="flex justify-center items-center h-full py-10">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-slate-800 shadow-xl ring-1 ring-slate-200 dark:ring-slate-700 rounded-lg p-6 sm:p-8">
        <h1 className="text-3xl font-bold text-sky-600 dark:text-sky-400 mb-2">
          Dashboard TukangPrompt
        </h1>
        {user && (
          <p className="text-lg text-slate-700 dark:text-slate-300">
            Selamat datang kembali,{' '}
            <span className="font-semibold text-sky-500 dark:text-sky-300">
              {profile?.full_name || user.email}
            </span>
            !
          </p>
        )}
        {profile && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Peran Anda: <span className="font-medium">{profile.role}</span>
          </p>
        )}
      </div>

      {/* Bagian untuk menampilkan prompt tersimpan */}
      <FormSection title="Prompt Tersimpan Anda">
        {savedPromptsLoading ? (
          <div className="flex justify-center py-4">
            <LoadingSpinner size="md" />
          </div>
        ) : savedPromptsError ? (
          <p className="text-red-500 dark:text-red-400">{savedPromptsError}</p>
        ) : savedPrompts.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400">Anda belum menyimpan prompt apa pun.</p>
        ) : (
          <ul className="space-y-4">
            {savedPrompts.map((prompt) => (
              <li key={prompt.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-800/50">
                <h4 className="font-semibold text-sky-700 dark:text-sky-300 truncate" title={prompt.prompt_title || prompt.dall_e_prompt}>
                  {prompt.prompt_title || prompt.dall_e_prompt.substring(0, 80) + (prompt.dall_e_prompt.length > 80 ? '...' : '')}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Disimpan pada: {new Date(prompt.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                {/* Tombol untuk Muat ke Form dan Hapus akan ditambahkan di iterasi berikutnya */}
              </li>
            ))}
          </ul>
        )}
      </FormSection>

      {/* BARU: Pemilihan Tipe Form */}
      <div className="my-8">
        <div className="flex space-x-4 border-b border-slate-200 dark:border-slate-700 mb-6 pb-3">
          <Button
            variant={activeFormType === 'image' ? 'primary' : 'ghost'}
            onClick={() => setActiveFormType('image')}
            className={`px-4 py-2 rounded-t-md ${activeFormType === 'image' ? 'text-sky-600 dark:text-sky-400 border-b-2 border-sky-500' : 'text-slate-500 dark:text-slate-400'}`}
          >
            Buat Prompt Gambar
          </Button>
          <Button
            variant={activeFormType === 'video' ? 'primary' : 'ghost'}
            onClick={() => setActiveFormType('video')}
            className={`px-4 py-2 rounded-t-md ${activeFormType === 'video' ? 'text-sky-600 dark:text-sky-400 border-b-2 border-sky-500' : 'text-slate-500 dark:text-slate-400'}`}
          >
            Buat Prompt Video
          </Button>
        </div>

        {activeFormType === 'image' && (
          <div>
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-6">
              Parameter Prompt Gambar
            </h2>
            <ImagePromptForm />
          </div>
        )}

        {activeFormType === 'video' && (
          <div>
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-6">
              Parameter Prompt Video
            </h2>
            <VideoPromptForm />
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;