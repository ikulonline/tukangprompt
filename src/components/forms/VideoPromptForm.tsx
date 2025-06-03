// src/components/forms/VideoPromptForm.tsx
import React, { useState, ChangeEvent, FormEvent } from 'react';
import { VideoPromptFormState, SelectOption, RadioOption } from '../../types'; // Impor tipe yang relevan
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import Button from '../ui/Button';
import FormSection from '../ui/FormSection';
import TooltipIcon from '../ui/TooltipIcon';
// Impor RadioGroup jika diperlukan untuk Video (misal aspect ratio)
// import RadioGroup from '../ui/RadioGroup';

const initialVideoFormState: VideoPromptFormState = {
  sceneDescription: '',
  estimatedDuration: '5-10s',
  mainCameraMovement: 'Statis',
  cameraMovementSpeed: 'Sedang',
  videoActionIntensity: 'Sedang',
  overallVideoMood: 'Epik',
  // Inisialisasi parameter yang mungkin diambil dari ImagePromptForm
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

// Opsi yang mungkin di-share atau dimodifikasi dari ImagePromptForm
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

const aspectRatioVideoOptions: RadioOption[] = [
  { value: '16:9', label: '16:9 (Landscape Umum)' },
  { value: '9:16', label: '9:16 (Portrait/Story)' },
  { value: '1:1', label: '1:1 (Persegi)' },
  { value: '4:3', label: '4:3 (Klasik TV)' },
  { value: '2.39:1', label: '2.39:1 (Cinemascope)'},
];


const VideoPromptForm: React.FC = () => {
  const [formState, setFormState] = useState<VideoPromptFormState>(initialVideoFormState);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // const [generatedPrompts, setGeneratedPrompts] = useState<GeneratedVideoPrompts | null>(null); // Akan digunakan nanti
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleRadioChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prevState => ({
        ...prevState,
        [name]: value,
    }));
  };

  const handleReset = () => {
    setFormState(initialVideoFormState);
    // setGeneratedPrompts(null); // Akan digunakan nanti
    setSubmissionError(null);
    setIsLoading(false);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    // setGeneratedPrompts(null); // Akan digunakan nanti
    setSubmissionError(null);
    console.log("Video form submitted:", formState);
    // Logika untuk mengirim ke backend Netlify Function akan ditambahkan di sini
    // Untuk sekarang, kita hanya log dan set loading ke false setelah delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSubmissionError("Fungsi backend untuk video belum diimplementasikan.");
    setIsLoading(false);
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
                options={aspectRatioVideoOptions.map(opt => ({value: opt.value, label: opt.label}))} // Sesuaikan jika RadioGroup digunakan
                value={formState.aspectRatio}
                onChange={handleChange}
            />
            {/* Jika ingin RadioGroup untuk Aspect Ratio Video:
            <RadioGroup
                label="Aspect Ratio Video"
                name="aspectRatio"
                options={aspectRatioVideoOptions}
                selectedValue={formState.aspectRatio}
                onChange={handleRadioChange}
                inline={false}
            />
            */}
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

      {/* Placeholder untuk output prompt video, akan dibuat komponennya nanti */}
      {submissionError && (
        <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300">
          <h4 className="font-semibold">Error Sementara:</h4>
          <p>{submissionError}</p>
        </div>
      )}
      {/* {generatedPrompts && <VideoPromptOutput prompts={generatedPrompts} />} */}
    </>
  );
};

export default VideoPromptForm;