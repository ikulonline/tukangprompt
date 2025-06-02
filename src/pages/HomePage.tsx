import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const HomePage: React.FC = () => {
  const { user, isLoading } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center text-center py-12">
      {/* Adjusted background gradient for better visibility in light mode too */}
      <div 
        className="absolute inset-0 -z-10 h-full w-full 
                   bg-white dark:bg-slate-900 
                   bg-[linear-gradient(to_right,theme(colors.slate.100)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.slate.100)_1px,transparent_1px)] 
                   dark:bg-[linear-gradient(to_right,theme(colors.slate.800)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.slate.800)_1px,transparent_1px)] 
                   bg-[size:4rem_4rem] opacity-60 dark:opacity-20"
      ></div>
      
      <header className="mb-10 sm:mb-12 relative z-10">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-cyan-400 dark:from-sky-400 dark:to-cyan-300">Tukang</span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-rose-500 dark:from-pink-500 dark:to-rose-400">Prompt</span>
        </h1>
        <p className="text-lg sm:text-xl text-slate-700 dark:text-slate-300 max-w-md sm:max-w-xl md:max-w-2xl mx-auto">
          Selamat Datang di TukangPrompt! Aplikasi Anda untuk meracik prompt AI yang detail dan efektif untuk gambar dan video.
        </p>
      </header>

      <main className="relative z-10">
        {isLoading ? (
          <LoadingSpinner size="lg" />
        ) : (
          <Link to={user ? "/dashboard" : "/login"}>
            <Button variant="primary" size="lg">
              Mulai Sekarang
            </Button>
          </Link>
        )}
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-6 max-w-lg mx-auto">
          Belum punya akun? <Link to="/signup" className="text-sky-600 hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300 font-medium">Daftar di sini</Link> dan mulai kreasikan prompt Anda!
        </p>
      </main>
    </div>
  );
};

export default HomePage;