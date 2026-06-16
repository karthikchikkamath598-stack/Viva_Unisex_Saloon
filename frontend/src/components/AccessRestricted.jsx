import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiAlertOctagon } from 'react-icons/fi';
import VivaLogo from './VivaLogo';

const AccessRestricted = ({ message, preventRedirect = false }) => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    if (preventRedirect) return;
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, preventRedirect]);

  return (
    <div className="min-h-screen bg-[#080809] flex flex-col items-center justify-center text-center px-6 select-none relative overflow-hidden font-body">
      {/* Background radial glow */}
      <div className="absolute w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(239,68,68,0.05)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="max-w-md w-full bg-[#121417] border border-red-900/30 p-10 rounded-xl shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-red-600" />

        <div className="flex justify-center mb-6">
          <VivaLogo size={56} className="text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.4)]" />
        </div>

        <div className="w-16 h-16 bg-red-950/20 border border-red-900/40 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiAlertOctagon className="text-red-500 text-3xl animate-bounce" />
        </div>

        <h2 className="font-heading text-xl font-bold text-white uppercase tracking-widest mb-3">
          Restricted Portal
        </h2>
        
        <p className="text-sm text-red-200 leading-relaxed mb-8 font-light max-w-sm mx-auto">
          {message || "Access Restricted. You do not have permission to access this page."}
        </p>

        {!preventRedirect ? (
          <>
            <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-[10px] text-zinc-500 tracking-widest uppercase">
              Returning to salon home in {countdown}s
            </p>
          </>
        ) : (
          <p className="text-[10px] text-zinc-500 tracking-widest uppercase">
            Please use a desktop computer or laptop to sign in.
          </p>
        )}

        <button
          onClick={() => navigate('/')}
          className="mt-6 text-[10px] border border-white/10 hover:border-viva-gold text-zinc-400 hover:text-viva-black hover:bg-viva-gold px-4 py-2 rounded transition-all uppercase tracking-widest"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
};

export default AccessRestricted;
