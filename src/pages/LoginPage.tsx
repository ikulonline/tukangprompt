import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { SignInWithPasswordCredentials } from '@supabase/supabase-js';

// Explicitly define the form input structure
interface LoginFormInputs {
  email: string;
  password: string;
}

const GoogleIcon: React.FC = () => (
  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5 mr-2">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
    <path fill="none" d="M0 0h48v48H0z"></path>
  </svg>
);


const LoginPage: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>({
    mode: 'onChange', // DIAGNOSTIC: Validate on change to test error clearing
    defaultValues: { 
      email: '',
      password: ''
    }
  });
  const { signIn, signInWithGoogle, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formError, setFormError] = useState<string | null>(null);

  const from = location.state?.from?.pathname || '/dashboard';

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    setFormError(null); 
    const { error } = await signIn(data as SignInWithPasswordCredentials); 
    if (error) {
      if (error.message && error.message.toLowerCase().includes('invalid login credentials')) {
        setFormError("Kombinasi email dan password salah. Silakan periksa kembali.");
      } else if (error.message && error.message.toLowerCase().includes('email not confirmed')) {
        setFormError("Email Anda belum dikonfirmasi. Silakan periksa email Anda untuk link konfirmasi.");
      } else {
        setFormError(error.message || "Terjadi kesalahan saat login. Silakan coba lagi nanti.");
      }
    } else {
      navigate(from, { replace: true });
    }
  };

  const handleGoogleLogin = async () => {
    setFormError(null);
    const { error } = await signInWithGoogle();
    if (error) {
      setFormError(error.message || "Gagal login dengan Google. Coba lagi nanti.");
    }
  };

  return (
    <div className="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-sky-400">
          Login ke Akun Anda
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Atau{' '}
          <Link to="/signup" className="font-medium text-sky-500 hover:text-sky-400">
            buat akun baru
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800 py-8 px-4 shadow-xl ring-1 ring-slate-700 sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Alamat Email"
              type="email"
              {...register("email", { required: "Email tidak boleh kosong" })}
              error={errors.email?.message}
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              {...register("password", { required: "Password tidak boleh kosong" })}
              error={errors.password?.message}
              autoComplete="current-password"
            />
            
            {formError && (
              <p className="text-sm text-red-400 text-center py-2">{formError}</p>
            )}

            <div>
              <Button type="submit" variant="primary" className="w-full" isLoading={authLoading}>
                Login
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-800 text-slate-400">
                  Atau lanjutkan dengan
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Button 
                variant="outline" 
                className="w-full bg-slate-700 hover:bg-slate-600 border-slate-500" 
                onClick={handleGoogleLogin}
                isLoading={authLoading} 
                type="button"
              >
                <GoogleIcon />
                Login dengan Google
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;