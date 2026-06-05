import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { FiUser, FiCalendar, FiClock, FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import SplitText from '../components/SplitText';

// Fallback data
const fallbackStylists = [
  { _id: "stylist_1", name: "Alex Gold", specialty: "Hair Styling & Color Design", rating: 5.0, imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400" },
  { _id: "stylist_2", name: "Sophia Rose", specialty: "Bridal Makeup & Premium Facials", rating: 4.9, imageUrl: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&q=80&w=400" },
  { _id: "stylist_3", name: "Marcus Beard", specialty: "Men's Luxury Grooming & Styling", rating: 4.8, imageUrl: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=400" },
  { _id: "stylist_4", name: "Chloe Nails", specialty: "Nail Art & Luxury Spa Services", rating: 4.7, imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=400" }
];

const fallbackServices = [
  { _id: "service_1", name: "Premium Haircut & Styling (Men)", category: "Hair Services", price: 299, duration: 45 },
  { _id: "service_2", name: "Designer Cut & Blowout (Women)", category: "Hair Services", price: 499, duration: 60 },
  { _id: "service_3", name: "Organic Keratin Infusion", category: "Hair Services", price: 3499, duration: 120 },
  { _id: "service_5", name: "Golden Elixir Hydra Facial", category: "Skin Services", price: 1599, duration: 75 },
  { _id: "service_7", name: "Royal Beard Grooming & Sculpt", category: "Grooming", price: 299, duration: 30 },
  { _id: "service_9", name: "Signature Gel Manicure", category: "Nail Services", price: 499, duration: 40 },
  { _id: "service_11", name: "Imperial Bridal Makeover & Styling", category: "Bridal Services", price: 7999, duration: 180 }
];

const defaultSlots = [
  "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", 
  "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", 
  "05:00 PM", "06:00 PM", "07:00 PM"
];

// Success Gold Confetti Animation
const SuccessParticles = () => {
  const [particles, setParticles] = useState([]);
  
  useEffect(() => {
    const tempParticles = Array.from({ length: 70 }).map((_, i) => ({
      id: i,
      x: 50,
      y: 40,
      angle: Math.random() * Math.PI * 2,
      speed: Math.random() * 6 + 2.5,
      size: Math.random() * 5 + 1.5,
      opacity: 1,
      color: Math.random() > 0.45 
        ? '#D4A437' 
        : Math.random() > 0.4 
          ? '#F5C65D' 
          : '#FFFFFF'
    }));
    setParticles(tempParticles);
    
    const interval = setInterval(() => {
      setParticles(prev => 
        prev.map(p => {
          const nextOpacity = p.opacity - 0.015;
          return {
            ...p,
            x: p.x + Math.cos(p.angle) * p.speed * 0.45,
            y: p.y + Math.sin(p.angle) * p.speed * 0.45 + 1.2, // gravity pulling down
            opacity: nextOpacity > 0 ? nextOpacity : 0
          };
        }).filter(p => p.opacity > 0)
      );
    }, 16);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[2]">
      {particles.map(p => (
        <div 
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            backgroundColor: p.color,
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 10px rgba(212, 164, 55, 0.4)'
          }}
        />
      ))}
    </div>
  );
};

const Booking = () => {
  const [searchParams] = useSearchParams();
  const { user, token, API_URL } = useContext(AuthContext);
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [stylists, setStylists] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selections
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedStylist, setSelectedStylist] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [error, setError] = useState('');

  // Auth Redirect check
  useEffect(() => {
    if (!token && !user) {
      navigate('/login?redirect=booking');
    }
  }, [token, user, navigate]);

  // Fetch initial services & stylists
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [srvRes, styRes] = await Promise.all([
          axios.get(`${API_URL}/services`),
          axios.get(`${API_URL}/stylists`)
        ]);

        if (srvRes.data.success) setServices(srvRes.data.services);
        else setServices(fallbackServices);

        if (styRes.data.success) setStylists(styRes.data.stylists);
        else setStylists(fallbackStylists);

      } catch (err) {
        console.error('Error fetching booking data:', err);
        setServices(fallbackServices);
        setStylists(fallbackStylists);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [API_URL]);

  // Pre-fill selected services from query params
  useEffect(() => {
    if (services.length > 0) {
      const qSingle = searchParams.get('service');
      const qMulti = searchParams.get('services');
      
      let preselectedIds = [];
      if (qMulti) {
        preselectedIds = qMulti.split(',');
      } else if (qSingle) {
        preselectedIds = [qSingle];
      }

      if (preselectedIds.length > 0) {
        const found = services.filter(s => preselectedIds.includes(s._id));
        Promise.resolve().then(() => {
          setSelectedServices(found);
        });
      }
    }
  }, [services, searchParams]);

  // Fetch available slots when stylist and date are selected
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedStylist || !selectedDate) return;
      setSlotsLoading(true);
      setSelectedSlot('');
      try {
        const res = await axios.get(`${API_URL}/appointments/slots`, {
          params: { stylistId: selectedStylist._id, date: selectedDate }
        });
        if (res.data.success) {
          setSlots(res.data.slots);
        } else {
          setSlots(defaultSlots.map(s => ({ slot: s, isAvailable: true })));
        }
      } catch (err) {
        console.error('Error fetching slot records:', err);
        setSlots(defaultSlots.map(s => ({ slot: s, isAvailable: true })));
      } finally {
        setSlotsLoading(false);
      }
    };
    fetchSlots();
  }, [selectedStylist, selectedDate, API_URL]);

  // Calculations
  const totalPrice = selectedServices.reduce((acc, curr) => acc + curr.price, 0);
  const totalDuration = selectedServices.reduce((acc, curr) => acc + curr.duration, 0);

  const toggleService = (srv) => {
    setSelectedServices(prev => {
      const exists = prev.some(s => s._id === srv._id);
      if (exists) {
        return prev.filter(s => s._id !== srv._id);
      } else {
        return [...prev, srv];
      }
    });
  };

  const handleNext = () => {
    if (step === 1 && selectedServices.length === 0) {
      setError('Please select at least one treatment service.');
      return;
    }
    if (step === 2 && !selectedStylist) {
      setError('Please select a master stylist.');
      return;
    }
    if (step === 3) {
      if (!selectedDate || !selectedSlot) {
        setError('Please select both a date and an available timeslot.');
        return;
      }
      const day = new Date(selectedDate).getUTCDay();
      if (day === 2) {
        setError('The salon is closed on Tuesdays. Please select another date.');
        return;
      }
    }
    setError('');
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(prev => prev - 1);
  };

  const submitBooking = async () => {
    setError('');
    try {
      const payload = {
        services: selectedServices.map(s => s._id),
        stylistId: selectedStylist._id,
        date: selectedDate,
        timeSlot: selectedSlot,
        notes
      };

      const res = await axios.post(`${API_URL}/appointments`, payload);
      if (res.data.success) {
        setBookingSuccess(true);
      } else {
        setError(res.data.message || 'Booking failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error compiling booking request.');
    }
  };

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-viva-black flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-viva-gold border-t-transparent rounded-full animate-spin shadow-gold-glow mb-4"></div>
        <p className="font-heading text-viva-gold tracking-widest text-xs uppercase animate-pulse">Entering Sanctuary...</p>
      </div>
    );
  }

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-viva-black flex items-center justify-center px-6 relative">
        {/* Confetti Sparkles explosion */}
        <SuccessParticles />

        <motion.div 
          className="max-w-md w-full bg-viva-charcoal border border-viva-gold/30 p-8 rounded-lg text-center shadow-gold-glow-lg relative overflow-hidden z-10"
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 180 }}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gold-gradient" />
          
          {/* Animated Gold Checkmark Path */}
          <div className="w-24 h-24 mx-auto mb-6">
            <svg className="w-full h-full transform -rotate-9" viewBox="0 0 50 50">
              <motion.circle 
                cx="25" 
                cy="25" 
                r="21" 
                stroke="#D4A437" 
                strokeWidth="2.5" 
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
              <motion.path
                d="M15 26 l7 7 l14 -14"
                stroke="#D4A437"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.6, duration: 0.5, ease: "easeOut" }}
              />
            </svg>
          </div>
          
          <h2 className="font-heading text-3xl font-bold uppercase tracking-widest text-viva-white mb-4">Ritual Scheduled</h2>
          <p className="text-sm text-viva-gray mb-8 leading-relaxed font-light">
            Your appointment has been logged successfully. An administrative confirm notification has been dispatched to your profile.
          </p>

          <div className="bg-viva-black p-4 rounded border border-white/5 text-left text-xs space-y-2 mb-8">
            <p className="text-viva-gray">Date: <span className="text-viva-white font-semibold">{selectedDate}</span></p>
            <p className="text-viva-gray">Time: <span className="text-viva-white font-semibold">{selectedSlot}</span></p>
            <p className="text-viva-gray">Stylist: <span className="text-viva-gold font-semibold">{selectedStylist.name}</span></p>
            <p className="text-viva-gray">Estimated Total: <span className="text-viva-gold font-semibold">₹{totalPrice}</span></p>
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="gold-shimmer text-viva-black font-body font-bold text-xs uppercase tracking-widest py-3 px-8 rounded shadow-gold-glow hover:scale-105 transition-transform duration-300"
          >
            Open Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-viva-black pb-16 font-body">
      <div className="max-w-5xl mx-auto px-6">
        {/* Progress header */}
        <div className="mb-12 text-center">
          <span className="text-viva-gold font-body text-xs uppercase tracking-[0.3em] font-semibold mb-3 block overflow-hidden">
            <SplitText text="BOOKING ENGINE" type="char" />
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-widest uppercase mb-6">Schedule Your Makeover</h1>
          
          {/* Steps Navigator */}
          <div className="flex items-center justify-center max-w-lg mx-auto mt-8">
            {[1, 2, 3, 4].map(s => (
              <React.Fragment key={s}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border text-xs font-bold transition-all duration-300 ${
                  step === s 
                    ? 'bg-viva-gold border-viva-gold text-viva-black shadow-gold-glow' 
                    : step > s 
                      ? 'bg-viva-black border-viva-gold text-viva-gold' 
                      : 'bg-viva-charcoal border-white/10 text-viva-gray'
                }`}>
                  {s}
                </div>
                {s < 4 && (
                  <div className={`h-[1px] flex-grow transition-all duration-300 ${step > s ? 'bg-viva-gold' : 'bg-white/10'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-between max-w-lg mx-auto text-[9px] uppercase tracking-widest text-viva-gray mt-2 px-1">
            <span>Treatments</span>
            <span>Stylist</span>
            <span>DateTime</span>
            <span>Review</span>
          </div>
        </div>

        {/* Morphing / Shaking Validation Alerts */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              key={error}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: [0, -8, 8, -6, 6, 0] }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="bg-red-950/40 border border-red-800 text-red-200 p-4 rounded text-xs mb-8 text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Wizard Steps Containers */}
        <div className="bg-viva-charcoal border border-viva-gold/10 p-6 sm:p-10 rounded-lg shadow-gold-glow relative">
          
          {/* STEP 1: Select Services */}
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="font-heading text-xl font-bold text-viva-gold uppercase tracking-wider mb-6">Select Treatments</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[380px] overflow-y-auto pr-2">
                {services.map(srv => {
                  const isChecked = selectedServices.some(s => s._id === srv._id);
                  return (
                    <div 
                      key={srv._id}
                      onClick={() => toggleService(srv)}
                      className={`p-4 rounded border cursor-pointer transition-all flex items-center justify-between ${
                        isChecked 
                          ? 'bg-viva-black border-viva-gold shadow-gold-glow' 
                          : 'bg-viva-black/40 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div>
                        <h4 className="font-heading font-bold text-sm text-viva-white uppercase">{srv.name}</h4>
                        <span className="text-[10px] text-viva-gold mt-1 block">₹{srv.price} &bull; {srv.duration} Mins</span>
                      </div>
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                        isChecked ? 'bg-viva-gold border-viva-gold text-viva-black' : 'border-white/20'
                      }`}>
                        {isChecked && <span className="text-xs font-bold">&#10003;</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Choose Stylist */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="font-heading text-xl font-bold text-viva-gold uppercase tracking-wider mb-6">Choose Master Stylist</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {stylists.map(sty => (
                  <div
                    key={sty._id}
                    onClick={() => setSelectedStylist(sty)}
                    className={`p-4 rounded border cursor-pointer transition-all flex gap-4 items-center ${
                      selectedStylist?._id === sty._id 
                        ? 'bg-viva-black border-viva-gold shadow-gold-glow' 
                        : 'bg-viva-black/40 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <img src={sty.imageUrl} alt={sty.name} className="w-16 h-16 rounded-full object-cover border border-white/10" />
                    <div>
                      <h4 className="font-heading font-bold text-base text-viva-white uppercase">{sty.name}</h4>
                      <p className="text-[10px] text-viva-gold tracking-wider mt-0.5">{sty.specialty}</p>
                      <p className="text-[10px] text-viva-gray mt-1">{sty.rating} ★ Rated</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Choose Date & Time */}
          {step === 3 && (
            <div className="space-y-8">
              <h3 className="font-heading text-xl font-bold text-viva-gold uppercase tracking-wider mb-6">Select Date & Time</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Date Input with Floating Label */}
                 <div className="flex flex-col justify-end pb-1.5">
                  <div className="floating-label-group">
                    <input
                      type="date"
                      min={getMinDate()}
                      value={selectedDate}
                      placeholder=" "
                      id="appointment-date"
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val) {
                          const day = new Date(val).getUTCDay();
                          if (day === 2) {
                            setError('The salon is closed on Tuesdays. Please select another date.');
                            setSelectedDate('');
                            setSelectedSlot('');
                            setSlots([]);
                          } else {
                            setError('');
                            setSelectedDate(val);
                          }
                        } else {
                          setSelectedDate('');
                        }
                      }}
                      className="viva-input-morphed w-full cursor-pointer pt-4.5 pb-3"
                    />
                    <label htmlFor="appointment-date" className="flex items-center gap-2">
                      Select Appointment Date
                    </label>
                  </div>
                </div>

                {/* Slots Grid */}
                <div className="flex flex-col">
                  <label className="text-xs uppercase tracking-widest text-viva-gray mb-3 flex items-center gap-2">Select Timeslot</label>
                  
                  {!selectedDate ? (
                    <div className="p-4 bg-viva-black/35 text-center text-xs text-viva-gray border border-white/5 rounded">
                      Please pick a date first to display availability.
                    </div>
                  ) : slotsLoading ? (
                    <div className="text-center py-6">
                      <div className="w-6 h-6 border-2 border-viva-gold border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <span className="text-[10px] text-viva-gray">Verifying calendar slots...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {slots.map(({ slot, isAvailable }) => (
                        <button
                          key={slot}
                          disabled={!isAvailable}
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-2 px-1 text-center rounded text-[10px] font-mono tracking-wider transition-all duration-300 border ${
                            selectedSlot === slot 
                              ? 'bg-viva-gold border-viva-gold text-viva-black font-bold shadow-gold-glow'
                              : isAvailable 
                                ? 'bg-viva-black border-white/5 hover:border-viva-gold/40 text-viva-white'
                                : 'bg-viva-black/20 border-transparent text-viva-gray/30 line-through cursor-not-allowed'
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
          )}

          {/* STEP 4: Review Booking Summary */}
          {step === 4 && (
            <div className="space-y-8">
              <h3 className="font-heading text-xl font-bold text-viva-gold uppercase tracking-wider mb-6">Review Ritual Summary</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Details list */}
                <div className="space-y-4 bg-viva-black/60 p-6 rounded border border-white/5">
                  <div className="flex items-center gap-3 text-xs pb-3 border-b border-white/5">
                    <span className="text-viva-gray">Schedule Date:</span>
                    <span className="text-viva-white font-bold ml-auto">{selectedDate}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs pb-3 border-b border-white/5">
                    <span className="text-viva-gray">Timeslot:</span>
                    <span className="text-viva-white font-bold ml-auto">{selectedSlot}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs pb-3 border-b border-white/5">
                    <FiUser className="text-viva-gold" />
                    <span className="text-viva-gray">Master Stylist:</span>
                    <span className="text-viva-gold font-bold ml-auto">{selectedStylist.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs pb-3 border-b border-white/5">
                    <span className="text-viva-gray">Duration Estimate:</span>
                    <span className="text-viva-white font-bold ml-auto">{totalDuration} Minutes</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm pt-2">
                    <span className="text-viva-white font-bold">Total Amount Estimate:</span>
                    <span className="text-viva-gold font-heading font-black text-lg ml-auto">₹{totalPrice}</span>
                  </div>
                </div>

                {/* Notes Floating Textarea */}
                <div className="flex flex-col space-y-3">
                  <div className="floating-label-group">
                    <textarea
                      placeholder=" "
                      id="bespoke-notes"
                      rows={5}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="viva-input-morphed w-full resize-none pt-4 pb-3"
                    />
                    <label htmlFor="bespoke-notes">Bespoke Notes / Requirements</label>
                  </div>
                  <p className="text-[10px] text-viva-gray font-light mt-2">
                    * By scheduling this appointment, you unlock loyalty cashpoints on completion.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation buttons inside card */}
          <div className="flex items-center justify-between border-t border-white/5 pt-8 mt-10">
            {step > 1 ? (
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 border border-white/10 hover:border-viva-gold text-viva-white hover:text-viva-gold px-5 py-2.5 rounded text-xs uppercase tracking-widest transition-all"
              >
                <FiChevronLeft /> Back
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 bg-viva-gold hover:bg-viva-goldLight text-viva-black px-6 py-2.5 rounded text-xs uppercase font-bold tracking-widest shadow-gold-glow hover:scale-105 transition-all"
              >
                Next <FiChevronRight />
              </button>
            ) : (
              <button
                onClick={submitBooking}
                className="gold-shimmer text-viva-black font-body font-bold text-xs uppercase tracking-widest px-8 py-3 rounded shadow-gold-glow hover:scale-105 transition-all duration-300"
              >
                Schedule Appointment
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Booking;
