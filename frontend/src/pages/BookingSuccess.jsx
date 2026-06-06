import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiHome, FiTrendingUp } from 'react-icons/fi';

const BookingSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract navigation state data
  const { bookingId, date, timeSlot } = location.state || {};

  const formatBookingId = (id) => {
    if (!id) return 'VIVA-2026-001';
    if (id.startsWith('appointment_')) {
      const ts = id.split('_')[1] || '';
      return `VIVA-2026-${ts.slice(-3)}`;
    }
    // For Mongoose ObjectId
    return `VIVA-2026-${id.slice(-4).toUpperCase()}`;
  };

  const formattedDate = date ? new Date(date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) : '15 June 2026';

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6 relative font-body text-white">
      <motion.div 
        className="max-w-md w-full bg-zinc-900 border border-zinc-800/80 p-8 rounded-2xl text-center shadow-2xl relative overflow-hidden"
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 180 }}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-[#D4AF37]" />
        
        <div className="w-16 h-16 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiCheckCircle className="text-[#D4AF37] text-2xl" />
        </div>
        
        <h2 className="font-heading text-2xl font-bold uppercase tracking-widest text-white mb-3">
          Appointment Successfully Booked
        </h2>
        <p className="text-xs text-zinc-400 mb-8 leading-relaxed font-light">
          Your ritual appointment is scheduled. Confirmation and reminder alerts have been dispatched.
        </p>

        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 text-left text-xs space-y-2.5 mb-8">
          <div className="flex justify-between border-b border-zinc-900 pb-2">
            <span className="text-zinc-500 uppercase tracking-wider text-[9px]">Booking ID</span>
            <span className="text-white font-mono font-bold">{formatBookingId(bookingId)}</span>
          </div>
          <div className="flex justify-between border-b border-zinc-900 pb-2">
            <span className="text-zinc-500 uppercase tracking-wider text-[9px]">Date</span>
            <span className="text-white font-semibold">{formattedDate}</span>
          </div>
          <div className="flex justify-between pb-1">
            <span className="text-zinc-500 uppercase tracking-wider text-[9px]">Time</span>
            <span className="text-[#D4AF37] font-semibold">{timeSlot || '11:00 AM'}</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-[#D4AF37] hover:bg-[#F3C65F] text-zinc-950 font-bold text-xs uppercase tracking-widest py-3 rounded-lg shadow-md hover:scale-[1.02] transition-transform flex items-center justify-center gap-1.5"
          >
            <FiTrendingUp /> View Dashboard
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="w-full bg-transparent hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white font-bold text-xs uppercase tracking-widest py-3 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <FiHome /> Back To Home
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default BookingSuccess;
