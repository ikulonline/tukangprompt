import React from 'react';
import { useAuth } from '../hooks/useAuth';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="bg-slate-800 shadow-xl ring-1 ring-slate-700 rounded-lg p-6 sm:p-8">
      <h1 className="text-3xl font-bold text-sky-400 mb-6">
        Dashboard PromptMaster AI
      </h1>
      {user && (
        <p className="text-lg text-slate-300">
          Selamat datang kembali, <span className="font-semibold text-sky-300">{user.email}</span>!
        </p>
      )}
      <p className="text-slate-400 mt-4">
        Ini adalah area dashboard Anda. Fitur-fitur untuk membuat prompt akan ditambahkan di sini pada tahap berikutnya.
      </p>
    </div>
  );
};

export default DashboardPage;