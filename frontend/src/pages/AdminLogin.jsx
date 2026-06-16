import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FiPhone, FiLock, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';
import VivaLogo from '../components/VivaLogo';
import AccessRestricted from '../components/AccessRestricted';

const AdminLogin = () => {
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '';
  const navigate = useNavigate();
  const { user, adminLogin, logout } = useContext(AuthContext);

  // Form Fields
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // UI States
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Mobile device check (done after all hooks - never before)
  const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 1024;

  // Redirect if user is already logged in as admin
  useEffect(() => {
    if (user) {
      if (['admin', 'owner', 'software_manager', 'software_developer'].includes(user.role)) {
        if (redirect) navigate(`/${redirect}`);
        else navigate('/admin');
      } else {
        setError('Access denied. Only administrators are permitted to access this portal.');
        logout();
      }
    }
  }, [user, navigate, redirect, logout]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const res = await adminLogin(mobileNumber, password, false);
    setSubmitting(false);

    if (!res.success) {
      setError(res.message || 'Invalid administrator credentials.');
    }
  };

  // Block mobile/tablet — show restricted page (after all hooks)
  if (isMobileDevice) {
    return <AccessRestricted message="Admin Portal is only accessible on a desktop or laptop computer." preventRedirect={true} />;
  }

  return (
    <div className="pt-28 min-h-screen bg-zinc-950 flex items-center justify-center px-4 pb-16">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800/80 p-8 sm:p-10 rounded-2xl shadow-xl transition-all duration-300">
        
        {/* Brand Header with official logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <VivaLogo
              size={90}
              className="drop-shadow-[0_0_12px_rgba(212,164,55,0.35)] hover:scale-105 transition-transform duration-300"
            />
          </div>
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold block mt-1">Admin Portal</span>
        </div>

        {error && (
          <div className="bg-red-950/30 border border-red-900/40 text-red-200 p-3 rounded-lg text-xs mb-5 text-center animate-fade-in">
            {error}
          </div>
        )}

        {/* LOGIN FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-400">Admin Mobile Number</label>
            <div className="relative">
              <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-sm" />
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-viva-gold focus:ring-1 focus:ring-viva-gold/20 text-white text-sm rounded-lg py-2.5 pl-10 pr-4 outline-none transition-all duration-200"
                placeholder="Mobile Number"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-400">Password</label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-sm" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-viva-gold focus:ring-1 focus:ring-viva-gold/20 text-white text-sm rounded-lg py-2.5 pl-10 pr-10 outline-none transition-all duration-200"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
              >
                {showPassword ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-viva-gold hover:bg-viva-gold/90 text-zinc-950 font-bold text-xs uppercase tracking-widest py-3 px-6 rounded-lg transition-all duration-250 flex items-center justify-center gap-2 hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100"
          >
            <span>Authorized Sign In</span>
            <FiArrowRight />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
