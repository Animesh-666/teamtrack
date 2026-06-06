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
      <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
          <Icons.Lock className="w-4 h-4" />
        </div>
        <input
          id={id}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          {...register}
          className={`
            w-full h-11 pl-10 pr-11 rounded-xl
            bg-[#0f172a]/60 border
            ${error ? "border-red-500/40" : "border-white/[0.08]"}
            text-sm text-slate-200 placeholder-slate-500
            focus:outline-none focus:border-green-500/40 focus:ring-1 focus:ring-green-500/20
            transition-all duration-200
          `}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
          tabIndex={-1}
        >
          {visible ? <Icons.EyeOff className="w-4 h-4" /> : <Icons.Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-red-400 mt-1">{error.message}</p>}
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
    green:  { bg: "bg-green-500/10",  border: "border-green-500/20",  text: "text-green-400",  glow: "shadow-green-500/10"  },
    blue:   { bg: "bg-blue-500/10",   border: "border-blue-500/20",   text: "text-blue-400",   glow: "shadow-blue-500/10"   },
    purple: { bg: "bg-purple-500/10", border: "border-purple-500/20", text: "text-purple-400", glow: "shadow-purple-500/10" },
  };

  return (
    <div className="min-h-screen bg-[#0f172a] px-4 sm:px-6 lg:px-8 py-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-fade-in-down">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shadow-lg shadow-green-500/10">
            <Icons.User className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              My Profile
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Manage your account settings and preferences
            </p>
          </div>
        </div>
      </div>

      {/* Profile Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 animate-fade-in-up">
        {stats.map((stat, i) => {
          const c = STAT_COLORS[stat.color];
          return (
            <div
              key={i}
              className={`
                group relative p-5 rounded-2xl
                bg-[#1e293b]/60 backdrop-blur-xl
                border border-white/[0.06]
                shadow-lg ${c.glow}
                hover:shadow-xl hover:border-white/[0.1]
                hover:-translate-y-0.5
                transition-all duration-300
              `}
            >
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl ${c.bg} ${c.border} border flex items-center justify-center shadow-lg ${c.glow}`}>
                  <stat.icon className={`w-5 h-5 ${c.text}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white tabular-nums">
                    {stat.value}{stat.suffix || ""}
                  </p>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                    {stat.label}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <div className="p-6 rounded-2xl bg-[#1e293b]/60 backdrop-blur-xl border border-white/[0.06] shadow-xl">
            <div className="flex flex-col items-center text-center">
              <div className="relative group mb-4">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt={user?.name}
                    className="w-24 h-24 rounded-2xl object-cover ring-3 ring-green-500/20 shadow-xl shadow-green-500/10"
                  />
                ) : (
                  <div
                    className="w-24 h-24 rounded-2xl flex items-center justify-center ring-3 ring-green-500/20 shadow-xl shadow-green-500/10"
                    style={{
                      background: `linear-gradient(135deg, hsl(${hue}, 60%, 45%), hsl(${hue + 30}, 50%, 35%))`,
                    }}
                  >
                    <span className="text-2xl font-bold text-white">
                      {getInitials(user?.name)}
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="
                    absolute inset-0 rounded-2xl
                    bg-black/50 flex items-center justify-center
                    opacity-0 group-hover:opacity-100
                    transition-opacity duration-200 cursor-pointer
                  "
                >
                  <Icons.Camera className="w-6 h-6 text-white" />
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>

              <h2 className="text-lg font-bold text-white">{user?.name}</h2>
              <p className="text-sm text-slate-400 mt-0.5">{user?.email}</p>
              <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-xs font-semibold text-green-400 capitalize">
                {user?.role === "admin" || user?.role === "TEAM LEADER" ? "Team Leader" : "Team Member"}
              </span>

              {user?.createdAt && (
                <p className="text-[11px] text-slate-500 mt-4">
                  Member since{" "}
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-3 space-y-6">
          <div
            className="p-6 rounded-2xl bg-[#1e293b]/60 backdrop-blur-xl border border-white/[0.06] shadow-xl animate-fade-in-up"
            style={{ animationDelay: "150ms" }}
          >
            <div className="flex items-center gap-2 mb-6">
              <Icons.User className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-bold text-white">Edit Profile</h3>
            </div>

            <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
              <div>
                <label htmlFor="profile-name" className="block text-sm font-medium text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                    <Icons.User className="w-4 h-4" />
                  </div>
                  <input
                    id="profile-name"
                    type="text"
                    placeholder="Enter your name"
                    {...registerProfile("name", {
                      required: "Name is required",
                      minLength: { value: 2, message: "Name must be at least 2 characters" },
                    })}
                    className={`
                      w-full h-11 pl-10 pr-4 rounded-xl
                      bg-[#0f172a]/60 border
                      ${profileErrors.name ? "border-red-500/40" : "border-white/[0.08]"}
                      text-sm text-slate-200 placeholder-slate-500
                      focus:outline-none focus:border-green-500/40 focus:ring-1 focus:ring-green-500/20
                      transition-all duration-200
                    `}
                  />
                </div>
                {profileErrors.name && (
                  <p className="text-xs text-red-400 mt-1">{profileErrors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="profile-email" className="block text-sm font-medium text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                    <Icons.Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="profile-email"
                    type="email"
                    placeholder="Enter your email"
                    {...registerProfile("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                    className={`
                      w-full h-11 pl-10 pr-4 rounded-xl
                      bg-[#0f172a]/60 border
                      ${profileErrors.email ? "border-red-500/40" : "border-white/[0.08]"}
                      text-sm text-slate-200 placeholder-slate-500
                      focus:outline-none focus:border-green-500/40 focus:ring-1 focus:ring-green-500/20
                      transition-all duration-200
                    `}
                  />
                </div>
                {profileErrors.email && (
                  <p className="text-xs text-red-400 mt-1">{profileErrors.email.message}</p>
                )}
              </div>

              {avatarFile && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/5 border border-green-500/10">
                  <Icons.Camera className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span className="text-xs text-green-400 truncate">{avatarFile.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarFile(null);
                      setAvatarPreview(user?.avatar || null);
                    }}
                    className="ml-auto text-xs text-slate-400 hover:text-red-400 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={profileSubmitting}
                className="
                  w-full h-11 rounded-xl
                  bg-gradient-to-r from-green-500 to-emerald-600
                  text-sm font-semibold text-white
                  shadow-lg shadow-green-500/25
                  hover:shadow-xl hover:shadow-green-500/30
                  hover:-translate-y-0.5
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
                  transition-all duration-200
                  flex items-center justify-center gap-2
                "
              >
                {profileSubmitting ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <Icons.Save className="w-4 h-4" />
                )}
                {profileSubmitting ? "Saving…" : "Save Changes"}
              </button>
            </form>
          </div>

          <div
            className="p-6 rounded-2xl bg-[#1e293b]/60 backdrop-blur-xl border border-white/[0.06] shadow-xl animate-fade-in-up"
            style={{ animationDelay: "200ms" }}
          >
            <div className="flex items-center gap-2 mb-6">
              <Icons.Shield className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-bold text-white">Change Password</h3>
            </div>

            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
              <PasswordField
                id="current-password"
                label="Current Password"
                placeholder="Enter current password"
                register={registerPassword("currentPassword", {
                  required: "Current password is required",
                })}
                error={passwordErrors.currentPassword}
              />

              <PasswordField
                id="new-password"
                label="New Password"
                placeholder="Enter new password"
                register={registerPassword("newPassword", {
                  required: "New password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                error={passwordErrors.newPassword}
              />

              <PasswordField
                id="confirm-password"
                label="Confirm New Password"
                placeholder="Confirm new password"
                register={registerPassword("confirmPassword", {
                  required: "Please confirm your new password",
                  validate: (value) =>
                    value === newPasswordValue || "Passwords do not match",
                })}
                error={passwordErrors.confirmPassword}
              />

              <button
                type="submit"
                disabled={passwordSubmitting}
                className="
                  w-full h-11 rounded-xl
                  bg-[#0f172a]/60 border border-white/[0.08]
                  text-sm font-semibold text-white
                  hover:bg-amber-500/10 hover:border-amber-500/20 hover:text-amber-400
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-200
                  flex items-center justify-center gap-2
                "
              >
                {passwordSubmitting ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <Icons.Lock className="w-4 h-4" />
                )}
                {passwordSubmitting ? "Updating…" : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;