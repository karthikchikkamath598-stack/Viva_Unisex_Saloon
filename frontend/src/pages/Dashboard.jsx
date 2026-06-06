import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { FiCalendar, FiClock, FiUser, FiBookmark, FiLogOut, FiX } from 'react-icons/fi';
import { FaTrash } from 'react-icons/fa';

const Dashboard = () => {
  const { user, logout, updateProfile, API_URL } = useContext(AuthContext);
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelLoadingId, setCancelLoadingId] = useState(null);

  // Edit Profile States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditEmail(user.email || '');
      setEditPhone(user.phone || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditSuccess('');
    setUpdatingProfile(true);

    try {
      const res = await updateProfile(editName, editEmail, editPhone);
      if (res.success) {
        setEditSuccess('Profile updated successfully!');
        setTimeout(() => {
          setShowEditModal(false);
          setEditSuccess('');
        }, 1500);
      } else {
        setEditError(res.message || 'Failed to update profile.');
      }
    } catch (err) {
      setEditError('An error occurred during profile update.');
    } finally {
      setUpdatingProfile(false);
    }
  };

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
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
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

  return (
    <div className="pt-28 min-h-screen bg-zinc-950 pb-16 font-body">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: Simplified Profile Details */}
        <div className="lg:col-span-4">
          <div className="bg-zinc-900 border border-zinc-800/80 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
            <div>
              {/* User Initials Avatar */}
              <div className="w-16 h-16 rounded-full bg-viva-gold/10 border border-viva-gold/30 flex items-center justify-center text-viva-gold font-heading text-2xl font-bold uppercase mb-4 shadow-sm mx-auto">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <h3 className="text-center font-heading text-lg font-bold text-white tracking-wide">{user?.name}</h3>
              <p className="text-center text-xs text-zinc-400 mt-1 truncate">{user?.email}</p>
              
              <div className="border-t border-zinc-800 my-6"></div>

              {/* Basic Details List */}
              <div className="space-y-4 text-xs text-zinc-300">
                <div className="flex justify-between border-b border-zinc-800/40 pb-2">
                  <span className="text-zinc-500 uppercase tracking-wider text-[10px]">Full Name</span>
                  <span className="font-medium text-white">{user?.name}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800/40 pb-2">
                  <span className="text-zinc-500 uppercase tracking-wider text-[10px]">Email Address</span>
                  <span className="font-medium text-white truncate max-w-[180px]" title={user?.email}>
                    {user?.email}
                  </span>
                </div>
                <div className="flex justify-between border-b border-zinc-800/40 pb-2">
                  <span className="text-zinc-500 uppercase tracking-wider text-[10px]">Phone Number</span>
                  <span className="font-medium text-white">{user?.phone || 'Not Provided'}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={() => setShowEditModal(true)}
                className="w-full py-2.5 bg-viva-gold hover:bg-viva-gold/90 text-zinc-950 text-xs font-bold uppercase tracking-widest rounded-lg transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.01]"
              >
                <span>Edit Profile</span>
              </button>
              
              <button
                onClick={logout}
                className="w-full py-2.5 bg-zinc-950 hover:bg-red-950/20 border border-zinc-800 hover:border-red-900/40 text-zinc-400 hover:text-red-400 text-xs font-bold uppercase tracking-widest rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                <FiLogOut />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right column: Bookings & Bookmarked Services */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Active Bookings List */}
          <div className="bg-zinc-900 border border-zinc-800/80 p-6 rounded-2xl shadow-xl">
            <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-viva-gold mb-6">
              Active Bookings
            </h3>

            {loading ? (
              <div className="text-center py-10">
                <div className="w-6 h-6 border-2 border-viva-gold border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <span className="text-xs text-zinc-400">Loading bookings...</span>
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-10 bg-zinc-950/40 rounded-xl border border-zinc-800/50">
                <p className="text-xs text-zinc-450 mb-4">No scheduled grooming appointments found.</p>
                <Link
                  to="/booking"
                  className="inline-block bg-viva-gold hover:bg-viva-gold/90 text-zinc-950 text-xs font-bold uppercase tracking-widest px-6 py-2.5 rounded-lg transition-colors"
                >
                  Book an Appointment
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((app) => (
                  <div 
                    key={app._id} 
                    className="p-4 bg-zinc-950/50 border border-zinc-800/60 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      {/* Services Booked */}
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {app.selectedServices?.map((srv, idx) => (
                          <span key={idx} className="bg-zinc-900 text-zinc-300 text-[9px] uppercase tracking-wider px-2 py-0.5 rounded border border-zinc-800">
                            {srv.serviceName}
                          </span>
                        ))}
                      </div>
                      
                      {/* Booking Metadata */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-450">
                        <span className="flex items-center gap-1"><FiCalendar className="text-viva-gold" /> {app.appointmentDate}</span>
                        <span className="flex items-center gap-1"><FiClock className="text-viva-gold" /> {app.appointmentTime}</span>
                        <span className="flex items-center gap-1"><FiUser className="text-viva-gold" /> {app.customerName}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-800/80">
                      {/* Total Pricing */}
                      <div className="text-right">
                        <span className="block text-[9px] text-zinc-500 uppercase">Total</span>
                        <span className="font-heading text-viva-gold font-bold text-sm">₹{app.totalAmount}</span>
                      </div>

                      {/* Status Badge */}
                      <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded ${
                        app.status === 'Confirmed' 
                          ? 'bg-green-950/30 text-green-300 border border-green-900/30' 
                          : app.status === 'Cancelled' 
                            ? 'bg-red-950/30 text-red-300 border border-red-900/30' 
                            : app.status === 'Completed'
                              ? 'bg-blue-950/30 text-blue-300 border border-blue-900/30'
                              : 'bg-yellow-950/30 text-yellow-300 border border-yellow-900/30'
                      }`}>
                        {app.status}
                      </span>

                      {/* Cancel Button */}
                      {app.status === 'Pending' && (
                        <button
                          disabled={cancelLoadingId === app._id}
                          onClick={() => handleCancelBooking(app._id)}
                          className="p-2 bg-red-950/20 hover:bg-red-950/50 border border-red-900/30 text-red-400 rounded-lg transition-colors"
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

          {/* Bookmarked / Saved Services */}
          <div className="bg-zinc-900 border border-zinc-800/80 p-6 rounded-2xl shadow-xl">
            <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-viva-gold mb-6 flex items-center gap-2">
              <FiBookmark /> Bookmarked Services
            </h3>

            {savedServicesDetails.length === 0 ? (
              <div className="text-center py-6 text-xs text-zinc-450">
                No bookmarked services yet. Explore our service menu to save your favorites!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedServicesDetails.map(srv => (
                  <div key={srv._id} className="p-4 bg-zinc-950/50 border border-zinc-800/60 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="font-heading font-bold text-sm text-white uppercase">{srv.name}</h4>
                      <span className="text-[10px] text-viva-gold font-bold block mt-1">₹{srv.price} &bull; {srv.duration} Mins</span>
                    </div>
                    <Link
                      to={`/booking?service=${srv._id}`}
                      className="bg-viva-gold/10 hover:bg-viva-gold border border-viva-gold/30 hover:border-viva-gold text-viva-gold hover:text-zinc-950 px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-all duration-200"
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

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-8 shadow-2xl relative transition-all duration-300">
            <button 
              onClick={() => {
                setShowEditModal(false);
                setEditError('');
                setEditSuccess('');
              }}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
            >
              <FiX className="text-lg" />
            </button>
            
            <div className="text-center mb-6">
              <h3 className="font-heading text-lg font-bold text-white tracking-wide uppercase">Edit Profile</h3>
              <p className="text-xs text-zinc-400 mt-1">Update your personal information below</p>
            </div>

            {editError && (
              <div className="bg-red-950/30 border border-red-900/40 text-red-200 p-3 rounded-lg text-xs mb-4 text-center">
                {editError}
              </div>
            )}

            {editSuccess && (
              <div className="bg-zinc-950 border border-viva-gold/30 text-viva-gold p-3 rounded-lg text-xs mb-4 text-center">
                {editSuccess}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-viva-gold text-white text-sm rounded-lg py-2 px-3 outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400">Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-viva-gold text-white text-sm rounded-lg py-2 px-3 outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400">Phone Number</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-viva-gold text-white text-sm rounded-lg py-2 px-3 outline-none"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-bold text-zinc-400 uppercase tracking-widest transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingProfile}
                  className="flex-1 py-2.5 bg-viva-gold hover:bg-viva-gold/90 text-zinc-950 font-bold text-xs uppercase tracking-widest rounded-lg transition-all"
                >
                  {updatingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
