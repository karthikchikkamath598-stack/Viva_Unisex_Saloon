import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FiMail, FiLock, FiUser, FiPhone, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';

const Signup = () => {
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '';
  const navigate = useNavigate();
  const { user, register } = useContext(AuthContext);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      if (redirect) navigate(`/${redirect}`);
      else navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    }
  }, [user, navigate, redirect]);

  const validatePassword = (pwd) => {
    const minLength = pwd.length >= 8;
    const hasUppercase = /[A-Z]/.test(pwd);
    const hasLowercase = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[^A-Za-z0-9]/.test(pwd);

    if (!minLength) return 'Password must be at least 8 characters long.';
    if (!hasUppercase) return 'Password must contain at least one uppercase letter.';
    if (!hasLowercase) return 'Password must contain at least one lowercase letter.';
    if (!hasNumber) return 'Password must contain at least one number.';
    if (!hasSpecial) return 'Password must contain at least one special character.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Field Validations
    if (!name.trim()) return setError('Full Name is required.');
    if (!email.trim()) return setError('Email address is required.');
    if (!phone.trim()) return setError('Phone Number is required.');
    if (!password) return setError('Password is required.');

    const pwdError = validatePassword(password);
    if (pwdError) return setError(pwdError);

    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    setSubmitting(true);
    const res = await register(name, email, password, phone, rememberMe);
    setSubmitting(false);

    if (!res.success) {
      setError(res.message);
    }
  };

  return (
    <div className="pt-28 min-h-screen bg-zinc-950 flex items-center justify-center px-4 pb-16">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800/80 p-8 sm:p-10 rounded-2xl shadow-xl transition-all duration-300">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <span className="font-heading text-xl font-bold tracking-widest text-viva-gold uppercase">VIVA Lounge</span>
          <h2 className="text-xs font-body text-zinc-400 mt-2 tracking-wide uppercase">
            Create an Account
          </h2>
        </div>

        {error && (
          <div className="bg-red-950/30 border border-red-900/40 text-red-200 p-3 rounded-lg text-xs mb-5 text-center">
            {error}
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
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-viva-gold focus:ring-1 focus:ring-viva-gold/20 text-white text-sm rounded-lg py-2.5 pl-10 pr-4 outline-none transition-all duration-200"
                placeholder="Alexander Sterling"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-400">Email Address</label>
            <div className="relative">
              <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-sm" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-viva-gold focus:ring-1 focus:ring-viva-gold/20 text-white text-sm rounded-lg py-2.5 pl-10 pr-4 outline-none transition-all duration-200"
                placeholder="name@email.com"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-400">Phone Number</label>
            <div className="relative">
              <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-sm" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-viva-gold focus:ring-1 focus:ring-viva-gold/20 text-white text-sm rounded-lg py-2.5 pl-10 pr-4 outline-none transition-all duration-200"
                placeholder="+91 XXXXX XXXXX"
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
                placeholder="Min. 8 characters"
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
            <p className="text-[10px] text-zinc-500 leading-tight mt-1">
              Must include at least 8 chars, 1 uppercase, 1 lowercase, 1 digit, & 1 symbol.
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-400">Confirm Password</label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-sm" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-viva-gold focus:ring-1 focus:ring-viva-gold/20 text-white text-sm rounded-lg py-2.5 pl-10 pr-10 outline-none transition-all duration-200"
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
              >
                {showConfirmPassword ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 cursor-pointer select-none py-1">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="accent-viva-gold h-4 w-4 rounded border-zinc-800 bg-zinc-950 text-viva-gold focus:ring-viva-gold/20 cursor-pointer"
            />
            <label htmlFor="remember" className="text-[11px] text-zinc-400 cursor-pointer">
              Remember Me
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-viva-gold hover:bg-viva-gold/90 text-zinc-950 font-bold text-xs uppercase tracking-widest py-3 px-6 rounded-lg transition-all duration-250 flex items-center justify-center gap-2 hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100"
          >
            <span>Register</span>
            <FiArrowRight />
          </button>

          {/* Login redirect link */}
          <p className="text-center text-xs text-zinc-400 mt-6 pt-2">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-viva-gold hover:text-viva-gold/80 hover:underline font-semibold transition-colors ml-1"
            >
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
