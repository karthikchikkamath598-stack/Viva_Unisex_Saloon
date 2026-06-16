import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { FiUser, FiCalendar, FiClock, FiInfo, FiArrowLeft, FiPhone, FiChevronDown } from 'react-icons/fi';
import CalendarDatePicker from '../components/CalendarDatePicker';

const defaultSlots = [
  "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM",
  "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"
];

const staticStaff = [
  {
    id: "staff_fardeen",
    name: "Fardeen",
    specialty: "Master Barber & Hair Artisan",
    imageUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=600",
    rating: "4.9",
    skills: "Precision Fades, Classic Shaves, Hair Styling"
  },
  {
    id: "staff_hussain",
    name: "Hussain",
    specialty: "Hair Colorist & Stylist",
    imageUrl: "https://images.unsplash.com/photo-1595894155162-e0709be9b595?auto=format&fit=crop&q=80&w=600",
    rating: "4.8",
    skills: "Balayage, Highlighting, Modern Hair Coloring"
  },
  {
    id: "staff_sandhya",
    name: "Sandhya",
    specialty: "Skin Care Expert & Hair Stylist",
    imageUrl: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&q=80&w=600",
    rating: "5.0",
    skills: "Advanced Facials, Skin Treatment, Bridal Styling"
  }
];

const ScheduleAppointment = () => {
  const { API_URL } = useContext(AuthContext);
  const navigate = useNavigate();

  // Selected services from BookingContext
  const { selectedServices, totalAmount, totalDuration, clearBooking, setSelectedServices } = useBooking();

  // Customer details form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  
  // Services List State
  const [allServices, setAllServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [servicesLoading, setServicesLoading] = useState(true);
  
  // Appointment date/time state
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [notes, setNotes] = useState('');
  
  // Staff Selection States
  const [selectedStaff, setSelectedStaff] = useState('');
  
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Load available services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get(`${API_URL}/services`);
        if (res.data.success && res.data.services.length > 0) {
          setAllServices(res.data.services);
          
          // Pre-populate service dropdown if service exists in booking context
          if (selectedServices.length > 0) {
            setSelectedServiceId(selectedServices[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch services:', err);
      } finally {
        setServicesLoading(false);
      }
    };
    fetchServices();
  }, [API_URL, selectedServices]);

  // Sync BookingContext when selected dropdown service changes
  const handleServiceChange = (e) => {
    const srvId = e.target.value;
    setSelectedServiceId(srvId);
    const matched = allServices.find(s => s._id === srvId);
    if (matched) {
      setSelectedServices([matched]);
    } else {
      setSelectedServices([]);
    }
  };

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
      setError('Please select a service for your ritual.');
      return;
    }
    if (!name.trim()) {
      setError('Please fill out your name.');
      return;
    }
    if (!phone.trim()) {
      setError('Please fill out your mobile number.');
      return;
    }
    if (!selectedDate || !selectedSlot) {
      setError('Please select a date and an available time slot.');
      return;
    }
    if (!selectedStaff) {
      setError('Please choose your preferred staff member.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const payload = {
        customerName: name,
        mobileNumber: phone,
        service: selectedServices[0]?.name || '',
        staffMember: selectedStaff,
        appointmentDate: selectedDate,
        appointmentTime: selectedSlot,
        notes: notes || '',
        bookingStatus: 'Pending'
      };

      const res = await axios.post(`${API_URL}/appointments`, payload);
      if (res.data.success) {
        // Clear booking context
        clearBooking();
        
        // Redirect to success page with booking details
        navigate('/booking-success', {
          state: {
            bookingId: res.data.appointment._id,
            customerName: name,
            mobileNumber: phone,
            service: payload.service,
            staffMember: selectedStaff,
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
      <div className="max-w-7xl mx-auto px-6 mt-6">
        <div className="text-center mb-10">
          <span className="text-[#D4AF37] text-xs uppercase tracking-[0.3em] font-semibold mb-2 block animate-pulse">
            Reserve Your Appointment Today
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-widest uppercase">
            Book Your <span className="text-gold-gradient font-extrabold">Premium Salon Experience</span>
          </h1>
          <p className="text-xs text-zinc-500 font-light mt-2">
            No registration required. Book your luxury salon session directly in less than 30 seconds.
          </p>
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
            <div className="bg-zinc-900 border border-zinc-800/80 p-6 rounded-xl space-y-4 shadow-xl">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[#D4AF37] border-b border-zinc-800 pb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-xs flex items-center justify-center font-bold">1</span>
                Customer Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">Customer Name *</label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-3 pl-10 pr-4 text-sm focus:border-[#D4AF37] outline-none text-white transition-colors"
                      placeholder="Enter your name"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">Mobile Number *</label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-3 pl-10 pr-4 text-sm focus:border-[#D4AF37] outline-none text-white transition-colors"
                      placeholder="Enter 10-digit mobile number"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Select Service */}
            <div className="bg-zinc-900 border border-zinc-800/80 p-6 rounded-xl space-y-4 shadow-xl">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[#D4AF37] border-b border-zinc-800 pb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-xs flex items-center justify-center font-bold">2</span>
                Select Service
              </h3>
              
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold mb-1 block">Choose Salon Treatment *</label>
                {servicesLoading ? (
                  <div className="p-3 bg-zinc-950/40 text-center text-xs text-zinc-400 border border-zinc-800/50 rounded-lg">
                    Loading treatments catalog...
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      value={selectedServiceId}
                      onChange={handleServiceChange}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-3 text-sm focus:border-[#D4AF37] outline-none text-white transition-colors cursor-pointer appearance-none"
                      required
                    >
                      <option value="">-- Choose a Service --</option>
                      {allServices.map(srv => (
                        <option key={srv._id} value={srv._id}>
                          {srv.name} (₹{srv.price})
                        </option>
                      ))}
                    </select>
                    <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                  </div>
                )}
              </div>
            </div>

            {/* Step 3: Choose Your Preferred Staff Member */}
            <div className="bg-zinc-900 border border-zinc-800/80 p-6 rounded-xl space-y-4 shadow-xl">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[#D4AF37] border-b border-zinc-800 pb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-xs flex items-center justify-center font-bold">3</span>
                Select Staff Member *
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {staticStaff.map((st) => {
                  const isSelected = selectedStaff === st.name;
                  return (
                    <button
                      type="button"
                      key={st.id}
                      onClick={() => setSelectedStaff(st.name)}
                      className={`flex flex-col text-left rounded-xl overflow-hidden border transition-all duration-300 relative bg-zinc-950/45 group cursor-pointer ${
                        isSelected 
                          ? 'border-[#D4AF37] shadow-gold-glow scale-[1.02]' 
                          : 'border-zinc-850 hover:border-[#D4AF37]/45'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3 bg-[#D4AF37] text-zinc-950 text-[9px] uppercase font-black px-2 py-0.5 rounded shadow z-10">
                          Selected
                        </div>
                      )}
                      
                      <div className="h-40 overflow-hidden relative w-full border-b border-white/5">
                        <img 
                          src={st.imageUrl} 
                          alt={st.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 to-transparent" />
                      </div>

                      <div className="p-4 w-full flex-grow flex flex-col justify-between">
                        <div>
                          <h4 className="font-heading font-bold text-sm text-white uppercase group-hover:text-[#D4AF37] transition-colors">{st.name}</h4>
                          <p className="text-[10px] text-zinc-400 font-light mt-1 uppercase tracking-wider line-clamp-1">{st.specialty}</p>
                        </div>
                        <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2.5">
                          <span className="text-[10px] text-[#D4AF37] font-semibold flex items-center gap-1">★ {st.rating}</span>
                          <span className="text-[9px] text-zinc-500 uppercase tracking-widest">Available</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 4: Date & Slot Selection */}
            <div className="bg-zinc-900 border border-zinc-800/80 p-6 rounded-xl space-y-4 shadow-xl">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[#D4AF37] border-b border-zinc-800 pb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-xs flex items-center justify-center font-bold">4</span>
                Select Date & Time Slot
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1 flex flex-col justify-end">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold mb-1.5">Select Date *</label>
                  <CalendarDatePicker
                    selectedDate={selectedDate}
                    onChange={(date) => {
                      setSelectedDate(date);
                    }}
                    minDate={getMinDate()}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold mb-1.5 block">Select Time Slot *</label>
                  
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

            {/* Step 5: Special Notes */}
            <div className="bg-zinc-900 border border-zinc-800/80 p-6 rounded-xl space-y-4 shadow-xl">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[#D4AF37] border-b border-zinc-800 pb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-xs flex items-center justify-center font-bold">5</span>
                Special Notes (Optional)
              </h3>
              
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">Additional Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-3 text-sm focus:border-[#D4AF37] outline-none text-white transition-colors h-24 resize-none"
                  placeholder="Share any special instructions or requirements..."
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || selectedServices.length === 0}
              className="w-full py-3.5 bg-black hover:bg-zinc-950 text-[#D4AF37] border border-[#D4AF37] hover:border-[#FFD700] hover:text-white font-body font-bold text-xs uppercase tracking-widest rounded-lg transition-all shadow-md hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {submitting ? 'Confirming appointment...' : 'Confirm Appointment'}
            </button>
          </form>

          {/* Right Summary Column */}
          <div className="lg:col-span-4 sticky top-28 bg-zinc-900 border border-zinc-800/80 p-6 rounded-xl space-y-6 shadow-xl">
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[#D4AF37] border-b border-zinc-800 pb-3">
              Booking Summary
            </h3>
            
            {selectedServices.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-xs text-zinc-400 mb-4 leading-relaxed font-light">
                  Please select a service to see summary details and price pricing estimations.
                </p>
                <Link
                  to="/catalog"
                  className="inline-flex items-center gap-2 bg-[#D4AF37] hover:bg-[#F3C65F] text-zinc-950 font-bold text-xs uppercase tracking-widest px-5 py-2.5 rounded-lg transition-all"
                >
                  <FiArrowLeft />
                  View Catalog
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-semibold">Treatment Information</span>
                
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
                  <div className="flex justify-between text-zinc-400">
                    <span>Total Duration:</span>
                    <span className="text-white font-semibold">{totalDuration} mins</span>
                  </div>
                  <div className="flex justify-between text-sm pt-1 border-t border-zinc-800/60 mt-1">
                    <span className="text-[#D4AF37] font-semibold">Estimated Amount:</span>
                    <span className="text-[#D4AF37] font-heading font-bold">₹{totalAmount}</span>
                  </div>
                </div>

                <Link
                  to="/catalog"
                  className="flex items-center gap-1.5 text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors mt-2"
                >
                  <FiArrowLeft className="text-xs" />
                  View service catalog
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
