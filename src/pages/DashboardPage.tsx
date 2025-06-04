// src/pages/DashboardPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ImagePromptForm from '../components/forms/ImagePromptForm';
import VideoPromptForm from '../components/forms/VideoPromptForm';
import FormSection from '../components/ui/FormSection';
import { supabase } from '../lib/supabaseClient';
import { SavedPrompt, SavedVideoPrompt, ImagePromptFormState, VideoPromptFormState } from '../types';
import Button from '../components/ui/Button';

type ActiveFormType = 'image' | 'video';

// Icons for copy functionality
const ClipboardIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-4 h-4 mr-1.5"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
  </svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-4 h-4 mr-1.5 text-green-500 dark:text-green-400"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  </svg>
);


const DashboardPage: React.FC = () => {
  const { user, profile, profileLoading } = useAuth();
  const location = useLocation();

  const [activeFormType, setActiveFormType] = useState<ActiveFormType>('image');
  const [loadedImageConfig, setLoadedImageConfig] = useState<ImagePromptFormState | undefined>(undefined);
  const [loadedVideoConfig, setLoadedVideoConfig] = useState<VideoPromptFormState | undefined>(undefined);
  
  const [savedImagePrompts, setSavedImagePrompts] = useState<SavedPrompt[]>([]);
  const [savedImagePromptsLoading, setSavedImagePromptsLoading] = useState<boolean>(true);
  const [savedImagePromptsError, setSavedImagePromptsError] = useState<string | null>(null);

  const [savedVideoPrompts, setSavedVideoPrompts] = useState<SavedVideoPrompt[]>([]);
  const [savedVideoPromptsLoading, setSavedVideoPromptsLoading] = useState<boolean>(true);
  const [savedVideoPromptsError, setSavedVideoPromptsError] = useState<string | null>(null);

  const [copiedInfo, setCopiedInfo] = useState<{ id: string; type: string } | null>(null);

  const handleCopy = async (textToCopy: string | null | undefined, promptId: string, type: string) => {
    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedInfo({ id: promptId, type });
      setTimeout(() => setCopiedInfo(null), 2000);
    } catch (err) {
      console.error('Gagal menyalin:', err);
      // Optionally, display an error message to the user
      alert('Gagal menyalin prompt. Silakan coba lagi.');
    }
  };

  const fetchSavedImagePrompts = useCallback(async () => {
    if (!user) { setSavedImagePromptsLoading(false); return; }
    setSavedImagePromptsLoading(true); setSavedImagePromptsError(null);
    try {
      const { data, error } = await supabase.from('saved_prompts').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (error) throw error;
      setSavedImagePrompts(data || []);
    } catch (e: any) { setSavedImagePromptsError(e.message || "Gagal memuat prompt gambar tersimpan."); } 
    finally { setSavedImagePromptsLoading(false); }
  }, [user]);

  const fetchSavedVideoPrompts = useCallback(async () => {
    if (!user) { setSavedVideoPromptsLoading(false); return; }
    setSavedVideoPromptsLoading(true); setSavedVideoPromptsError(null);
    try {
      const { data, error } = await supabase.from('saved_video_prompts').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (error) throw error;
      setSavedVideoPrompts(data || []);
    } catch (e: any) { setSavedVideoPromptsError(e.message || "Gagal memuat prompt video tersimpan."); }
    finally { setSavedVideoPromptsLoading(false); }
  }, [user]);

  useEffect(() => {
    fetchSavedImagePrompts();
    fetchSavedVideoPrompts();
  }, [user, fetchSavedImagePrompts, fetchSavedVideoPrompts]);


  useEffect(() => { 
    const state = location.state as { loadedConfig?: { type: string; parameters: any } } | null;
    if (state?.loadedConfig) {
      if (state.loadedConfig.type === 'image') {
        setActiveFormType('image');
        setLoadedImageConfig(state.loadedConfig.parameters as ImagePromptFormState);
        setLoadedVideoConfig(undefined); 
      } else if (state.loadedConfig.type === 'video') {
        setActiveFormType('video');
        setLoadedVideoConfig(state.loadedConfig.parameters as VideoPromptFormState);
        setLoadedImageConfig(undefined);
      }
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);


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
          <Button 
            variant={activeFormType === 'image' ? 'primary' : 'ghost'} 
            onClick={() => { 
              setActiveFormType('image'); 
              setLoadedImageConfig(undefined); 
              setLoadedVideoConfig(undefined); 
            }} 
            className={`px-3 py-2 sm:px-4 rounded-t-md ${activeFormType === 'image' ? 'text-sky-600 dark:text-sky-400 border-b-2 border-sky-500' : 'text-slate-500 dark:text-slate-400'}`}
          >
            Prompt Gambar
          </Button>
          <Button 
            variant={activeFormType === 'video' ? 'primary' : 'ghost'} 
            onClick={() => { 
              setActiveFormType('video'); 
              setLoadedImageConfig(undefined); 
              setLoadedVideoConfig(undefined); 
            }} 
            className={`px-3 py-2 sm:px-4 rounded-t-md ${activeFormType === 'video' ? 'text-sky-600 dark:text-sky-400 border-b-2 border-sky-500' : 'text-slate-500 dark:text-slate-400'}`}
          >
            Prompt Video
          </Button>
        </div>

        {activeFormType === 'image' && (
          <div>
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-6">Parameter Prompt Gambar</h2>
            <ImagePromptForm 
                key={loadedImageConfig ? JSON.stringify(loadedImageConfig) : 'new-image-form'} 
                initialData={loadedImageConfig} 
                onPromptSaveSuccess={fetchSavedImagePrompts}
            />
          </div>
        )}
        {activeFormType === 'video' && (
          <div>
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-6">Parameter Prompt Video</h2>
            <VideoPromptForm 
                key={loadedVideoConfig ? JSON.stringify(loadedVideoConfig) : 'new-video-form'} 
                initialData={loadedVideoConfig} 
                onPromptSaveSuccess={fetchSavedVideoPrompts}
            />
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
                <div className="mt-2 flex flex-wrap gap-2">
                  {prompt.dall_e_prompt && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleCopy(prompt.dall_e_prompt, prompt.id, 'dalle')}
                      title="Salin prompt DALL-E / Umum"
                    >
                      {copiedInfo?.id === prompt.id && copiedInfo?.type === 'dalle' ? <CheckIcon /> : <ClipboardIcon />}
                      {copiedInfo?.id === prompt.id && copiedInfo?.type === 'dalle' ? 'Tersalin!' : 'Salin DALL-E'}
                    </Button>
                  )}
                  {prompt.midjourney_prompt && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleCopy(prompt.midjourney_prompt, prompt.id, 'midjourney')}
                      title="Salin prompt Midjourney"
                    >
                      {copiedInfo?.id === prompt.id && copiedInfo?.type === 'midjourney' ? <CheckIcon /> : <ClipboardIcon />}
                      {copiedInfo?.id === prompt.id && copiedInfo?.type === 'midjourney' ? 'Tersalin!' : 'Salin Midjourney'}
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </FormSection>

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
                <div className="mt-2 flex flex-wrap gap-2">
                  {prompt.kling_ai_veo_prompt && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleCopy(prompt.kling_ai_veo_prompt, prompt.id, 'kling')}
                      title="Salin prompt Kling/Veo"
                    >
                      {copiedInfo?.id === prompt.id && copiedInfo?.type === 'kling' ? <CheckIcon /> : <ClipboardIcon />}
                      {copiedInfo?.id === prompt.id && copiedInfo?.type === 'kling' ? 'Tersalin!' : 'Salin Kling/Veo'}
                    </Button>
                  )}
                  {prompt.chatgpt_video_idea_prompt && (
                     <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleCopy(prompt.chatgpt_video_idea_prompt, prompt.id, 'chatgpt_idea')}
                      title="Salin Ide Video ChatGPT"
                    >
                      {copiedInfo?.id === prompt.id && copiedInfo?.type === 'chatgpt_idea' ? <CheckIcon /> : <ClipboardIcon />}
                      {copiedInfo?.id === prompt.id && copiedInfo?.type === 'chatgpt_idea' ? 'Tersalin!' : 'Salin Ide Video'}
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </FormSection>
    </div>
  );
};

export default DashboardPage;