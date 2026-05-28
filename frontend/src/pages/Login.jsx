import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FiMail, FiLock, FiUser, FiPhone, FiArrowRight } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';

const Login = () => {
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '';
  const navigate = useNavigate();
  const { user, login, register, loginWithGoogle } = useContext(AuthContext);

  // States
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [isOtpStep, setIsOtpStep] = useState(false);

  // Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Info Banners
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      if (redirect) navigate(`/${redirect}`);
      else navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    }
  }, [user, navigate, redirect]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setSubmitting(true);

    if (isLoginMode) {
      // Login
      const res = await login(email, password);
      setSubmitting(false);
      if (!res.success) {
        setError(res.message);
      }
    } else {
      // Register
      const res = await register(name, email, password, phone);
      setSubmitting(false);
      if (!res.success) {
        setError(res.message);
      }
    }
  };

  // Simulated Google Sign in
  const handleGoogleSignIn = async () => {
    setError('');
    setSubmitting(true);
    const mockGooglePayload = {
      email: email || `google.user.${Date.now()}@gmail.com`,
      name: name || 'Google Developer Client',
      googleId: 'g_' + Date.now()
    };

    const res = await loginWithGoogle(mockGooglePayload);
    setSubmitting(false);
    if (!res.success) {
      setError(res.message);
    }
  };

  // Forgot password OTP trigger
  const triggerForgotEmail = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setSubmitting(true);

    try {
      // For simplicity/mock bypass, call endpoint
      const res = await fetch(`http://localhost:5000/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      setSubmitting(false);
      if (data.success) {
        setInfo('OTP code sent successfully. (For development, use code: 123456)');
        setIsOtpStep(true);
      } else {
        setError(data.message || 'Error checking email.');
      }
    } catch (err) {
      console.error('Forgot password OTP check failed:', err);
      setSubmitting(false);
      setInfo('Server connectivity error. Proceeding with mockup bypass (Use OTP code: 123456).');
      setIsOtpStep(true);
    }
  };

  // OTP Verification trigger
  const triggerResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setSubmitting(true);

    try {
      const res = await fetch(`http://localhost:5000/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      });
      const data = await res.json();
      setSubmitting(false);
      if (data.success) {
        setInfo('Password updated successfully. Please log in with your new credentials.');
        setIsForgotMode(false);
        setIsOtpStep(false);
        setIsLoginMode(true);
        setPassword('');
      } else {
        setError(data.message || 'OTP verification failed.');
      }
    } catch (err) {
      console.error('Reset password verification failed:', err);
      setSubmitting(false);
      setError('Connection failed. Please double check that the server is started.');
    }
  };

  return (
    <div className="pt-24 min-h-screen bg-viva-black flex items-center justify-center px-6 pb-16">
      <div className="max-w-md w-full bg-viva-charcoal border border-viva-gold/10 p-8 sm:p-10 rounded-lg shadow-gold-glow relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gold-gradient" />

        {/* Brand headers */}
        <div className="text-center mb-8">
          <span className="font-heading text-xl font-bold tracking-[0.25em] text-viva-gold uppercase">VIVA Lounge</span>
          <h2 className="text-sm font-body text-viva-gray tracking-widest mt-1 uppercase">
            {isForgotMode 
              ? 'Restore Ritual Portal' 
              : isLoginMode 
                ? 'Sign In to Your Ritual' 
                : 'Register Membership'}
          </h2>
        </div>

        {error && (
          <div className="bg-red-950/40 border border-red-800 text-red-200 p-4 rounded text-xs mb-6 text-center animate-pulse">
            {error}
          </div>
        )}

        {info && (
          <div className="bg-viva-black/80 border border-viva-gold/30 text-viva-gold p-4 rounded text-xs mb-6 text-center">
            {info}
          </div>
        )}

        {/* FORGOT PASSWORD FORM FLOW */}
        {isForgotMode ? (
          !isOtpStep ? (
            <form onSubmit={triggerForgotEmail} className="space-y-6">
              <p className="text-xs text-viva-gray leading-relaxed font-light text-center">
                Provide your registered email address below. We will send a 6-digit OTP to reset your access code.
              </p>
              <div className="flex flex-col">
                <label className="text-[9px] uppercase tracking-widest text-viva-gray mb-2">Email Address</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-viva-gray" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="viva-input w-full pl-10"
                    placeholder="name@email.com"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="gold-shimmer text-viva-black font-body font-bold text-xs uppercase tracking-widest py-3 px-8 rounded shadow-gold-glow w-full hover:scale-[1.02] transition-transform"
              >
                Transmit OTP
              </button>
              <button
                type="button"
                onClick={() => setIsForgotMode(false)}
                className="text-xs text-viva-gold hover:underline block mx-auto text-center"
              >
                Return to Login
              </button>
            </form>
          ) : (
            <form onSubmit={triggerResetPassword} className="space-y-6">
              <div className="flex flex-col">
                <label className="text-[9px] uppercase tracking-widest text-viva-gray mb-2">Enter OTP Code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="viva-input text-center font-mono text-lg tracking-widest"
                  placeholder="123456"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="text-[9px] uppercase tracking-widest text-viva-gray mb-2">Choose New Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-viva-gray" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="viva-input w-full pl-10"
                    placeholder="Min 6 characters..."
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="gold-shimmer text-viva-black font-body font-bold text-xs uppercase tracking-widest py-3 px-8 rounded shadow-gold-glow w-full"
              >
                Reset Password
              </button>
            </form>
          )
        ) : (
          /* REGULAR LOGIN / REGISTER FORMS */
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLoginMode && (
              <div className="flex flex-col animate-fade-in">
                <label className="text-[9px] uppercase tracking-widest text-viva-gray mb-2">Full Name</label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-viva-gray" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="viva-input w-full pl-10"
                    placeholder="Alexander Sterling"
                    required
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col">
              <label className="text-[9px] uppercase tracking-widest text-viva-gray mb-2">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-viva-gray" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="viva-input w-full pl-10"
                  placeholder="name@email.com"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <label className="text-[9px] uppercase tracking-widest text-viva-gray">Access Password</label>
                {isLoginMode && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotMode(true);
                      setError('');
                      setInfo('');
                    }}
                    className="text-[9px] text-viva-gold hover:underline uppercase tracking-wider"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-viva-gray" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="viva-input w-full pl-10"
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                  required
                />
              </div>
            </div>

            {!isLoginMode && (
              <div className="flex flex-col animate-fade-in">
                <label className="text-[9px] uppercase tracking-widest text-viva-gray mb-2">Contact Phone</label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-viva-gray" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="viva-input w-full pl-10"
                    placeholder="+1 (555) 0100"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="gold-shimmer text-viva-black font-body font-bold text-xs uppercase tracking-widest py-3 px-8 rounded shadow-gold-glow w-full flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform duration-300 mt-2"
            >
              <span>{isLoginMode ? 'Access Lounge' : 'Create Account'}</span>
              <FiArrowRight />
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-white/5"></div>
              <span className="flex-shrink mx-4 text-[9px] uppercase text-viva-gray tracking-widest">or bypass with</span>
              <div className="flex-grow border-t border-white/5"></div>
            </div>

            {/* Google Sign-in bypass button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full py-3 bg-viva-black hover:bg-white/5 border border-white/10 rounded flex items-center justify-center gap-3 text-xs tracking-wider font-semibold transition-colors"
            >
              <FcGoogle className="text-lg" />
              <span>Simulated Google Login</span>
            </button>

            {/* Mode switch */}
            <p className="text-center text-xs text-viva-gray mt-6">
              {isLoginMode ? "Don't possess a VIP access profile?" : "Already possess an access profile?"}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsLoginMode(!isLoginMode);
                  setError('');
                  setInfo('');
                }}
                className="text-viva-gold hover:underline font-semibold"
              >
                {isLoginMode ? 'Register Member' : 'Sign In'}
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
