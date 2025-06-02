import React from 'react';
import { useAuth } from '../hooks/useAuth';

const AdminDashboardPage: React.FC = () => {
  const { profile } = useAuth();

  return (
    <div className="bg-white dark:bg-slate-800 shadow-xl ring-1 ring-slate-200 dark:ring-slate-700 rounded-lg p-6 sm:p-8">
      <h1 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-6">
        Admin Dashboard
      </h1>
      {profile && (
        <p className="text-lg text-slate-700 dark:text-slate-300">
          Selamat datang, Admin <span className="font-semibold text-red-500 dark:text-red-300">{profile.full_name || profile.id}</span>!
        </p>
      )}
      <p className="text-slate-600 dark:text-slate-400 mt-4">
        Ini adalah area khusus untuk administrasi aplikasi TukangPrompt.
      </p>
      <p className="text-slate-600 dark:text-slate-400 mt-2">
        Fitur-fitur seperti manajemen pengguna, statistik, dan lainnya akan ditambahkan di sini.
      </p>
    </div>
  );
};

export default AdminDashboardPage;
