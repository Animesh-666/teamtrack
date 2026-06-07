import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api'; // Correct path to your api client

const RegisterPage = () => {
  const navigate = useNavigate();
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
      
      // Prepare payload
      const payload = {
        ...registerData,
        role: registerData.role.toUpperCase()
      };

      // Direct API call using the corrected path
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
      navigate('/login'); // Redirect to login after success
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
      {/* ... (Keep your existing background divs here) ... */}

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
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full px-4 py-2.5 bg-[#0f172a]/60 border border-slate-600/50 rounded-xl text-white text-sm"
                  {...register('name', { required: 'Full name is required' })}
                />
                {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 bg-[#0f172a]/60 border border-slate-600/50 rounded-xl text-white text-sm"
                  {...register('email', { required: 'Email is required' })}
                />
                {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Role</label>
                <select
                  className="w-full px-4 py-2.5 bg-[#0f172a]/60 border border-slate-600/50 rounded-xl text-white text-sm"
                  {...register('role', { required: 'Please select a role' })}
                >
                  <option value="member">Team Member</option>
                  <option value="admin">Team Leader</option>
                </select>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-[#0f172a]/60 border border-slate-600/50 rounded-xl text-white text-sm"
                  {...register('password', { required: 'Password is required' })}
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm Password</label>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-[#0f172a]/60 border border-slate-600/50 rounded-xl text-white text-sm"
                  {...register('confirmPassword', { 
                    required: 'Please confirm password',
                    validate: (val) => val === passwordValue || 'Passwords do not match'
                  })}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-emerald-500 text-white font-semibold rounded-xl"
              >
                {isLoading ? 'Creating...' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;