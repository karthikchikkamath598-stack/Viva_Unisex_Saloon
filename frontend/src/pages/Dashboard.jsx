import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { FiCalendar, FiClock, FiUser, FiBookmark, FiLogOut, FiDollarSign } from 'react-icons/fi';
import { FaCrown, FaStar, FaTrash } from 'react-icons/fa';

const Dashboard = () => {
  const { user, logout, API_URL } = useContext(AuthContext);

  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelLoadingId, setCancelLoadingId] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [appRes, srvRes] = await Promise.all([
          axios.get(`${API_URL}/appointments/my-bookings`),
          axios.get(`${API_URL}/services`)
        ]);

        if (appRes.data.success) {
          setAppointments(appRes.data.appointments);
        }
        if (srvRes.data.success) {
          setServices(srvRes.data.services);
        }
      } catch (err) {
        console.error('Error fetching dashboard records', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [API_URL]);

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment ritual?')) return;
    setCancelLoadingId(id);
    try {
      const res = await axios.put(`${API_URL}/appointments/${id}/status`, { status: 'cancelled' });
      if (res.data.success) {
        // Update local status
        setAppointments(prev => 
          prev.map(app => app._id === id ? { ...app, status: 'cancelled' } : app)
        );
      }
    } catch (err) {
      alert('Error cancelling booking: ' + (err.response?.data?.message || err.message));
    } finally {
      setCancelLoadingId(null);
    }
  };

  // Filter bookmarked service details
  const savedServicesDetails = services.filter(s => user?.savedServices?.includes(s._id));

  // Determine membership gold/silver card styling
  const cardGradient = user?.membershipType === 'VIP' 
    ? 'from-[#aa7c11] via-[#d4a437] to-[#ffd700]' 
    : user?.membershipType === 'Platinum'
      ? 'from-[#708090] via-[#afeee6] to-[#e6e6fa]'
      : user?.membershipType === 'Gold'
        ? 'from-[#b8860b] via-[#d4a437] to-[#eee8aa]'
        : 'from-[#333333] via-[#4f4f4f] to-[#1a1a1a]';

  return (
    <div className="pt-24 min-h-screen bg-viva-black pb-16 font-body">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: Profile card and VIP Membership */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Membership Elite Card Mockup */}
          <div className={`p-6 rounded-2xl bg-gradient-to-br ${cardGradient} text-viva-black shadow-lg relative overflow-hidden h-52 flex flex-col justify-between select-none`}>
            {/* Background elements */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-4 right-4 text-6xl opacity-15">
              <FaCrown />
            </div>

            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-viva-black/60">VIVA Elite Membership</p>
                <h3 className="font-heading text-2xl font-black tracking-widest mt-1">
                  {user?.membershipType || 'Regular'}
                </h3>
              </div>
              <FaCrown className="text-xl text-viva-black/85" />
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-viva-black/75">Club Member</p>
              <h4 className="font-heading text-lg font-bold tracking-wider mt-0.5">{user?.name}</h4>
            </div>

            <div className="flex justify-between items-center border-t border-black/10 pt-3 text-xs">
              <div>
                <span className="block text-[9px] uppercase font-bold text-viva-black/60">Loyalty Points</span>
                <span className="font-bold text-sm">{user?.membershipPoints || 0} pts</span>
              </div>
              <div className="text-right">
                <span className="block text-[9px] uppercase font-bold text-viva-black/60">Registered ID</span>
                <span className="font-mono text-[10px]">{user?._id?.substring(0, 10)}...</span>
              </div>
            </div>
          </div>

          {/* User profile list details */}
          <div className="bg-viva-charcoal border border-viva-gold/10 p-6 rounded-lg">
            <h4 className="font-heading text-base font-bold text-viva-gold uppercase tracking-wider mb-4">Account Profile</h4>
            <div className="space-y-4 text-xs">
              <div className="border-b border-white/5 pb-2">
                <span className="block text-viva-gray text-[10px] uppercase">Full Name</span>
                <span className="text-viva-white font-medium">{user?.name}</span>
              </div>
              <div className="border-b border-white/5 pb-2">
                <span className="block text-viva-gray text-[10px] uppercase">Registered Email</span>
                <span className="text-viva-white font-medium">{user?.email}</span>
              </div>
              <div className="border-b border-white/5 pb-2">
                <span className="block text-viva-gray text-[10px] uppercase">Phone Node</span>
                <span className="text-viva-white font-medium">{user?.phone || 'Not Provided'}</span>
              </div>
            </div>

            <button
              onClick={logout}
              className="w-full mt-8 py-2.5 border border-red-900/40 text-red-300 hover:bg-red-950/20 hover:border-red-950 text-xs uppercase tracking-widest rounded transition-all duration-300 flex items-center justify-center gap-2"
            >
              <FiLogOut />
              <span>Log out session</span>
            </button>
          </div>

        </div>

        {/* Right column: Active Bookings & Bookmarks */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Section 1: Bookings List */}
          <div className="bg-viva-charcoal border border-viva-gold/10 p-6 rounded-lg">
            <h3 className="font-heading text-xl font-bold uppercase tracking-wider text-viva-gold mb-6">
              Active Booking Rituals
            </h3>

            {loading ? (
              <div className="text-center py-10">
                <div className="w-8 h-8 border-3 border-viva-gold border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <span className="text-xs text-viva-gray">Accessing bookings...</span>
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-10 bg-viva-black/35 rounded border border-white/5">
                <p className="text-xs text-viva-gray mb-4">No scheduled grooming appointments found.</p>
                <Link
                  to="/booking"
                  className="inline-block bg-viva-gold text-viva-black text-xs font-bold uppercase tracking-widest px-6 py-2.5 rounded shadow-gold-glow"
                >
                  Create Appointment
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((app) => (
                  <div 
                    key={app._id} 
                    className="p-4 bg-viva-black/60 border border-white/5 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      {/* Services booked */}
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {app.serviceDetails?.map((srv, idx) => (
                          <span key={idx} className="bg-viva-charcoal text-viva-white text-[9px] uppercase tracking-wider px-2 py-0.5 rounded border border-white/5">
                            {srv.name}
                          </span>
                        ))}
                      </div>
                      
                      {/* Booking meta */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-viva-gray">
                        <span className="flex items-center gap-1"><FiCalendar className="text-viva-gold" /> {app.date}</span>
                        <span className="flex items-center gap-1"><FiClock className="text-viva-gold" /> {app.timeSlot}</span>
                        <span className="flex items-center gap-1"><FiUser className="text-viva-gold" /> {app.stylistName}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-white/5">
                      {/* Pricing */}
                      <div className="text-right">
                        <span className="block text-[9px] text-viva-gray uppercase">Total</span>
                        <span className="font-heading text-viva-gold font-bold text-base">₹{app.totalAmount}</span>
                      </div>

                      {/* Status pill */}
                      <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded ${
                        app.status === 'confirmed' 
                          ? 'bg-green-950/40 text-green-300 border border-green-900/40' 
                          : app.status === 'cancelled' 
                            ? 'bg-red-950/40 text-red-300 border border-red-900/40' 
                            : app.status === 'completed'
                              ? 'bg-blue-950/40 text-blue-300 border border-blue-900/40'
                              : 'bg-yellow-950/40 text-yellow-300 border border-yellow-900/40'
                      }`}>
                        {app.status}
                      </span>

                      {/* Cancel option */}
                      {app.status === 'pending' && (
                        <button
                          disabled={cancelLoadingId === app._id}
                          onClick={() => handleCancelBooking(app._id)}
                          className="p-2 bg-red-950/20 hover:bg-red-950/50 border border-red-900/30 text-red-400 rounded transition-colors"
                          title="Cancel Booking"
                        >
                          {cancelLoadingId === app._id ? (
                            <div className="w-3.5 h-3.5 border border-red-400 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <FaTrash className="text-xs" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Bookmarked/Saved Services */}
          <div className="bg-viva-charcoal border border-viva-gold/10 p-6 rounded-lg">
            <h3 className="font-heading text-xl font-bold uppercase tracking-wider text-viva-gold mb-6 flex items-center gap-2">
              <FiBookmark /> Bookmarked Rituals
            </h3>

            {savedServicesDetails.length === 0 ? (
              <div className="text-center py-6 text-xs text-viva-gray">
                No bookmarked services yet. Explore the menu to save favorites!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedServicesDetails.map(srv => (
                  <div key={srv._id} className="p-4 bg-viva-black/60 border border-white/5 rounded-lg flex items-center justify-between">
                    <div>
                      <h4 className="font-heading font-bold text-sm text-viva-white uppercase">{srv.name}</h4>
                      <span className="text-[10px] text-viva-gold font-bold block mt-1">₹{srv.price} &bull; {srv.duration} Mins</span>
                    </div>
                    <Link
                      to={`/booking?service=${srv._id}`}
                      className="bg-viva-gold/10 hover:bg-viva-gold border border-viva-gold/30 hover:border-viva-gold text-viva-gold hover:text-viva-black px-3 py-1.5 rounded text-[10px] uppercase font-bold tracking-wider transition-colors duration-300"
                    >
                      Book
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;
