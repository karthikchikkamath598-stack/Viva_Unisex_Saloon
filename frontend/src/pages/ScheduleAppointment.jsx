import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { FiUser, FiCalendar, FiClock, FiLock, FiX, FiInfo, FiArrowLeft } from 'react-icons/fi';

const defaultSlots = [
  "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM",
  "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"
];

const ScheduleAppointment = () => {
  const { user, API_URL } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Pull selectedServices from BookingContext (primary source of truth)
  const { selectedServices, totalAmount, totalDuration, clearBooking } = useBooking();

  // Customer details form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  
  // Appointment date/time state
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [notes, setNotes] = useState('');
  
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Auto-fill customer details from logged-in user
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  // Fetch slots on date change
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDate) return;
      setSlotsLoading(true);
      setSelectedSlot('');
      setError('');
      try {
        const res = await axios.get(`${API_URL}/appointments/slots`, {
          params: { date: selectedDate }
        });
        if (res.data.success) {
          setSlots(res.data.slots);
        } else {
          // If API returns error message (e.g. Tuesday), show it
          setError(res.data.message || 'Unable to load slots.');
          setSlots([]);
        }
      } catch (err) {
        console.error('Error fetching slot records:', err);
        // Fallback to default slots so user can still proceed
        setSlots(defaultSlots.map(s => ({ slot: s, isAvailable: true })));
      } finally {
        setSlotsLoading(false);
      }
    };
    fetchSlots();
  }, [selectedDate, API_URL]);

  const handleConfirmAppointment = async (e) => {
    e.preventDefault();
    if (selectedServices.length === 0) {
      setError('Your ritual selection is empty. Please go back to the Catalog and select services.');
      return;
    }
    if (!name || !email || !phone) {
      setError('Please fill out all contact detail fields.');
      return;
    }
    if (!selectedDate || !selectedSlot) {
      setError('Please select both a date and an available timeslot.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const payload = {
        // Send full service objects so backend never needs to DB-lookup by ID
        // This prevents "Cast to ObjectId failed" when using fallback catalog services
        serviceDetails: selectedServices.map(s => ({
          serviceId: s._id,
          serviceName: s.name,
          price: s.price,
          duration: s.duration
        })),
        // Also send IDs for backwards-compat with any code that reads `services`
        services: selectedServices.map(s => s._id),
        date: selectedDate,
        timeSlot: selectedSlot,
        customerName: name,
        email,
        phone,
        notes,
        gender
      };

      const res = await axios.post(`${API_URL}/appointments`, payload);
      if (res.data.success) {
        // Clear booking context and localStorage after successful booking
        clearBooking();
        
        // Redirect to success page
        navigate('/booking-success', {
          state: {
            bookingId: res.data.appointment._id,
            date: selectedDate,
            timeSlot: selectedSlot
          }
        });
      } else {
        setError(res.data.message || 'Appointment scheduling failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error scheduling appointment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="pt-24 min-h-screen bg-zinc-950 pb-16 font-body text-white">
      {/* Sign-in lock modal overlay */}
      <AnimatePresence>
        {!user && (
          <motion.div 
            className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[100] p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="max-w-md w-full bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl relative text-center overflow-hidden"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-[#D4AF37]" />
              
              <div className="w-16 h-16 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiLock className="text-[#D4AF37] text-2xl" />
              </div>
              
              <h3 className="font-heading text-2xl font-bold text-white tracking-wider uppercase mb-3">Authentication Required</h3>
              <p className="text-xs text-zinc-400 mb-8 leading-relaxed font-light">
                Please sign in to schedule your ritual experience. Create an account or sign in to verify dates and timeslots.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/login?redirect=schedule-appointment')}
                  className="w-full bg-[#D4AF37] hover:bg-[#F3C65F] text-zinc-950 font-bold text-xs uppercase tracking-widest py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/signup?redirect=schedule-appointment')}
                  className="w-full bg-transparent hover:bg-zinc-850 border border-zinc-700 text-white font-bold text-xs uppercase tracking-widest py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
                >
                  Register Account
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="text-xs text-zinc-500 hover:text-zinc-350 font-medium transition-colors pt-3"
                >
                  Return to Home
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-6 mt-6">
        <div className="text-center mb-10">
          <span className="text-[#D4AF37] text-xs uppercase tracking-[0.3em] font-semibold mb-2 block">
            Booking Engine
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-widest uppercase">
            Schedule Appointment
          </h1>
          <div className="w-12 h-[1px] bg-[#D4AF37] mx-auto mt-4" />
        </div>

        {error && (
          <div className="max-w-4xl mx-auto bg-red-950/40 border border-red-900/50 text-red-200 p-4 rounded text-xs mb-8 text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Left Side Scheduling Details */}
          <form onSubmit={handleConfirmAppointment} className="lg:col-span-8 space-y-6">
            
            {/* Step 1: Customer Details */}
            <div className="bg-zinc-900 border border-zinc-800/80 p-6 rounded-xl space-y-4">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[#D4AF37] border-b border-zinc-800 pb-3">
                1. Customer Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-400">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-3 text-sm focus:border-[#D4AF37] outline-none text-white transition-colors"
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-400">Mobile Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-3 text-sm focus:border-[#D4AF37] outline-none text-white transition-colors"
                    placeholder="Enter your mobile number"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-400">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-3 text-sm focus:border-[#D4AF37] outline-none text-white transition-colors"
                    placeholder="Enter email address"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-400">Gender (Optional)</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-3 text-sm focus:border-[#D4AF37] outline-none text-white transition-colors cursor-pointer"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2: Date & Slot Selection */}
            <div className="bg-zinc-900 border border-zinc-800/80 p-6 rounded-xl space-y-4">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[#D4AF37] border-b border-zinc-800 pb-3">
                2. Appointment Scheduling
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1 flex flex-col justify-end">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-400 mb-1.5">Date Picker</label>
                  <input
                    type="date"
                    min={getMinDate()}
                    value={selectedDate}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val) {
                        const day = new Date(val).getUTCDay();
                        if (day === 2) {
                          setError('The salon is closed on Tuesdays. Please select another date.');
                          setSelectedDate('');
                        } else {
                          setError('');
                          setSelectedDate(val);
                        }
                      } else {
                        setSelectedDate('');
                      }
                    }}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-3 text-sm focus:border-[#D4AF37] outline-none text-white cursor-pointer transition-colors"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-400 mb-1.5 block">Available Time Slots</label>
                  
                  {!selectedDate ? (
                    <div className="p-3 bg-zinc-950/40 text-center text-xs text-zinc-400 border border-zinc-800/50 rounded-lg flex items-center justify-center gap-1.5">
                      <FiInfo className="text-[#D4AF37]" /> Please pick a date first.
                    </div>
                  ) : slotsLoading ? (
                    <div className="text-center py-4">
                      <div className="w-5 h-5 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-1"></div>
                      <span className="text-[10px] text-zinc-400">Verifying slots...</span>
                    </div>
                  ) : slots.length === 0 ? (
                    <div className="p-3 bg-zinc-950/40 text-center text-xs text-zinc-400 border border-zinc-800/50 rounded-lg">
                      No slots available. The salon may be closed on this date.
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-1.5">
                      {slots.map(({ slot, isAvailable }) => (
                        <button
                          type="button"
                          key={slot}
                          disabled={!isAvailable}
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-2 text-center rounded text-[10px] font-mono tracking-wider transition-all duration-300 border ${
                            selectedSlot === slot 
                              ? 'bg-[#D4AF37] border-[#D4AF37] text-zinc-950 font-bold'
                              : isAvailable 
                                ? 'bg-zinc-950 border-zinc-850 hover:border-[#D4AF37]/50 text-white'
                                : 'bg-zinc-950/20 border-transparent text-zinc-650 line-through cursor-not-allowed'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Step 3: Bespoke Notes */}
            <div className="bg-zinc-900 border border-zinc-800/80 p-6 rounded-xl space-y-4">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[#D4AF37] border-b border-zinc-800 pb-3">
                3. Additional Notes
              </h3>
              
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-zinc-400">Special Requests / Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-3 text-sm focus:border-[#D4AF37] outline-none text-white transition-colors h-24 resize-none"
                  placeholder="Share any details or requests you have for your visit..."
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || selectedServices.length === 0}
              className="w-full py-3 bg-[#D4AF37] hover:bg-[#F3C65F] text-zinc-950 font-body font-bold text-xs uppercase tracking-widest rounded-lg transition-all shadow-md hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {submitting ? 'Confirming appointment...' : 'Confirm Appointment'}
            </button>
          </form>

          {/* Right Summary Column */}
          <div className="lg:col-span-4 sticky top-28 bg-zinc-900 border border-zinc-800/80 p-6 rounded-xl space-y-6">
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[#D4AF37] border-b border-zinc-800 pb-3">
              Booking Summary
            </h3>
            
            {selectedServices.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                  No services selected. Return to the Catalog to choose your treatments.
                </p>
                <Link
                  to="/catalog"
                  className="inline-flex items-center gap-2 bg-[#D4AF37] hover:bg-[#F3C65F] text-zinc-950 font-bold text-xs uppercase tracking-widest px-5 py-2.5 rounded-lg transition-all"
                >
                  <FiArrowLeft />
                  Go to Catalog
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider block mb-1">Selected Services</span>
                
                <div className="divide-y divide-zinc-800 space-y-2">
                  {selectedServices.map(srv => (
                    <div key={srv._id} className="pt-2 first:pt-0 flex justify-between gap-3 text-xs">
                      <div>
                        <h4 className="font-semibold uppercase tracking-wider text-white line-clamp-1 max-w-[180px]">{srv.name}</h4>
                        <span className="text-[10px] text-zinc-400">{srv.duration} mins</span>
                      </div>
                      <span className="font-mono text-[#D4AF37] font-semibold whitespace-nowrap">₹{srv.price}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-zinc-800 pt-4 mt-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Total Duration:</span>
                    <span className="text-white font-semibold">{totalDuration} mins</span>
                  </div>
                  <div className="flex justify-between text-sm pt-1 border-t border-zinc-800/60 mt-1">
                    <span className="text-[#D4AF37] font-semibold">Total Amount:</span>
                    <span className="text-[#D4AF37] font-heading font-bold">₹{totalAmount}</span>
                  </div>
                </div>

                <Link
                  to="/catalog"
                  className="flex items-center gap-1.5 text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors mt-2"
                >
                  <FiArrowLeft className="text-xs" />
                  Modify selection
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ScheduleAppointment;
