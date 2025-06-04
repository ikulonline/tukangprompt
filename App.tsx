
import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './src/components/Navbar';
import HomePage from './src/pages/HomePage';
import LoginPage from './src/pages/LoginPage';
import SignupPage from './src/pages/SignupPage';
import DashboardPage from './src/pages/DashboardPage';
import ProtectedRoute from './src/components/ProtectedRoute';
import AdminProtectedRoute from './src/components/AdminProtectedRoute';
import AdminDashboardPage from './src/pages/AdminDashboardPage';
import MyConfigsPage from './src/pages/MyConfigsPage'; // BARU
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider } from './src/contexts/ThemeContext';

const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <footer className="py-4 text-center text-slate-500 dark:text-slate-400 text-sm">
        &copy; {new Date().getFullYear()} TukangPrompt. Dibangun dengan semangat & kode.
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            {/* BARU: Rute untuk Konfigurasi Saya */}
            <Route 
              path="/my-configs"
              element={
                <ProtectedRoute>
                  <MyConfigsPage />
                </ProtectedRoute>
              }
            />
            {/* Admin Route */}
            <Route 
              path="/admin/dashboard"
              element={
                <AdminProtectedRoute>
                  <AdminDashboardPage />
                </AdminProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
