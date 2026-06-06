import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FiMail, FiArrowRight } from 'react-icons/fi';

const ForgotPassword = () => {
  const { forgotPassword } = useContext(AuthContext);

  // Form Fields
  const [email, setEmail] = useState('');

  // UI States
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resetLink, setResetLink] = useState(''); // To help users test without viewing terminal logs directly

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setResetLink('');
    setSubmitting(true);

    try {
      const res = await forgotPassword(email);
      setSubmitting(false);

      if (res.success) {
        setInfo(res.message || 'Reset link generated! Check your email or look below.');
        if (res.token) {
          // If token returned, construct the link for easy browser development testing
          const clientUrl = window.location.origin;
          setResetLink(`${clientUrl}/reset-password/${res.token}`);
        }
      } else {
        setError(res.message || 'Error occurred while sending reset email.');
      }
    } catch (err) {
      setSubmitting(false);
      setError('Connection failed. Please ensure the backend server is running.');
    }
  };

  return (
    <div className="pt-28 min-h-screen bg-zinc-950 flex items-center justify-center px-4 pb-16">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800/80 p-8 sm:p-10 rounded-2xl shadow-xl transition-all duration-300">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <span className="font-heading text-xl font-bold tracking-widest text-viva-gold uppercase">VIVA Lounge</span>
          <h2 className="text-xs font-body text-zinc-400 mt-2 tracking-wide uppercase">
            Reset Password
          </h2>
        </div>

        {error && (
          <div className="bg-red-950/30 border border-red-900/40 text-red-200 p-3 rounded-lg text-xs mb-5 text-center animate-fade-in">
            {error}
          </div>
        )}

        {info && (
          <div className="bg-zinc-950 border border-viva-gold/30 text-viva-gold p-3 rounded-lg text-xs mb-5 text-center animate-fade-in">
            {info}
          </div>
        )}

        {/* FORGOT PASSWORD FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <p className="text-xs text-zinc-400 leading-relaxed text-center">
            Enter your email address and we will generate a password reset link to update your credentials.
          </p>
          
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

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-viva-gold hover:bg-viva-gold/90 text-zinc-950 font-bold text-xs uppercase tracking-widest py-3 px-6 rounded-lg transition-all duration-250 flex items-center justify-center gap-2 hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100"
          >
            <span>Send Reset Link</span>
            <FiArrowRight />
          </button>

          {/* Dev helper display for Reset Link */}
          {resetLink && (
            <div className="mt-4 p-3 bg-zinc-950/60 border border-viva-gold/20 rounded-lg text-center animate-fade-in">
              <p className="text-[10px] text-zinc-400 uppercase tracking-widest mb-1.5 font-bold">Development Reset Shortcut</p>
              <Link 
                to={resetLink} 
                className="text-xs text-viva-gold hover:underline font-semibold block truncate"
              >
                Click here to reset password
              </Link>
            </div>
          )}

          <Link
            to="/login"
            className="text-xs text-zinc-400 hover:text-viva-gold block mx-auto text-center font-medium transition-colors pt-2"
          >
            Back to Sign In
          </Link>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
