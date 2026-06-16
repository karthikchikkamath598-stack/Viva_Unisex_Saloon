import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FiUser, FiPhone, FiLock, FiKey, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';
import VivaLogo from '../components/VivaLogo';

const AdminRegister = () => {
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '';
  const navigate = useNavigate();
  const { user, adminRegister } = useContext(AuthContext);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [secretCode, setSecretCode] = useState('');

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Redirect if user is already logged in as admin
  useEffect(() => {
    if (user && ['admin', 'owner', 'software_manager', 'software_developer'].includes(user.role)) {
      if (redirect) navigate(`/${redirect}`);
      else navigate('/admin');
    }
  }, [user, navigate, redirect]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!fullName.trim()) return setError('Full Name is required.');
    if (!mobileNumber.trim()) return setError('Mobile Number is required.');
    if (!password) return setError('Password is required.');
    if (password !== confirmPassword) return setError('Passwords do not match.');
    if (!secretCode.trim()) return setError('Secret Access Code is required.');

    const cleanMobile = mobileNumber.replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      return setError('Enter a valid 10-digit mobile number.');
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters long.');
    }

    setSubmitting(true);
    const res = await adminRegister(fullName, cleanMobile, password, role, secretCode);
    setSubmitting(false);

    if (res.success) {
      setSuccessMsg('Administrator account registered successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/admin-login');
      }, 3000);
    } else {
      setError(res.message || 'Unauthorized Registration Attempt');
    }
  };

  return (
    <div className="pt-28 min-h-screen bg-zinc-950 flex items-center justify-center px-4 pb-16">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800/80 p-8 sm:p-10 rounded-2xl shadow-xl transition-all duration-300">
        
        {/* Brand Header with official logo */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <VivaLogo
              size={90}
              className="drop-shadow-[0_0_12px_rgba(212,164,55,0.35)] hover:scale-105 transition-transform duration-300"
            />
          </div>
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold block mt-1">Admin Portal</span>
          <h2 className="text-xl font-bold text-white mt-2">Create Admin Account</h2>
        </div>

        {error && (
          <div className="bg-red-950/30 border border-red-900/40 text-red-200 p-3 rounded-lg text-xs mb-5 text-center animate-fade-in">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="bg-green-950/30 border border-green-900/40 text-green-200 p-3 rounded-lg text-xs mb-5 text-center animate-fade-in">
            {successMsg}
          </div>
        )}

        {/* REGISTRATION FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-400">Full Name</label>
            <div className="relative">
              <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-sm" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-viva-gold focus:ring-1 focus:ring-viva-gold/20 text-white text-sm rounded-lg py-2 pl-10 pr-4 outline-none transition-all duration-200"
                placeholder="David Smith"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-400">Mobile Number</label>
            <div className="relative">
              <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-sm" />
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-viva-gold focus:ring-1 focus:ring-viva-gold/20 text-white text-sm rounded-lg py-2 pl-10 pr-4 outline-none transition-all duration-200"
                placeholder="10-digit Mobile Number"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-viva-gold focus:ring-1 focus:ring-viva-gold/20 text-white text-sm rounded-lg py-2 pl-9 pr-8 outline-none transition-all duration-200"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                >
                  {showPassword ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400">Confirm Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-viva-gold focus:ring-1 focus:ring-viva-gold/20 text-white text-sm rounded-lg py-2 pl-9 pr-8 outline-none transition-all duration-200"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-400">Administrative Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-viva-gold focus:ring-1 focus:ring-viva-gold/20 text-white text-sm rounded-lg py-2 px-3 outline-none transition-all duration-200 appearance-none"
            >
              <option value="owner" className="bg-zinc-950">Owner</option>
              <option value="software_developer" className="bg-zinc-950">Software Developer</option>
              <option value="admin" className="bg-zinc-950">Admin</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-400">Secret Admin Access Code</label>
            <div className="relative">
              <FiKey className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-sm" />
              <input
                type="password"
                value={secretCode}
                onChange={(e) => setSecretCode(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-viva-gold focus:ring-1 focus:ring-viva-gold/20 text-white text-sm rounded-lg py-2 pl-10 pr-4 outline-none transition-all duration-200"
                placeholder="Secret Access Code"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 bg-viva-gold hover:bg-viva-gold/90 text-zinc-950 font-bold text-xs uppercase tracking-widest py-3 px-6 rounded-lg transition-all duration-250 flex items-center justify-center gap-2 hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100"
          >
            <span>Register Admin</span>
            <FiArrowRight />
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/admin-login" className="text-zinc-500 hover:text-viva-gold text-xs transition-colors">
            Already have an administrator account? Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;
