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
      <polyline points="22,6 12,13 2,6" />
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
      <circle cx="12" cy="13" r="4" />
    </svg>
  ),
  TaskCheck: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  Clock: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  FileText: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  Eye: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  EyeOff: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ),
  Save: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  ),
  Shield: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
};

const getInitials = (name) =>
  name ? name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "?";

const nameToHue = (name) => {
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
};

const PasswordField = ({ id, label, register, error, placeholder }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
          <Icons.Lock className="w-3.5 h-3.5" />
        </div>
        <input
          id={id}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          {...register}
          className={`
            w-full h-9 pl-9 pr-10 rounded-xl
            bg-slate-100 dark:bg-[#0f172a]/60 border
            ${error ? "border-red-500/40" : "border-slate-200 dark:border-white/[0.08]"}
            text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500
            focus:outline-none focus:bg-white dark:focus:bg-white/[0.02] focus:border-green-500/40
            transition-all duration-200
          `}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
          tabIndex={-1}
        >
          {visible ? <Icons.EyeOff className="w-3.5 h-3.5" /> : <Icons.Eye className="w-3.5 h-3.5" />}
        </button>
      </div>
      {error && <p className="text-[10px] text-red-500 dark:text-red-400 mt-0.5">{error.message}</p>}
    </div>
  );
};

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  useEffect(() => {
    if (user) {
      resetProfile({
        name: user.name || "",
        email: user.email || "",
      });
      setAvatarPreview(user.avatar || null);
    }
  }, [user, resetProfile]);

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch: watchPassword,
  } = useForm();

  const newPasswordValue = watchPassword("newPassword");

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const onProfileSubmit = async (data) => {
    setProfileSubmitting(true);
    try {
      let res;
      if (avatarFile) {
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("email", data.email);
        formData.append("avatar", avatarFile);
        res = await authService.updateProfile(formData);
      } else {
        res = await authService.updateProfile({
          name: data.name,
          email: data.email
        });
      }

      const updated = res.data?.user || res.data || res;
      if (updateUser) updateUser(updated);
      setAvatarFile(null);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setProfileSubmitting(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    setPasswordSubmitting(true);
    try {
      await authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      resetPassword();
      toast.success("Password changed successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setPasswordSubmitting(false);
    }
  };

  const hue = nameToHue(user?.name);
  const stats = [
    {
      icon: Icons.TaskCheck,
      value: user?.completedTasks ?? user?.stats?.tasksCompleted ?? 0,
      label: "Tasks Completed",
      color: "green",
    },
    {
      icon: Icons.Clock,
      value: user?.hoursLogged ?? user?.stats?.hoursLogged ?? 0,
      label: "Hours Logged",
      color: "blue",
      suffix: "h",
    },
    {
      icon: Icons.FileText,
      value: user?.reportsSubmitted ?? user?.stats?.reportsSubmitted ?? 0,
      label: "Reports Submitted",
      color: "purple",
    },
  ];

  const STAT_COLORS = {
    green:  { bg: "bg-green-500/10",  border: "border-green-200 dark:border-green-500/20",  text: "text-green-600 dark:text-green-400" },
    blue:   { bg: "bg-blue-500/10",   border: "border-blue-200 dark:border-blue-500/20",   text: "text-blue-600 dark:text-blue-400" },
    purple: { bg: "bg-purple-500/10", border: "border-purple-200 dark:border-purple-500/20", text: "text-purple-600 dark:text-purple-400" },
  };

  return (
    <div className="w-full h-full bg-transparent px-4 py-8 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      {/* Header */}
      <div className="mb-8 animate-fade-in-down">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shadow-sm">
            <Icons.User className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              My Profile
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage account layouts and parameter credentials
            </p>
          </div>
        </div>
      </div>

      {/* Profile Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 animate-fade-in-up">
        {stats.map((stat, i) => {
          const c = STAT_COLORS[stat.color];
          return (
            <div key={i} className="group relative p-4 rounded-xl bg-transparent border border-slate-200 dark:border-white/[0.06] shadow-sm transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${c.bg} ${c.border} border flex items-center justify-center`}>
                  <stat.icon className={`w-4 h-4 ${c.text}`} />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900 dark:text-white tabular-nums leading-none mb-0.5">
                    {stat.value}{stat.suffix || ""}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column Layout Box */}
        <div className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <div className="p-6 rounded-xl bg-transparent border border-slate-200 dark:border-white/[0.06] shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="relative group mb-4">
                {avatarPreview ? (
                  <img src={avatarPreview} alt={user?.name} className="w-20 h-20 rounded-2xl object-cover ring-2 ring-green-500/20" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center ring-2 ring-green-500/20" style={{ background: `linear-gradient(135deg, hsl(${hue}, 60%, 45%), hsl(${hue + 30}, 50%, 35%))` }}>
                    <span className="text-xl font-bold text-white">{getInitials(user?.name)}</span>
                  </div>
                )}
                <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                  <Icons.Camera className="w-5 h-5 text-white" />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </div>

              <h2 className="text-base font-bold text-slate-900 dark:text-white">{user?.name}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{user?.email}</p>
              <span className="inline-flex items-center gap-1 mt-3 rounded-full bg-green-500/10 border border-green-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-green-600 dark:text-green-400 capitalize">
                {user?.role === "ADMIN" || user?.role === "TEAM LEADER" ? "Team Leader" : "Team Member"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column Layout Boxes */}
        <div className="lg:col-span-3 space-y-6">
          <div className="p-5 rounded-xl bg-transparent border border-slate-200 dark:border-white/[0.06] shadow-sm animate-fade-in-up" style={{ animationDelay: "150ms" }}>
            <div className="flex items-center gap-2 mb-4">
              <Icons.User className="w-4 h-4 text-green-600 dark:text-green-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Edit Profile</h3>
            </div>

            <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-3">
              <div>
                <label htmlFor="profile-name" className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"><Icons.User className="w-3.5 h-3.5" /></div>
                  <input id="profile-name" type="text" {...registerProfile("name", { required: "Name is required" })} className="w-full h-9 pl-9 pr-4 rounded-xl bg-slate-100 dark:bg-[#0f172a]/60 border border-slate-200 dark:border-white/[0.08] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:bg-white dark:focus:bg-white/[0.02]" />
                </div>
              </div>

              <div>
                <label htmlFor="profile-email" className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"><Icons.Mail className="w-3.5 h-3.5" /></div>
                  <input id="profile-email" type="email" {...registerProfile("email", { required: "Email is required" })} className="w-full h-9 pl-9 pr-4 rounded-xl bg-slate-100 dark:bg-[#0f172a]/60 border border-slate-200 dark:border-white/[0.08] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:bg-white dark:focus:bg-white/[0.02]" />
                </div>
              </div>

              <button type="submit" disabled={profileSubmitting} className="w-full h-8 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-xs font-bold text-white shadow-sm hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-1.5">
                {profileSubmitting ? <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <Icons.Save className="w-3.5 h-3.5" />}
                Save Changes
              </button>
            </form>
          </div>

          <div className="p-5 rounded-xl bg-transparent border border-slate-200 dark:border-white/[0.06] shadow-sm animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <div className="flex items-center gap-2 mb-4">
              <Icons.Shield className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Change Password</h3>
            </div>

            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-3">
              <PasswordField id="current-password" label="Current Password" placeholder="Enter current password" register={registerPassword("currentPassword", { required: "Required" })} error={passwordErrors.currentPassword} />
              <PasswordField id="new-password" label="New Password" placeholder="Enter new password" register={registerPassword("newPassword", { required: "Required", minLength: { value: 6, message: "Min 6 chars" } })} error={passwordErrors.newPassword} />
              <PasswordField id="confirm-password" label="Confirm New Password" placeholder="Confirm new password" register={registerPassword("confirmPassword", { required: "Required", validate: (val) => val === newPasswordValue || "Mismatch" })} error={passwordErrors.confirmPassword} />

              <button type="submit" disabled={passwordSubmitting} className="w-full h-8 rounded-lg bg-slate-100 dark:bg-[#0f172a]/60 border border-slate-200 dark:border-white/[0.08] text-xs font-bold text-slate-700 dark:text-white hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 transition-all flex items-center justify-center gap-1.5">
                {passwordSubmitting ? <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 dark:border-white/30 border-t-slate-600 dark:border-t-white animate-spin" /> : <Icons.Lock className="w-3.5 h-3.5" />}
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