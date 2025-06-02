import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import Button from './ui/Button';

const SunIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m8.66-15.66l-.707.707M5.05 18.95l-.707.707M21 12h-1M4 12H3m15.66 8.66l-.707-.707M5.05 5.05l-.707-.707" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a6 6 0 100-12 6 6 0 000 12z" />
  </svg>
);

const MoonIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const Navbar: React.FC = () => {
  const { user, signOut, isLoading: authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      console.error('Error logging out:', error.message);
    } else {
      navigate('/login');
    }
  };

  return (
    <nav className="bg-slate-100 dark:bg-slate-800 shadow-md sticky top-0 z-50 transition-colors duration-300">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-cyan-400 dark:from-sky-400 dark:to-cyan-300">Tukang</span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-rose-500 dark:from-pink-500 dark:to-rose-400">Prompt</span>
        </Link>
        <div className="flex items-center space-x-3">
          {authLoading ? (
            <span className="text-sm text-slate-500 dark:text-slate-400">Memuat...</span>
          ) : user ? (
            <>
              <span className="text-sm text-slate-700 dark:text-slate-300 hidden sm:block">{user.email}</span>
              <Button onClick={handleLogout} variant="secondary" size="sm">
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link to="/signup">
                <Button variant="primary" size="sm">Sign Up</Button>
              </Link>
            </>
          )}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 transition-colors duration-150"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;