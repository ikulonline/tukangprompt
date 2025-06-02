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

const LoginPage: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>();
  const { signIn, isLoading: authLoading, error: authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formError, setFormError] = useState<string | null>(null);

  const from = location.state?.from?.pathname || '/dashboard';

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    setFormError(null);
    // 'data' is now LoginFormInputs, which is compatible with SignInWithPasswordCredentials for email/password sign in
    const { error } = await signIn(data as SignInWithPasswordCredentials); 
    if (error) {
      setFormError(error.message || "Gagal melakukan login. Periksa kembali email dan password Anda.");
    } else {
      navigate(from, { replace: true });
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
              error={errors.email?.message} // Now type-safe
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              {...register("password", { required: "Password tidak boleh kosong" })}
              error={errors.password?.message}
              autoComplete="current-password"
            />
            
            {(authError?.message || formError) && (
              <p className="text-sm text-red-400 text-center">{authError?.message || formError}</p>
            )}

            <div>
              <Button type="submit" variant="primary" className="w-full" isLoading={authLoading}>
                Login
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;