import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FiLock, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { validateResetToken, resetPassword } = useContext(AuthContext);

  // Form Fields
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  // Validate reset token on mount
  useEffect(() => {
    const verifyToken = async () => {
      setVerifying(true);
      setError('');
      try {
        const res = await validateResetToken(token);
        if (res.success) {
          setTokenValid(true);
        } else {
          setError(res.message || 'The password reset token is invalid or has expired.');
        }
      } catch (err) {
        setError('Token validation failed. Please make sure the backend server is running.');
      } finally {
        setVerifying(false);
      }
    };

    if (token) {
      verifyToken();
    } else {
      setError('No token provided.');
      setVerifying(false);
    }
  }, [token, validateResetToken]);

  const validatePasswordStrength = (pwd) => {
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
    setInfo('');

    if (!password) return setError('New Password is required.');

    const pwdError = validatePasswordStrength(password);
    if (pwdError) return setError(pwdError);

    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    setSubmitting(true);
    try {
      const res = await resetPassword(token, password);
      setSubmitting(false);

      if (res.success) {
        setInfo('Password updated successfully. Redirecting you to login...');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(res.message || 'Failed to reset password.');
      }
    } catch (err) {
      setSubmitting(false);
      setError('Failed to update password. Please check your connection.');
    }
  };

  return (
    <div className="pt-28 min-h-screen bg-zinc-950 flex items-center justify-center px-4 pb-16">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800/80 p-8 sm:p-10 rounded-2xl shadow-xl transition-all duration-300">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <span className="font-heading text-xl font-bold tracking-widest text-viva-gold uppercase">VIVA Lounge</span>
          <h2 className="text-xs font-body text-zinc-400 mt-2 tracking-wide uppercase">
            New Password Setup
          </h2>
        </div>

        {verifying ? (
          <div className="text-center py-10">
            <div className="w-10 h-10 border-4 border-viva-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xs text-zinc-400 font-medium">Validating your reset token...</p>
          </div>
        ) : (
          <>
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

            {tokenValid ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-xs text-zinc-400 leading-relaxed text-center mb-2">
                  Please configure your new secure account password below.
                </p>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400">New Password</label>
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
                      placeholder="Confirm new password"
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

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-viva-gold hover:bg-viva-gold/90 text-zinc-950 font-bold text-xs uppercase tracking-widest py-3 px-6 rounded-lg transition-all duration-250 flex items-center justify-center gap-2 hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100 mt-2"
                >
                  <span>Reset Password</span>
                  <FiArrowRight />
                </button>
              </form>
            ) : (
              <div className="text-center mt-4">
                <Link
                  to="/forgot-password"
                  className="inline-block bg-viva-gold hover:bg-viva-gold/90 text-zinc-950 text-xs font-bold uppercase tracking-widest px-6 py-2.5 rounded-lg transition-colors"
                >
                  Request New Link
                </Link>
                <Link
                  to="/login"
                  className="text-xs text-zinc-400 hover:text-viva-gold block mx-auto text-center font-medium transition-colors mt-5"
                >
                  Back to Sign In
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
