import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { SignUpWithPasswordCredentials } from '@supabase/supabase-js';

interface SignupPageFormInputs {
  email: string;
  password: string;
  confirmPassword: string; 
}

const SignupPage: React.FC = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<SignupPageFormInputs>({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: ''
    }
  });
  const { signUp, isLoading: authLoading } = useAuth(); // Removed authError from here, will use formError
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState<boolean>(false);

  const passwordValue = watch("password"); // Renamed to avoid conflict

  const onSubmit: SubmitHandler<SignupPageFormInputs> = async (data) => {
    setFormError(null);
    setSignupSuccess(false);
    const credentials: SignUpWithPasswordCredentials = { email: data.email, password: data.password };
    const { error, user } = await signUp(credentials); 
    if (error) {
      setFormError(error.message || "Gagal melakukan pendaftaran. Coba lagi nanti.");
    } else {
        // This specific check for user.identities might be too Supabase-specific for general UI
        // Typically, if no error, we assume success or Supabase handles confirmation flow.
        setSignupSuccess(true); 
        // No automatic redirect, let the success message guide the user.
    }
  };

  if (signupSuccess) {
    return (
      <div className="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white dark:bg-slate-800 py-8 px-4 shadow-xl ring-1 ring-slate-200 dark:ring-slate-700 sm:rounded-lg sm:px-10 text-center">
            <h2 className="text-2xl font-semibold text-green-500 dark:text-green-400 mb-4">Pendaftaran Berhasil!</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              Silakan periksa email Anda untuk link konfirmasi. Setelah itu, Anda bisa login.
            </p>
            <Link to="/login">
              <Button variant="primary">Ke Halaman Login</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-sky-500 dark:text-sky-400">
          Buat Akun Baru
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
          Sudah punya akun?{' '}
          <Link to="/login" className="font-medium text-sky-600 hover:text-sky-500 dark:text-sky-500 dark:hover:text-sky-400">
            Login di sini
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-800 py-8 px-4 shadow-xl ring-1 ring-slate-200 dark:ring-slate-700 sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Alamat Email"
              type="email"
              {...register("email", { 
                required: "Email tidak boleh kosong",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Format email tidak valid"
                }
              })}
              error={errors.email?.message}
            />
            <Input
              label="Password"
              type="password"
              {...register("password", { 
                required: "Password tidak boleh kosong",
                minLength: {
                  value: 6,
                  message: "Password minimal 6 karakter"
                }
              })}
              error={errors.password?.message}
            />
             <Input
              label="Konfirmasi Password"
              type="password"
              {...register("confirmPassword", { 
                required: "Konfirmasi password tidak boleh kosong",
                validate: value =>
                  value === passwordValue || "Password tidak cocok" // Use watched passwordValue
              })}
              error={errors.confirmPassword?.message}
            />
            
            {formError && ( // Display only formError set by submission logic
              <p className="text-sm text-red-600 dark:text-red-400 text-center">{formError}</p>
            )}

            <div>
              <Button type="submit" variant="primary" className="w-full" isLoading={authLoading}>
                Daftar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;