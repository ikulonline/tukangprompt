import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
// SignUpWithPasswordCredentials is still needed for the signUp function call, but not directly for form state
import { SignUpWithPasswordCredentials } from '@supabase/supabase-js';

// Explicitly define the form input structure
interface SignupPageFormInputs {
  email: string;
  password: string;
  confirmPassword: string; 
}

const SignupPage: React.FC = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<SignupPageFormInputs>();
  const { signUp, isLoading: authLoading, error: authError } = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState<boolean>(false);

  const password = watch("password");

  const onSubmit: SubmitHandler<SignupPageFormInputs> = async (data) => {
    setFormError(null);
    setSignupSuccess(false);
    // Construct the object for signUp from our explicit form data type
    const credentials: SignUpWithPasswordCredentials = { email: data.email, password: data.password };
    const { error, user } = await signUp(credentials); 
    if (error) {
      setFormError(error.message || "Gagal melakukan pendaftaran. Coba lagi nanti.");
    } else {
        if (user && user.identities && user.identities.length === 0) {
            setFormError("Pendaftaran berhasil, namun ada kendala dalam konfirmasi. Silakan coba login atau hubungi support.");
        } else if (user?.aud === 'authenticated') { 
            setSignupSuccess(true); 
            setTimeout(() => navigate('/login'), 3000); 
        } else { 
            setSignupSuccess(true);
        }
    }
  };

  if (signupSuccess) {
    return (
      <div className="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-slate-800 py-8 px-4 shadow-xl ring-1 ring-slate-700 sm:rounded-lg sm:px-10 text-center">
            <h2 className="text-2xl font-semibold text-green-400 mb-4">Pendaftaran Berhasil!</h2>
            <p className="text-slate-300 mb-6">
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
        <h2 className="mt-6 text-center text-3xl font-extrabold text-sky-400">
          Buat Akun Baru
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Sudah punya akun?{' '}
          <Link to="/login" className="font-medium text-sky-500 hover:text-sky-400">
            Login di sini
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800 py-8 px-4 shadow-xl ring-1 ring-slate-700 sm:rounded-lg sm:px-10">
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
              error={errors.email?.message} // Now type-safe
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
                  value === password || "Password tidak cocok"
              })}
              error={errors.confirmPassword?.message} // Now type-safe
            />
            
            {(authError?.message || formError) && (
              <p className="text-sm text-red-400 text-center">{authError?.message || formError}</p>
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