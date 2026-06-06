import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FiMail, FiLock, FiArrowRight, FiX, FiEye, FiEyeOff } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';

const hasGoogleClientId = !!import.meta.env.VITE_GOOGLE_CLIENT_ID;

const decodeJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

const generateGoogleId = (name) => {
  return 'g_' + name.toLowerCase().replace(/[^a-z]/g, '') + '_' + Date.now();
};

const Login = () => {
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '';
  const navigate = useNavigate();
  const { user, login, loginWithGoogle } = useContext(AuthContext);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Info Banners
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Google Login UI States
  const [showMockGoogleModal, setShowMockGoogleModal] = useState(false);
  const [showCustomGoogleInput, setShowCustomGoogleInput] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');

  const mockGoogleAccounts = [
    { name: 'Diana Prince', email: 'user@vivasalon.com' },
    { name: 'Elena Rostova', email: 'elena.rostova@gmail.com' },
    { name: 'Alexander Sterling', email: 'alex.sterling@gmail.com' },
  ];

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      if (redirect) navigate(`/${redirect}`);
      else navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    }
  }, [user, navigate, redirect]);

  // Load Google SDK if client ID is configured
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const handleCredentialResponse = async (response) => {
      setError('');
      setSubmitting(true);
      try {
        const decoded = decodeJwt(response.credential);
        if (decoded) {
          const payload = {
            email: decoded.email,
            name: decoded.name,
            googleId: decoded.sub,
            imageUrl: decoded.picture
          };
          const res = await loginWithGoogle(payload, rememberMe);
          if (!res.success) {
            setError(res.message);
          }
        } else {
          setError('Google token decoding failed.');
        }
      } catch {
        setError('Google authentication failed.');
      } finally {
        setSubmitting(false);
      }
    };

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
      });
      window.google?.accounts.id.renderButton(
        document.getElementById('google-signin-btn-container'),
        { theme: 'outline', size: 'large', width: '100%' }
      );
    };
    document.body.appendChild(script);

    return () => {
      try {
        document.body.removeChild(script);
      } catch {
        // ignore if already removed
      }
    };
  }, [loginWithGoogle, rememberMe]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setSubmitting(true);

    const res = await login(email, password, rememberMe);
    setSubmitting(false);
    if (!res.success) {
      setError(res.message);
    }
  };

  const handleMockGoogleSelect = async (account) => {
    setShowMockGoogleModal(false);
    setError('');
    setSubmitting(true);

    const payload = {
      email: account.email,
      name: account.name,
      googleId: generateGoogleId(account.name),
      imageUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${account.name}`
    };

    const res = await loginWithGoogle(payload, rememberMe);
    setSubmitting(false);
    if (!res.success) {
      setError(res.message);
    }
  };

  const handleCustomGoogleSubmit = async (e) => {
    e.preventDefault();
    setShowMockGoogleModal(false);
    setError('');
    setSubmitting(true);

    const payload = {
      email: customGoogleEmail,
      name: customGoogleName,
      googleId: generateGoogleId(customGoogleName),
      imageUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${customGoogleName}`
    };

    const res = await loginWithGoogle(payload, rememberMe);
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
            Sign In to Your Account
          </h2>
        </div>

        {error && (
          <div className="bg-red-950/30 border border-red-900/40 text-red-200 p-3 rounded-lg text-xs mb-5 text-center">
            {error}
          </div>
        )}

        {info && (
          <div className="bg-zinc-950 border border-viva-gold/30 text-viva-gold p-3 rounded-lg text-xs mb-5 text-center">
            {info}
          </div>
        )}

        {/* LOGIN FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">
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

          {/* Remember Me and Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="accent-viva-gold h-4 w-4 rounded border-zinc-800 bg-zinc-950 text-viva-gold focus:ring-viva-gold/20 cursor-pointer"
              />
              <span className="text-[11px] text-zinc-400">Remember Me</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-[11px] text-zinc-400 hover:text-viva-gold transition-colors font-medium"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-viva-gold hover:bg-viva-gold/90 text-zinc-950 font-bold text-xs uppercase tracking-widest py-3 px-6 rounded-lg transition-all duration-250 flex items-center justify-center gap-2 hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100"
          >
            <span>Sign In</span>
            <FiArrowRight />
          </button>

          <div className="relative flex py-3 items-center">
            <div className="flex-grow border-t border-zinc-800"></div>
            <span className="flex-shrink mx-4 text-[10px] uppercase text-zinc-500 tracking-wider">or</span>
            <div className="flex-grow border-t border-zinc-800"></div>
          </div>

          {/* Google Sign-in action button */}
          {hasGoogleClientId ? (
            <div id="google-signin-btn-container" className="w-full min-h-[40px] flex justify-center"></div>
          ) : (
            <button
              type="button"
              onClick={() => setShowMockGoogleModal(true)}
              className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-800/40 border border-zinc-800 hover:border-zinc-700 rounded-lg flex items-center justify-center gap-3 text-xs font-semibold transition-all duration-200"
            >
              <FcGoogle className="text-lg" />
              <span className="text-zinc-300">Continue with Google</span>
            </button>
          )}

          {/* Mode toggler link */}
          <p className="text-center text-xs text-zinc-400 mt-6">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-viva-gold hover:text-viva-gold/80 hover:underline font-semibold transition-colors ml-1"
            >
              Sign Up
            </Link>
          </p>
        </form>
      </div>

      {/* MOCK GOOGLE ACCOUNT CHOOSER DIALOG */}
      {showMockGoogleModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative transition-all duration-300">
            <button 
              onClick={() => {
                setShowMockGoogleModal(false);
                setShowCustomGoogleInput(false);
              }}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
            >
              <FiX className="text-lg" />
            </button>
            
            <div className="text-center mb-6">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                <FcGoogle className="text-2xl" />
              </div>
              <h3 className="font-heading text-lg font-bold text-white tracking-wide">Choose an account</h3>
              <p className="text-xs text-zinc-400 mt-1">to continue to <span className="text-viva-gold font-semibold">VIVA Unisex Salon</span></p>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {mockGoogleAccounts.map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => handleMockGoogleSelect(acc)}
                  className="w-full flex items-center gap-3 p-3 bg-zinc-950 hover:bg-zinc-800/40 border border-zinc-800/60 hover:border-zinc-700 rounded-xl text-left transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-full bg-viva-gold/10 border border-viva-gold/25 flex items-center justify-center text-viva-gold text-xs font-bold uppercase">
                    {acc.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{acc.name}</p>
                    <p className="text-[10px] text-zinc-400 truncate">{acc.email}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-4 border-t border-zinc-800 pt-4">
              {!showCustomGoogleInput ? (
                <button
                  onClick={() => setShowCustomGoogleInput(true)}
                  className="w-full py-2 bg-transparent hover:bg-white/5 border border-zinc-800 hover:border-zinc-700 rounded-xl text-[11px] font-semibold text-zinc-400 hover:text-zinc-300 tracking-wider transition-colors text-center"
                >
                  Use another account
                </button>
              ) : (
                <form onSubmit={handleCustomGoogleSubmit} className="space-y-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-zinc-400">Google Email</label>
                    <input
                      type="email"
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      placeholder="name@gmail.com"
                      required
                      className="w-full mt-1 bg-zinc-950 border border-zinc-800 focus:border-viva-gold text-white text-xs rounded-lg py-2 px-3 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-zinc-400">Google Name</label>
                    <input
                      type="text"
                      value={customGoogleName}
                      onChange={(e) => setCustomGoogleName(e.target.value)}
                      placeholder="Alexander Sterling"
                      required
                      className="w-full mt-1 bg-zinc-950 border border-zinc-800 focus:border-viva-gold text-white text-xs rounded-lg py-2 px-3 outline-none"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowCustomGoogleInput(false)}
                      className="flex-1 py-2 bg-zinc-950 hover:bg-zinc-800 rounded-lg text-[10px] font-bold text-zinc-400"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-viva-gold hover:bg-viva-gold/90 text-zinc-950 font-bold text-[10px] uppercase tracking-wider rounded-lg"
                    >
                      Sign In
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
