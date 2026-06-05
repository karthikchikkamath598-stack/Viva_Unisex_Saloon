import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VivaLogo from './VivaLogo';

export const LoadingScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const duration = 1800; // 1.8 seconds loading simulation
    const intervalTime = 18;
    const increment = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setIsFinished(true);
            setTimeout(() => {
              onComplete();
            }, 600); // Wait for exit animation
          }, 300);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!isFinished && (
        <motion.div
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#080809]"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            scale: 1.05,
            filter: 'blur(10px)',
            transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
          }}
        >
          {/* Subtle background glow */}
          <div className="absolute w-[450px] h-[450px] rounded-full bg-viva-gold/5 blur-3xl pointer-events-none" />

          <div className="relative flex flex-col items-center z-10">
            {/* Logo Container with gold shimmer pulse */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mb-8 relative"
            >
              <VivaLogo size={140} className="filter drop-shadow-[0_0_15px_rgba(212,164,55,0.2)]" />
              {/* Shimmer light bar across logo */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent w-full h-full skew-x-12"
                initial={{ x: '-150%' }}
                animate={{ x: '150%' }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear", repeatDelay: 0.5 }}
              />
            </motion.div>

            {/* Circular Progress Indicator */}
            <div className="relative flex items-center justify-center w-24 h-24 mb-6">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="42" 
                  stroke="rgba(212, 164, 55, 0.06)" 
                  strokeWidth="3.5" 
                  fill="none" 
                />
                {/* Animated Ring */}
                <motion.circle 
                  cx="50" 
                  cy="50" 
                  r="42" 
                  stroke="#D4A437" 
                  strokeWidth="3.5" 
                  fill="none"
                  strokeDasharray="263.89"
                  strokeDashoffset={263.89 - (263.89 * progress) / 100}
                  strokeLinecap="round"
                  transition={{ ease: "easeOut" }}
                />
              </svg>
              {/* Percentage Counter in Center */}
              <div className="absolute font-heading font-black text-sm tracking-wider text-viva-white">
                {Math.round(progress)}%
              </div>
            </div>

            {/* Brand Message */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.8, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-center"
            >
              <span className="text-[10px] uppercase font-bold tracking-[0.4em] text-viva-gold">
                Entering Sanctuary
              </span>
              <p className="text-[8px] text-viva-gray uppercase tracking-[0.25em] mt-1.5 font-light">
                Bhongir's Premier Unisex Salon
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
