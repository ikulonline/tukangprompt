import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from './ui/Button'; // Assuming you have a Button component

const Navbar: React.FC = () => {
  const { user, signOut, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      console.error('Error logging out:', error.message);
      // Optionally, display an error message to the user
    } else {
      navigate('/login'); // Redirect to login page after logout
    }
  };

  return (
    <nav className="bg-slate-800 shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-cyan-300">Tukang</span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-rose-400">Prompt</span>
        </Link>
        <div className="flex items-center space-x-3">
          {authLoading ? (
            <span className="text-sm text-slate-400">Memuat...</span>
          ) : user ? (
            <>
              <span className="text-sm text-slate-300 hidden sm:block">{user.email}</span>
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;