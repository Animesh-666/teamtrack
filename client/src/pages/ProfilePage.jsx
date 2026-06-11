import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import useAuth from "../hooks/useAuth";
import authService from "../services/authService";

const Icons = {
  User: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Mail: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    </svg>
  ),
  Lock: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  Camera: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    </svg>
  ),
  Save: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    </svg>
  ),
};

const STAT_COLORS = {
  green:  { bg: "bg-green-500/10",  border: "border-green-200 dark:border-green-500/20",  text: "text-green-600 dark:text-green-400" },
  blue:   { bg: "bg-blue-500/10",   border: "border-blue-200 dark:border-blue-500/20",   text: "text-blue-600 dark:text-blue-400" },
  purple: { bg: "bg-purple-500/10", border: "border-purple-200 dark:border-purple-500/20", text: "text-purple-600 dark:text-purple-400" },
};

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const { register: registerProfile, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors } } = useForm({
    defaultValues: { name: user?.name || "", email: user?.email || "" }
  });

  const { register: registerPassword, handleSubmit: handlePasswordSubmit, formState: { errors: passwordErrors }, reset: resetPassword } = useForm();

  const onProfileSubmit = async (data) => {
    setProfileSubmitting(true);
    try {
      const res = await authService.updateProfile(data);
      if (updateUser) updateUser(res.data?.user || res.data);
      toast.success("Profile updated");
    } catch { toast.error("Failed validation"); } finally { setProfileSubmitting(false); }
  };

  const onPasswordSubmit = async (data) => {
    setPasswordSubmitting(true);
    try {
      await authService.changePassword(data);
      resetPassword();
      toast.success("Password verified & updated");
    } catch { toast.error("Error updating logs"); } finally { setPasswordSubmitting(false); }
  };

  return (
    <div className="w-full h-full bg-transparent px-4 py-8 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      <div className="mb-8 animate-fade-in-down">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shadow-lg">
            <Icons.User className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">My Profile</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage account layouts and parameter credentials</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-transparent border border-slate-200 dark:border-white/[0.06] p-6 transition-colors duration-300">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-2xl font-bold text-white mb-4">
              {user?.name?.slice(0,2).toUpperCase()}
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">{user?.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{user?.role}</p>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="p-6 rounded-2xl bg-transparent border border-slate-200 dark:border-white/[0.06] shadow-sm transition-colors duration-300">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Edit Profile</h3>
            <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Name</label>
                <input type="text" {...registerProfile("name", { required: true })} className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-[#0f172a]/60 border border-slate-200 dark:border-white/[0.08] text-slate-800 dark:text-slate-200" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Email</label>
                <input type="email" {...registerProfile("email", { required: true })} className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-[#0f172a]/60 border border-slate-200 dark:border-white/[0.08] text-slate-800 dark:text-slate-200" />
              </div>
              <button type="submit" disabled={profileSubmitting} className="w-full h-11 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl font-bold text-white shadow-md">
                Save Changes
              </button>
            </form>
          </div>

          <div className="p-6 rounded-2xl bg-transparent border border-slate-200 dark:border-white/[0.06] shadow-sm transition-colors duration-300">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Security Access</h3>
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Current Password</label>
                <input type="password" {...registerPassword("currentPassword", { required: true })} className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-[#0f172a]/60 border border-slate-200 dark:border-white/[0.08] text-slate-800 dark:text-slate-200" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">New Password</label>
                <input type="password" {...registerPassword("newPassword", { required: true })} className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-[#0f172a]/60 border border-slate-200 dark:border-white/[0.08] text-slate-800 dark:text-slate-200" />
              </div>
              <button type="submit" disabled={passwordSubmitting} className="w-full h-11 bg-slate-100 dark:bg-[#0f172a]/60 border border-slate-200 dark:border-white/[0.08] rounded-xl text-slate-800 dark:text-white font-bold">
                Update Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;