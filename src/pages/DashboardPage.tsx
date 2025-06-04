
// src/pages/DashboardPage.tsx
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom'; // BARU
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ImagePromptForm from '../components/forms/ImagePromptForm';
import VideoPromptForm from '../components/forms/VideoPromptForm';
import FormSection from '../components/ui/FormSection';
import { supabase } from '../lib/supabaseClient';
import { SavedPrompt, SavedVideoPrompt, ImagePromptFormState, VideoPromptFormState } from '../types'; // BARU: SavedVideoPrompt & form states
import Button from '../components/ui/Button';

type ActiveFormType = 'image' | 'video';

const DashboardPage: React.FC = () => {
  const { user, profile, profileLoading } = useAuth();
  const location = useLocation(); // BARU

  // State untuk form aktif dan data yang akan dimuat
  const [activeFormType, setActiveFormType] = useState<ActiveFormType>('image');
  const [loadedImageConfig, setLoadedImageConfig] = useState<ImagePromptFormState | undefined>(undefined);
  const [loadedVideoConfig, setLoadedVideoConfig] = useState<VideoPromptFormState | undefined>(undefined);
  
  // State untuk saved image prompts
  const [savedImagePrompts, setSavedImagePrompts] = useState<SavedPrompt[]>([]);
  const [savedImagePromptsLoading, setSavedImagePromptsLoading] = useState<boolean>(true);
  const [savedImagePromptsError, setSavedImagePromptsError] = useState<string | null>(null);

  // BARU: State untuk saved video prompts
  const [savedVideoPrompts, setSavedVideoPrompts] = useState<SavedVideoPrompt[]>([]);
  const [savedVideoPromptsLoading, setSavedVideoPromptsLoading] = useState<boolean>(true);
  const [savedVideoPromptsError, setSavedVideoPromptsError] = useState<string | null>(null);


  useEffect(() => { // BARU: Tangani pemuatan konfigurasi dari MyConfigsPage
    const state = location.state as { loadedConfig?: { type: string; parameters: any } } | null;
    if (state?.loadedConfig) {
      if (state.loadedConfig.type === 'image') {
        setActiveFormType('image');
        setLoadedImageConfig(state.loadedConfig.parameters as ImagePromptFormState);
        setLoadedVideoConfig(undefined); // Pastikan form lain di-reset
      } else if (state.loadedConfig.type === 'video') {
        setActiveFormType('video');
        setLoadedVideoConfig(state.loadedConfig.parameters as VideoPromptFormState);
        setLoadedImageConfig(undefined); // Pastikan form lain di-reset
      }
      // Hapus state dari location agar tidak memuat ulang jika halaman di-refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);


  useEffect(() => {
    const fetchSavedImagePrompts = async () => {
      if (!user) { setSavedImagePromptsLoading(false); return; }
      setSavedImagePromptsLoading(true); setSavedImagePromptsError(null);
      try {
        const { data, error } = await supabase.from('saved_prompts').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        if (error) throw error;
        setSavedImagePrompts(data || []);
      } catch (e: any) { setSavedImagePromptsError(e.message || "Gagal memuat prompt gambar tersimpan."); } 
      finally { setSavedImagePromptsLoading(false); }
    };
    fetchSavedImagePrompts();
  }, [user]);

  // BARU: Fetch saved video prompts
  useEffect(() => {
    const fetchSavedVideoPrompts = async () => {
      if (!user) { setSavedVideoPromptsLoading(false); return; }
      setSavedVideoPromptsLoading(true); setSavedVideoPromptsError(null);
      try {
        const { data, error } = await supabase.from('saved_video_prompts').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        if (error) throw error;
        setSavedVideoPrompts(data || []);
      } catch (e: any) { setSavedVideoPromptsError(e.message || "Gagal memuat prompt video tersimpan."); }
      finally { setSavedVideoPromptsLoading(false); }
    };
    fetchSavedVideoPrompts();
  }, [user]);


  if (profileLoading) {
    return <div className="flex justify-center items-center h-full py-10"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-slate-800 shadow-xl ring-1 ring-slate-200 dark:ring-slate-700 rounded-lg p-6 sm:p-8">
        <h1 className="text-3xl font-bold text-sky-600 dark:text-sky-400 mb-2">Dashboard TukangPrompt</h1>
        {user && (<p className="text-lg text-slate-700 dark:text-slate-300">Selamat datang kembali, <span className="font-semibold text-sky-500 dark:text-sky-300">{profile?.full_name || user.email}</span>!</p>)}
        {profile && (<p className="text-sm text-slate-500 dark:text-slate-400">Peran Anda: <span className="font-medium">{profile.role}</span></p>)}
      </div>

      <div className="my-8">
        <div className="flex space-x-2 sm:space-x-4 border-b border-slate-200 dark:border-slate-700 mb-6 pb-3">
          <Button variant={activeFormType === 'image' ? 'primary' : 'ghost'} onClick={() => { setActiveFormType('image'); setLoadedImageConfig(undefined); setLoadedVideoConfig(undefined);}} className={`px-3 py-2 sm:px-4 rounded-t-md ${activeFormType === 'image' ? 'text-sky-600 dark:text-sky-400 border-b-2 border-sky-500' : 'text-slate-500 dark:text-slate-400'}`}>
            Prompt Gambar
          </Button>
          <Button variant={activeFormType === 'video' ? 'primary' : 'ghost'} onClick={() => { setActiveFormType('video'); setLoadedImageConfig(undefined); setLoadedVideoConfig(undefined);}} className={`px-3 py-2 sm:px-4 rounded-t-md ${activeFormType === 'video' ? 'text-sky-600 dark:text-sky-400 border-b-2 border-sky-500' : 'text-slate-500 dark:text-slate-400'}`}>
            Prompt Video
          </Button>
        </div>

        {activeFormType === 'image' && (
          <div>
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-6">Parameter Prompt Gambar</h2>
            <ImagePromptForm key={loadedImageConfig ? 'loaded-image' : 'new-image'} initialData={loadedImageConfig} /> {/* BARU: key & initialData */}
          </div>
        )}
        {activeFormType === 'video' && (
          <div>
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-6">Parameter Prompt Video</h2>
            <VideoPromptForm key={loadedVideoConfig ? 'loaded-video' : 'new-video'} initialData={loadedVideoConfig} /> {/* BARU: key & initialData */}
          </div>
        )}
      </div>

      <FormSection title="Prompt Gambar Tersimpan Anda">
        {savedImagePromptsLoading ? <div className="flex justify-center py-4"><LoadingSpinner size="md" /></div>
        : savedImagePromptsError ? <p className="text-red-500 dark:text-red-400">{savedImagePromptsError}</p>
        : savedImagePrompts.length === 0 ? <p className="text-slate-500 dark:text-slate-400">Anda belum menyimpan prompt gambar apa pun.</p>
        : (<ul className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {savedImagePrompts.map((prompt) => (
              <li key={prompt.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-800/50">
                <h4 className="font-semibold text-sky-700 dark:text-sky-300 truncate" title={prompt.prompt_title || prompt.dall_e_prompt}>
                  {prompt.prompt_title || (prompt.dall_e_prompt || '').substring(0, 80) + ((prompt.dall_e_prompt || '').length > 80 ? '...' : '')}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Disimpan: {new Date(prompt.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </li>
            ))}
          </ul>
        )}
      </FormSection>

      {/* BARU: Bagian untuk Prompt Video Tersimpan */}
      <FormSection title="Prompt Video Tersimpan Anda">
        {savedVideoPromptsLoading ? <div className="flex justify-center py-4"><LoadingSpinner size="md" /></div>
        : savedVideoPromptsError ? <p className="text-red-500 dark:text-red-400">{savedVideoPromptsError}</p>
        : savedVideoPrompts.length === 0 ? <p className="text-slate-500 dark:text-slate-400">Anda belum menyimpan prompt video apa pun.</p>
        : (<ul className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {savedVideoPrompts.map((prompt) => (
              <li key={prompt.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-800/50">
                <h4 className="font-semibold text-sky-700 dark:text-sky-300 truncate" title={prompt.prompt_title || prompt.kling_ai_veo_prompt}>
                  {prompt.prompt_title || (prompt.kling_ai_veo_prompt || '').substring(0, 80) + ((prompt.kling_ai_veo_prompt || '').length > 80 ? '...' : '')}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Disimpan: {new Date(prompt.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </li>
            ))}
          </ul>
        )}
      </FormSection>
    </div>
  );
};

export default DashboardPage;
