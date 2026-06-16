import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiHome } from 'react-icons/fi';

const BookingSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract navigation state data
  const { bookingId, customerName, mobileNumber, service, staffMember, date, timeSlot } = location.state || {};

  const [successParticles, setSuccessParticles] = useState([]);
  useEffect(() => {
    const generated = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 40 + 60,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 4 + 4,
      delay: Math.random() * 2
    }));
    setSuccessParticles(generated);
  }, []);


  const formatBookingId = (id) => {
    if (!id) return 'VIVA-2026-001';
    if (id.startsWith('appointment_')) {
      const ts = id.split('_')[1] || '';
      return `VIVA-2026-${ts.slice(-3)}`;
    }
    return `VIVA-2026-${id.slice(-4).toUpperCase()}`;
  };

  const formattedDate = date ? new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) : '15 June 2026';

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6 relative font-body text-white">
      {/* Success Sparks Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {successParticles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-[#D4AF37]"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              boxShadow: '0 0 6px #FFD700',
            }}
            animate={{
              y: [0, -450],
              opacity: [0, 0.8, 0],
              scale: [1, 1.5, 0.5]
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: 'easeOut'
            }}
          />
        ))}
      </div>

      <motion.div 
        className="max-w-md w-full bg-zinc-900 border border-zinc-800/80 p-8 rounded-2xl text-center shadow-2xl relative overflow-hidden z-10"
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 180 }}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-[#D4AF37]" />
        
        <motion.div 
          className="w-20 h-20 bg-[#D4AF37]/10 border border-[#D4AF37]/45 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(212,175,55,0.2)]"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 10, stiffness: 100, delay: 0.2 }}
        >
          <FiCheckCircle className="text-[#D4AF37] text-4xl animate-pulse" />
        </motion.div>
        
        <h2 className="font-heading text-2xl font-bold uppercase tracking-widest text-white mb-3">
          Appointment Booked Successfully
        </h2>
        <p className="text-xs text-zinc-400 mb-8 leading-relaxed font-light">
          Your ritual appointment is scheduled. Confirmation and reminder alerts have been dispatched.
        </p>

        <div className="bg-zinc-950 p-5 rounded-xl border border-zinc-850 text-left text-xs space-y-3.5 mb-8">
          <div className="flex justify-between border-b border-zinc-900 pb-2.5">
            <span className="text-zinc-500 uppercase tracking-wider text-[9px]">Booking ID</span>
            <span className="text-white font-mono font-bold">{formatBookingId(bookingId)}</span>
          </div>
          <div className="flex justify-between border-b border-zinc-900 pb-2.5">
            <span className="text-zinc-500 uppercase tracking-wider text-[9px]">Customer Name</span>
            <span className="text-white font-semibold">{customerName || 'N/A'}</span>
          </div>
          <div className="flex justify-between border-b border-zinc-900 pb-2.5">
            <span className="text-zinc-500 uppercase tracking-wider text-[9px]">Mobile Number</span>
            <span className="text-white font-semibold">{mobileNumber || 'N/A'}</span>
          </div>
          <div className="flex justify-between border-b border-zinc-900 pb-2.5">
            <span className="text-zinc-500 uppercase tracking-wider text-[9px]">Service Booked</span>
            <span className="text-white font-semibold text-right max-w-[200px] truncate">{service || 'N/A'}</span>
          </div>
          <div className="flex justify-between border-b border-zinc-900 pb-2.5">
            <span className="text-zinc-500 uppercase tracking-wider text-[9px]">Staff Member</span>
            <span className="text-[#D4AF37] font-semibold uppercase tracking-wider">{staffMember || 'N/A'}</span>
          </div>
          <div className="flex justify-between border-b border-zinc-900 pb-2.5">
            <span className="text-zinc-500 uppercase tracking-wider text-[9px]">Date</span>
            <span className="text-white font-semibold">{formattedDate}</span>
          </div>
          <div className="flex justify-between pb-1">
            <span className="text-zinc-500 uppercase tracking-wider text-[9px]">Time Slot</span>
            <span className="text-[#D4AF37] font-semibold">{timeSlot || '11:00 AM'}</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate('/')}
            className="w-full bg-[#D4AF37] hover:bg-[#F3C65F] text-zinc-950 font-bold text-xs uppercase tracking-widest py-3.5 rounded-lg shadow-gold-glow hover:scale-[1.02] transition-transform flex items-center justify-center gap-1.5"
          >
            <FiHome /> Back To Home
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default BookingSuccess;
