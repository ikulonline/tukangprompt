// src/components/forms/VideoPromptForm.tsx
import React, { useState, ChangeEvent, FormEvent, useRef, useEffect } from 'react';
// BARU: Impor GeneratedVideoPrompts
import { VideoPromptFormState, SelectOption, RadioOption, GeneratedVideoPrompts } from '../../types';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import Button from '../ui/Button';
import FormSection from '../ui/FormSection';
import TooltipIcon from '../ui/TooltipIcon';
import VideoPromptOutput from '../VideoPromptOutput'; // BARU

const initialVideoFormState: VideoPromptFormState = {
  sceneDescription: '',
  estimatedDuration: '5-10s',
  mainCameraMovement: 'Statis',
  cameraMovementSpeed: 'Sedang',
  videoActionIntensity: 'Sedang',
  overallVideoMood: 'Epik',
  subjectType: '',
  subjectDescription: '',
  settingLocation: '',
  artisticCategory: '',
  aspectRatio: '16:9', 
  negativePrompt: '',
};

// Opsi untuk dropdown spesifik video
const durationOptions: SelectOption[] = [
  { value: '3-5s', label: 'Sangat Pendek (3-5 detik)' },
  { value: '5-10s', label: 'Pendek (5-10 detik)' },
  { value: '10-15s', label: 'Sedang (10-15 detik)' },
  { value: '15-30s', label: 'Panjang (15-30 detik)' },
];

const cameraMovementOptions: SelectOption[] = [
  { value: 'Statis', label: 'Statis' },
  { value: 'Pan Kiri', label: 'Pan Kiri' },
  { value: 'Pan Kanan', label: 'Pan Kanan' },
  { value: 'Tilt Atas', label: 'Tilt Atas' },
  { value: 'Tilt Bawah', label: 'Tilt Bawah' },
  { value: 'Zoom In', label: 'Zoom In' },
  { value: 'Zoom Out', label: 'Zoom Out' },
  { value: 'Dolly Shot', label: 'Dolly Shot' },
  { value: 'Tracking Shot', label: 'Tracking Shot (Mengikuti Subjek)' },
  { value: 'Crane Shot', label: 'Crane Shot (Dari atas ke bawah atau sebaliknya)'},
];

const cameraSpeedOptions: SelectOption[] = [
  { value: 'Sangat Lambat', label: 'Sangat Lambat'},
  { value: 'Lambat', label: 'Lambat' },
  { value: 'Sedang', label: 'Sedang' },
  { value: 'Cepat', label: 'Cepat' },
  { value: 'Sangat Cepat', label: 'Sangat Cepat'},
];

const actionIntensityOptions: SelectOption[] = [
  { value: 'Tenang', label: 'Tenang (Minimal Aksi)' },
  { value: 'Rendah', label: 'Rendah'},
  { value: 'Sedang', label: 'Sedang' },
  { value: 'Tinggi', label: 'Tinggi'},
  { value: 'Penuh Aksi', label: 'Penuh Aksi (Banyak Gerakan & Dinamika)' },
];

const videoMoodOptions: SelectOption[] = [
  { value: 'Epik', label: 'Epik & Megah' },
  { value: 'Romantis', label: 'Romantis & Emosional' },
  { value: 'Menegangkan', label: 'Menegangkan & Suspense' },
  { value: 'Lucu', label: 'Lucu & Menghibur' },
  { value: 'Seram', label: 'Seram & Mencekam' },
  { value: 'Misterius', label: 'Misterius & Enigmatik' },
  { value: 'Damai', label: 'Damai & Menenangkan' },
  { value: 'Energik', label: 'Energik & Semangat' },
];

const subjectTypeOptions: SelectOption[] = [
    { value: '', label: 'Pilih tipe subjek...' },
    { value: 'manusia', label: 'Manusia' },
    { value: 'hewan', label: 'Hewan' },
    { value: 'objek', label: 'Objek' },
    { value: 'makhluk_fantasi', label: 'Makhluk Fantasi' },
    { value: 'kendaraan', label: 'Kendaraan'},
    { value: 'pemandangan_alam', label: 'Pemandangan Alam'},
    { value: 'pemandangan_kota', label: 'Pemandangan Kota'},
];

const artisticCategoryOptions: SelectOption[] = [
    { value: '', label: 'Pilih kategori gaya visual...' },
    { value: 'realistis_cinematic', label: 'Realistis Cinematic' },
    { value: 'animasi_3d', label: 'Animasi 3D' },
    { value: 'animasi_2d', label: 'Animasi 2D (Kartun/Anime)' },
    { value: 'stop_motion', label: 'Stop Motion' },
    { value: 'dokumenter', label: 'Gaya Dokumenter' },
    { value: 'vfx_heavy', label: 'Banyak Efek Visual (VFX)'},
];

const aspectRatioVideoOptions: SelectOption[] = [ // Mengubah ke SelectOption untuk konsistensi penggunaan Select
  { value: '16:9', label: '16:9 (Landscape Umum)' },
  { value: '9:16', label: '9:16 (Portrait/Story)' },
  { value: '1:1', label: '1:1 (Persegi)' },
  { value: '4:3', label: '4:3 (Klasik TV)' },
  { value: '2.39:1', label: '2.39:1 (Cinemascope)'},
];


const VideoPromptForm: React.FC = () => {
  const [formState, setFormState] = useState<VideoPromptFormState>(initialVideoFormState);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedVideoPrompts, setGeneratedVideoPrompts] = useState<GeneratedVideoPrompts | null>(null); // BARU
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const outputRef = useRef<HTMLDivElement>(null); // BARU

  useEffect(() => { // BARU: Auto-scroll
    if (generatedVideoPrompts && !isLoading && !submissionError && outputRef.current) {
      outputRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [generatedVideoPrompts, isLoading, submissionError]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  // handleRadioChange tidak lagi diperlukan jika semua menggunakan Select
  // const handleRadioChange = (e: ChangeEvent<HTMLInputElement>) => { ... };

  const handleReset = () => {
    setFormState(initialVideoFormState);
    setGeneratedVideoPrompts(null); // BARU
    setSubmissionError(null);
    setIsLoading(false);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setGeneratedVideoPrompts(null); // BARU
    setSubmissionError(null);

    try {
      const response = await fetch('/api/generate-video-prompt', { // BARU: Endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formState),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Gagal menghasilkan prompt video (status ${response.status})`);
      }
      setGeneratedVideoPrompts(data as GeneratedVideoPrompts); // BARU
    } catch (error: any) {
      console.error("Error submitting video form:", error);
      setSubmissionError(error.message || "Terjadi kesalahan tak terduga saat mengirimkan formulir video.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-8">
        <FormSection title="Konsep & Deskripsi Video Utama">
          <Textarea
            label="Deskripsi Adegan Utama / Konsep Video"
            name="sceneDescription"
            placeholder="Contoh: Sebuah robot kecil menemukan bunga bercahaya di tengah reruntuhan kota pasca-apokaliptik..."
            value={formState.sceneDescription}
            onChange={handleChange}
            rows={5}
            required
          />
        </FormSection>

        <FormSection title="Detail Subjek & Setting (Opsional untuk Video)">
            <Select
                label="Tipe Subjek Utama (Jika Ada)"
                name="subjectType"
                options={subjectTypeOptions}
                value={formState.subjectType}
                onChange={handleChange}
            />
            <Textarea
                label="Deskripsi Subjek Utama (Jika Ada)"
                name="subjectDescription"
                placeholder="Contoh: Robot dengan mata biru besar, tubuh terbuat dari logam usang..."
                value={formState.subjectDescription}
                onChange={handleChange}
                rows={3}
                containerClassName="mt-4"
            />
            <Input
                label="Lokasi Setting Utama"
                name="settingLocation"
                placeholder="Contoh: Reruntuhan kota, hutan ajaib malam hari, stasiun luar angkasa..."
                value={formState.settingLocation}
                onChange={handleChange}
                containerClassName="mt-4"
            />
        </FormSection>

        <FormSection title="Parameter Sinematik & Durasi">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Estimasi Durasi Video"
              name="estimatedDuration"
              options={durationOptions}
              value={formState.estimatedDuration}
              onChange={handleChange}
            />
            <Select
              label="Gerakan Kamera Utama"
              name="mainCameraMovement"
              options={cameraMovementOptions}
              value={formState.mainCameraMovement}
              onChange={handleChange}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <Select
              label="Kecepatan Gerakan Kamera"
              name="cameraMovementSpeed"
              options={cameraSpeedOptions}
              value={formState.cameraMovementSpeed}
              onChange={handleChange}
            />
             <Select
                label="Aspect Ratio Video"
                name="aspectRatio"
                options={aspectRatioVideoOptions}
                value={formState.aspectRatio}
                onChange={handleChange}
            />
          </div>
        </FormSection>

        <FormSection title="Atmosfer & Gaya Video">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Intensitas Aksi dalam Video"
              name="videoActionIntensity"
              options={actionIntensityOptions}
              value={formState.videoActionIntensity}
              onChange={handleChange}
            />
            <Select
              label="Mood Keseluruhan Video"
              name="overallVideoMood"
              options={videoMoodOptions}
              value={formState.overallVideoMood}
              onChange={handleChange}
            />
          </div>
           <Select
                label="Kategori Umum Gaya Visual"
                name="artisticCategory"
                options={artisticCategoryOptions}
                value={formState.artisticCategory}
                onChange={handleChange}
                containerClassName="mt-4"
            />
        </FormSection>

        <FormSection title="Prompt Negatif Video (Opsional)" isCollapsible={true} initiallyOpen={false}>
            <Textarea
            label="Hal yang Dihindari dalam Video"
            name="negativePrompt"
            placeholder="Contoh: Goyangan kamera berlebih, kualitas rendah, pencahayaan buruk, diskontinuitas..."
            value={formState.negativePrompt}
            onChange={handleChange}
            rows={3}
            />
            <div className="flex items-center mt-1">
                <TooltipIcon text="Sebutkan elemen atau kualitas yang TIDAK Anda inginkan dalam video." />
            </div>
      </FormSection>

        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-slate-200 dark:border-slate-700">
          <Button type="button" variant="outline" onClick={handleReset} className="w-full sm:w-auto" disabled={isLoading}>
            Reset Semua Parameter
          </Button>
          <Button type="submit" variant="primary" className="w-full sm:w-auto" isLoading={isLoading}>
            {isLoading ? 'Menghasilkan...' : 'Hasilkan Prompt Video!'}
          </Button>
        </div>
      </form>

      {/* BARU: Render VideoPromptOutput */}
      <div ref={outputRef}>
        <VideoPromptOutput
          prompts={generatedVideoPrompts}
          isLoading={isLoading}
          error={submissionError}
        />
      </div>
    </>
  );
};

export default VideoPromptForm;
