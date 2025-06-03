// src/components/forms/ImagePromptForm.tsx
import React, { useState, ChangeEvent, FormEvent, useRef, useEffect } from 'react'; // BARU: Impor useRef, useEffect
import { SelectOption, RadioOption } from '../../types';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import RadioGroup from '../ui/RadioGroup';
import Button from '../ui/Button';
import TooltipIcon from '../ui/TooltipIcon';
import FormSection from '../ui/FormSection';
import ImagePromptOutput from '../ImagePromptOutput';

interface FormState {
  subjectType: string;
  subjectDescription: string;
  subjectCount: string;
  subjectAppearanceDetails: string;
  actionDescription: string;
  settingLocation: string;
  settingTime: string;
  settingWeather: string;
  settingAtmosphere: string;
  cameraAngle: string;
  shotDistance: string;
  artisticCategory: string;
  artisticSubStyle: string;
  artistInspiration: string;
  lightingType: string;
  colorPaletteDescription: string;
  dominantColor: string;
  detailLevel: string;
  aspectRatio: string;
  negativePrompt: string;
}

const initialFormState: FormState = {
  subjectType: '',
  subjectDescription: '',
  subjectCount: 'Satu',
  subjectAppearanceDetails: '',
  actionDescription: '',
  settingLocation: '',
  settingTime: 'Siang',
  settingWeather: '',
  settingAtmosphere: '',
  cameraAngle: 'Eye-level',
  shotDistance: 'Medium shot',
  artisticCategory: '',
  artisticSubStyle: '',
  artistInspiration: '',
  lightingType: '',
  colorPaletteDescription: '',
  dominantColor: '',
  detailLevel: 'Sedang',
  aspectRatio: '1:1',
  negativePrompt: '',
};

interface GeneratedPrompts {
  dall_e_prompt: string;
  midjourney_prompt: string;
}

// Opsi-opsi tetap sama
const subjectTypeOptions: SelectOption[] = [
  { value: '', label: 'Pilih tipe subjek...' },
  { value: 'manusia', label: 'Manusia' },
  { value: 'hewan', label: 'Hewan' },
  { value: 'objek', label: 'Objek' },
  { value: 'makhluk_fantasi', label: 'Makhluk Fantasi' },
  { value: 'pemandangan', label: 'Pemandangan' },
  { value: 'arsitektur', label: 'Arsitektur' },
  { value: 'abstrak', label: 'Abstrak' },
];
const subjectCountOptions: RadioOption[] = [
  { value: 'Satu', label: 'Satu' },
  { value: 'Beberapa', label: 'Beberapa' },
  { value: 'Banyak', label: 'Banyak' },
];
const settingTimeOptions: RadioOption[] = [
  { value: 'Pagi', label: 'Pagi' },
  { value: 'Siang', label: 'Siang' },
  { value: 'Sore', label: 'Sore' },
  { value: 'Malam', label: 'Malam' },
  { value: 'Senja', label: 'Senja (Sunset)' },
  { value: 'Fajar', label: 'Fajar (Sunrise)' },
];
const settingWeatherOptions: SelectOption[] = [
  { value: '', label: 'Pilih cuaca (opsional)...' },
  { value: 'cerah', label: 'Cerah' },
  { value: 'berawan', label: 'Berawan' },
  { value: 'hujan', label: 'Hujan' },
  { value: 'salju', label: 'Salju' },
  { value: 'berkabut', label: 'Berkabut' },
  { value: 'badai', label: 'Badai' },
];
const settingAtmosphereOptions: SelectOption[] = [
  { value: '', label: 'Pilih atmosfer...' },
  { value: 'tenang', label: 'Tenang & Damai' },
  { value: 'dramatis', label: 'Dramatis' },
  { value: 'misterius', label: 'Misterius' },
  { value: 'ceria', label: 'Ceria & Bahagia' },
  { value: 'suram', label: 'Suram & Gelap' },
  { value: 'romantis', label: 'Romantis' },
  { value: 'megah', label: 'Megah & Epik' },
];
const cameraAngleOptions: SelectOption[] = [
  { value: 'Eye-level', label: 'Eye-level (Sejajar Mata)' },
  { value: 'Low angle', label: 'Low Angle (Dari Bawah)' },
  { value: 'High angle', label: 'High Angle (Dari Atas)' },
  { value: 'Birds eye view', label: 'Bird\'s Eye View (Pandangan Burung)' },
  { value: 'Worms eye view', label: 'Worm\'s Eye View (Pandangan Cacing)' },
  { value: 'Dutch angle', label: 'Dutch Angle (Miring)' },
];
const shotDistanceOptions: SelectOption[] = [
  { value: 'Extreme Close-up', label: 'Extreme Close-up' },
  { value: 'Close-up', label: 'Close-up' },
  { value: 'Medium shot', label: 'Medium Shot' },
  { value: 'Cowboy shot', label: 'Cowboy Shot (Dari pinggang ke atas)' },
  { value: 'Full shot', label: 'Full Shot (Seluruh badan)' },
  { value: 'Long shot', label: 'Long Shot (Subjek terlihat kecil)' },
];
const artisticCategoryOptions: SelectOption[] = [
  { value: '', label: 'Pilih kategori gaya...' },
  { value: 'fotorealistis', label: 'Fotorealistis' },
  { value: 'lukisan', label: 'Lukisan' },
  { value: 'ilustrasi', label: 'Ilustrasi' },
  { value: 'kartun', label: 'Kartun' },
  { value: 'anime', label: 'Anime / Manga' },
  { value: '3d_render', label: '3D Render' },
  { value: 'pixel_art', label: 'Pixel Art' },
  { value: 'seni_konsep', label: 'Seni Konsep (Concept Art)' },
  { value: 'sketsa', label: 'Sketsa' },
];
const artisticSubStyleOptions: SelectOption[] = [
  { value: '', label: 'Pilih sub-gaya (opsional)...' },
  { value: 'impresionisme', label: 'Impresionisme (Lukisan)' },
  { value: 'surealisme', label: 'Surealisme (Lukisan)' },
  { value: 'kubisme', label: 'Kubisme (Lukisan)' },
  { value: 'hyperrealism', label: 'Hyperrealism (Fotorealistis)' },
  { value: 'cinematic_photo', label: 'Cinematic (Fotorealistis)' },
  { value: 'digital_painting', label: 'Digital Painting (Ilustrasi)' },
  { value: 'vector_art', label: 'Vector Art (Ilustrasi)' },
  { value: 'vintage_cartoon', label: 'Vintage Cartoon (Kartun)' },
  { value: 'chibi', label: 'Chibi (Anime)' },
];
const lightingTypeOptions: SelectOption[] = [
  { value: '', label: 'Pilih tipe pencahayaan...' },
  { value: 'alami', label: 'Cahaya Alami (Natural Light)' },
  { value: 'studio', label: 'Studio Light' },
  { value: 'remang', label: 'Cahaya Remang (Dim Light)' },
  { value: 'neon', label: 'Lampu Neon' },
  { value: 'backlighting', label: 'Cahaya Latar (Backlighting)' },
  { value: 'golden_hour', label: 'Golden Hour' },
  { value: 'blue_hour', label: 'Blue Hour' },
  { value: 'dramatic', label: 'Cahaya Dramatis' },
];
const colorPaletteOptions: SelectOption[] = [
  { value: '', label: 'Pilih deskripsi palet...' },
  { value: 'monokromatik', label: 'Monokromatik' },
  { value: 'analog', label: 'Analog' },
  { value: 'komplementer', label: 'Komplementer' },
  { value: 'triadik', label: 'Triadik' },
  { value: 'hangat', label: 'Warna Hangat' },
  { value: 'dingin', label: 'Warna Dingin' },
  { value: 'pastel', label: 'Pastel' },
  { value: 'vibrant', label: 'Cerah & Menyala (Vibrant)' },
  { value: 'gelap', label: 'Gelap & Suram (Dark Tones)' },
];
const detailLevelOptions: SelectOption[] = [
  { value: 'Sangat Sederhana', label: 'Sangat Sederhana' },
  { value: 'Sederhana', label: 'Sederhana' },
  { value: 'Sedang', label: 'Sedang' },
  { value: 'Detail', label: 'Detail' },
  { value: 'Sangat Detail', label: 'Sangat Detail' },
  { value: 'Ultra Detail', label: 'Ultra Detail' },
];
const aspectRatioOptions: RadioOption[] = [
  { value: '1:1', label: '1:1 (Persegi)' },
  { value: '16:9', label: '16:9 (Landscape)' },
  { value: '9:16', label: '9:16 (Portrait)' },
  { value: '4:3', label: '4:3 (Klasik)' },
  { value: '3:2', label: '3:2 (Foto)' },
];


const ImagePromptForm: React.FC = () => {
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedPrompts, setGeneratedPrompts] = useState<GeneratedPrompts | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const outputRef = useRef<HTMLDivElement>(null); // BARU: Ref untuk elemen output

  // BARU: useEffect untuk auto-scroll
  useEffect(() => {
    if (generatedPrompts && !isLoading && !submissionError && outputRef.current) {
      outputRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [generatedPrompts, isLoading, submissionError]);

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
    setFormState(initialFormState);
    setGeneratedPrompts(null);
    setSubmissionError(null);
    setIsLoading(false);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setGeneratedPrompts(null);
    setSubmissionError(null);

    try {
      const response = await fetch('/api/generate-image-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formState),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Gagal menghasilkan prompt (status ${response.status})`);
      }

      setGeneratedPrompts(data as GeneratedPrompts);
    } catch (error: any) {
      console.error("Error submitting form:", error);
      setSubmissionError(error.message || "Terjadi kesalahan tak terduga saat mengirimkan formulir.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-8">
        <FormSection title="Subjek Utama">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Tipe Subjek"
            name="subjectType"
            options={subjectTypeOptions}
            value={formState.subjectType}
            onChange={handleChange}
            containerClassName="flex-grow"
          />
          <div className="flex items-end">
             <RadioGroup
                label="Jumlah Subjek"
                name="subjectCount"
                options={subjectCountOptions}
                selectedValue={formState.subjectCount}
                onChange={handleRadioChange}
              />
          </div>
        </div>
        <Textarea
          label="Deskripsi Subjek"
          name="subjectDescription"
          placeholder="Contoh: Seorang ksatria tua dengan armor berkilau, mata bijaksana, membawa pedang legendaris..."
          value={formState.subjectDescription}
          onChange={handleChange}
          rows={4}
        />
        <Textarea
          label="Detail Penampilan (Opsional)"
          name="subjectAppearanceDetails"
          placeholder="Contoh: Jubah merah anggur, bekas luka di pipi kiri, tato naga di lengan..."
          value={formState.subjectAppearanceDetails}
          onChange={handleChange}
          rows={3}
        />
      </FormSection>

      <FormSection title="Aksi / Pose Subjek">
        <Textarea
          label="Deskripsi Aksi atau Pose"
          name="actionDescription"
          placeholder="Contoh: Berdiri gagah di puncak gunung, melompat kegirangan, termenung memandang bintang..."
          value={formState.actionDescription}
          onChange={handleChange}
          rows={3}
        />
         <div className="flex items-center mt-1">
            <TooltipIcon text="Jelaskan apa yang sedang dilakukan atau bagaimana posisi subjek." />
        </div>
      </FormSection>

      <FormSection title="Setting / Latar Belakang">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
                label="Lokasi"
                name="settingLocation"
                placeholder="Contoh: Hutan ajaib, kota cyberpunk, pantai tropis..."
                value={formState.settingLocation}
                onChange={handleChange}
            />
            <RadioGroup
                label="Waktu"
                name="settingTime"
                options={settingTimeOptions}
                selectedValue={formState.settingTime}
                onChange={handleRadioChange}
            />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <Select
                label="Cuaca (Opsional)"
                name="settingWeather"
                options={settingWeatherOptions}
                value={formState.settingWeather}
                onChange={handleChange}
            />
            <Select
                label="Atmosfer / Mood Latar"
                name="settingAtmosphere"
                options={settingAtmosphereOptions}
                value={formState.settingAtmosphere}
                onChange={handleChange}
            />
        </div>
         <div className="flex items-center mt-1">
            <TooltipIcon text="Deskripsikan lingkungan, waktu, cuaca, dan suasana umum dari latar belakang." />
        </div>
      </FormSection>

      <FormSection title="Komposisi & Framing">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
                label="Sudut Pandang Kamera"
                name="cameraAngle"
                options={cameraAngleOptions}
                value={formState.cameraAngle}
                onChange={handleChange}
            />
            <Select
                label="Jarak Tembak (Shot Distance)"
                name="shotDistance"
                options={shotDistanceOptions}
                value={formState.shotDistance}
                onChange={handleChange}
            />
        </div>
        <div className="flex items-center mt-1">
            <TooltipIcon text="Bagaimana subjek di-frame dalam gambar? Dari sudut mana kamera melihat subjek?" />
        </div>
      </FormSection>
      
      <FormSection title="Gaya Artistik">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
                label="Kategori Umum Gaya"
                name="artisticCategory"
                options={artisticCategoryOptions}
                value={formState.artisticCategory}
                onChange={handleChange}
            />
            <Select
                label="Sub-Gaya (Opsional)"
                name="artisticSubStyle"
                options={artisticSubStyleOptions} 
                value={formState.artisticSubStyle}
                onChange={handleChange}
            />
        </div>
        <Input
            label="Inspirasi Seniman (Opsional)"
            name="artistInspiration"
            placeholder="Contoh: Van Gogh, Hayao Miyazaki, H.R. Giger..."
            value={formState.artistInspiration}
            onChange={handleChange}
            containerClassName="mt-4"
        />
         <div className="flex items-center mt-1">
            <TooltipIcon text="Tentukan tampilan visual keseluruhan gambar. Apakah itu seperti foto, lukisan, kartun, dll.?" />
        </div>
      </FormSection>

      <FormSection title="Pencahayaan">
        <Select
            label="Tipe Pencahayaan"
            name="lightingType"
            options={lightingTypeOptions}
            value={formState.lightingType}
            onChange={handleChange}
        />
         <div className="flex items-center mt-1">
            <TooltipIcon text="Bagaimana pencahayaan dalam adegan? Apakah dramatis, lembut, terang, gelap?" />
        </div>
      </FormSection>

      <FormSection title="Palet Warna">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
                label="Deskripsi Palet Warna"
                name="colorPaletteDescription"
                options={colorPaletteOptions}
                value={formState.colorPaletteDescription}
                onChange={handleChange}
            />
            <Input
                label="Warna Dominan (Opsional)"
                name="dominantColor"
                placeholder="Contoh: Merah menyala, biru laut dalam, hijau zamrud..."
                value={formState.dominantColor}
                onChange={handleChange}
            />
        </div>
        <div className="flex items-center mt-1">
            <TooltipIcon text="Gambarkan skema warna atau warna utama yang diinginkan." />
        </div>
      </FormSection>

      <FormSection title="Detail Tambahan & Kualitas">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
                label="Tingkat Detail"
                name="detailLevel"
                options={detailLevelOptions}
                value={formState.detailLevel}
                onChange={handleChange}
            />
            <RadioGroup
                label="Aspect Ratio"
                name="aspectRatio"
                options={aspectRatioOptions}
                selectedValue={formState.aspectRatio}
                onChange={handleRadioChange}
                inline={false} 
            />
        </div>
         <div className="flex items-center mt-1">
            <TooltipIcon text="Seberapa detail gambar yang diinginkan dan rasio aspeknya." />
        </div>
      </FormSection>

      <FormSection title="Prompt Negatif (Opsional)" isCollapsible={true} initiallyOpen={false}>
        <Textarea
          label="Hal yang Dihindari"
          name="negativePrompt"
          placeholder="Contoh: Tangan buruk, teks, blur, warna kusam, kualitas rendah..."
          value={formState.negativePrompt}
          onChange={handleChange}
          rows={3}
        />
        <div className="flex items-center mt-1">
            <TooltipIcon text="Sebutkan elemen atau kualitas yang TIDAK Anda inginkan dalam gambar." />
        </div>
      </FormSection>


        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-slate-200 dark:border-slate-700">
          <Button type="button" variant="outline" onClick={handleReset} className="w-full sm:w-auto" disabled={isLoading}>
            Reset Semua Parameter
          </Button>
          <Button type="submit" variant="primary" className="w-full sm:w-auto" isLoading={isLoading}>
            {isLoading ? 'Menghasilkan...' : 'Hasilkan Prompt!'}
          </Button>
        </div>
      </form>

      {/* BARU: Tambahkan ref ke div pembungkus ImagePromptOutput */}
      <div ref={outputRef}>
        <ImagePromptOutput prompts={generatedPrompts} isLoading={isLoading} error={submissionError} />
      </div>
    </>
  );
};

export default ImagePromptForm;