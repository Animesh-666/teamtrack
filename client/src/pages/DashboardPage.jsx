import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import MemberDashboard from '../components/dashboard/MemberDashboard';

const DashboardPage = () => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const greeting = useMemo(() => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, [currentTime]);

  const formattedDate = useMemo(() => {
    return currentTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [currentTime]);

  const formattedTime = useMemo(() => {
    return currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [currentTime]);

  // 🚀 FIXED: Robust case-insensitive validation handling both 'ADMIN' and 'TEAM LEADER' database structures
  const isAdmin = useMemo(() => {
    const userRole = (user?.role || '').trim().toUpperCase();
    return userRole === 'ADMIN' || userRole === 'TEAM LEADER';
  }, [user]);

  return (
    <div className="min-h-screen bg-[#0f172a] px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="animate-fade-in-down mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          {/* Greeting Block */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {greeting},{' '}
              <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                {user?.name || 'User'}
              </span>
              <span className="ml-1 inline-block origin-[70%_70%] animate-bounce">👋</span>
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Here&apos;s what&apos;s happening with your projects today.
            </p>
          </div>

          {/* Date & Time Block */}
          <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-[#1e293b]/60 px-5 py-3 backdrop-blur-xl">
            <svg
              className="h-5 w-5 text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-white">{formattedDate}</p>
              <p className="text-xs text-slate-400">{formattedTime}</p>
            </div>
          </div>
        </div>

        {/* Role Badge */}
        <div className="mt-4">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
              isAdmin
                ? 'border border-amber-500/20 bg-amber-500/10 text-amber-400'
                : 'border border-green-500/20 bg-green-500/10 text-green-400'
            }`}
          >
            {isAdmin ? (
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                />
              </svg>
            ) : (
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
            )}
            {isAdmin ? 'Admin Dashboard' : 'Member Dashboard'}
          </span>
        </div>
      </div>

      <div className="mb-8 h-px bg-gradient-to-r from-transparent via-green-500/20 to-transparent" />

      <div className="animate-fade-in-up">
        {isAdmin ? <AdminDashboard /> : <MemberDashboard />}
      </div>
    </div>
  );
};

export default DashboardPage;