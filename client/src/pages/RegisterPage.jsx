import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api'; 
import ThemeToggle from '../components/common/ThemeToggle';

const RegisterPage = () => {
  const navigate = useNavigate();
  // State variables for toggling password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'member',
    },
  });

  const passwordValue = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const { confirmPassword, ...registerData } = data;
      
      const payload = {
        ...registerData,
        role: registerData.role.toUpperCase()
      };

      await api.post('/auth/register', payload);
      
      toast.success('Account created successfully! Welcome aboard.', {
        icon: '🎉',
        style: {
          borderRadius: '12px',
          background: '#1e293b',
          color: '#f1f5f9',
          border: '1px solid rgba(74, 222, 128, 0.2)',
        },
      });
      navigate('/login'); 
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Registration failed. Please try again.', {
        style: {
          borderRadius: '12px',
          background: '#1e293b',
          color: '#f1f5f9',
          border: '1px solid rgba(239, 68, 68, 0.2)',
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0f172a] overflow-hidden py-8">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/20 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-4 animate-fade-in-up">
        <div className="p-[1px] rounded-2xl bg-gradient-to-b from-blue-400/30 via-emerald-500/10 to-transparent">
          <div className="bg-[#1e293b]/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl shadow-black/20">
            <div className="flex flex-col items-center mb-8">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Team<span className="text-blue-400">Track</span>
              </h1>
              <p className="text-slate-400 text-sm mt-1">Create your account</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full px-4 py-2.5 bg-[#0f172a]/60 border border-slate-600/50 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  {...register('name', { required: 'Full name is required' })}
                />
                {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 bg-[#0f172a]/60 border border-slate-600/50 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  {...register('email', { required: 'Email is required' })}
                />
                {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Role</label>
                <select
                  className="w-full px-4 py-2.5 bg-[#0f172a]/60 border border-slate-600/50 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  {...register('role', { required: 'Please select a role' })}
                >
                  <option value="member">Team Member</option>
                  <option value="admin">Team Leader</option>
                </select>
              </div>

              {/* Password Field with Eye Toggle */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 pr-10 bg-[#0f172a]/60 border border-slate-600/50 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    {...register('password', { required: 'Password is required' })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-blue-400 transition-colors"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field with Eye Toggle */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 pr-10 bg-[#0f172a]/60 border border-slate-600/50 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    {...register('confirmPassword', { 
                      required: 'Please confirm password',
                      validate: (val) => val === passwordValue || 'Passwords do not match'
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-blue-400 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-400 mt-1">{errors.confirmPassword.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/20 transition-all active:scale-[0.98]"
              >
                {isLoading ? 'Creating...' : 'Create Account'}
              </button>
            </form>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-slate-700/50" />
              <span className="text-xs text-slate-500 uppercase tracking-wider">Already a member?</span>
              <div className="flex-1 h-px bg-slate-700/50" />
            </div>

            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200 group"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform duration-200"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                Sign in to your account
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;