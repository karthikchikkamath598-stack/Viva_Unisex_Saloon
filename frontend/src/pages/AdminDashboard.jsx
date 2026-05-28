import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { FiTrendingUp, FiCalendar, FiDollarSign, FiUsers, FiPlus, FiTrash, FiCheck, FiX, FiLayers, FiSettings, FiImage } from 'react-icons/fi';

const AdminDashboard = () => {
  const { API_URL } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('analytics');

  // Stats / Charts Data
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    pendingBookings: 0,
    completedBookings: 0,
    activeUsers: 0,
    servicesChart: [],
    stylistsChart: [],
    revenueChart: []
  });

  // Data lists
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [offers, setOffers] = useState([]);
  
  // Loading states
  const [loading, setLoading] = useState(true);

  // Form states
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [newService, setNewService] = useState({ name: '', category: 'Hair Services', description: '', price: '', duration: '', imageUrl: '', isPopular: false });
  
  const [showGalleryForm, setShowGalleryForm] = useState(false);
  const [newGalleryItem, setNewGalleryItem] = useState({ title: '', category: 'Haircut', imageUrl: '', isBeforeAfter: false, beforeImageUrl: '', afterImageUrl: '' });

  const [showOfferForm, setShowOfferForm] = useState(false);
  const [newOffer, setNewOffer] = useState({ title: '', description: '', discountCode: '', discountPercentage: '', expiryDate: '', bannerImageUrl: '' });

  // Initial Fetch
  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, appRes, srvRes, galRes, offRes] = await Promise.all([
        axios.get(`${API_URL}/analytics`),
        axios.get(`${API_URL}/appointments/admin-bookings`),
        axios.get(`${API_URL}/services`),
        axios.get(`${API_URL}/gallery`),
        axios.get(`${API_URL}/offers`)
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (appRes.data.success) setBookings(appRes.data.appointments);
      if (srvRes.data.success) setServices(srvRes.data.services);
      if (galRes.data.success) setGallery(galRes.data.gallery);
      if (offRes.data.success) setOffers(offRes.data.offers);

    } catch (err) {
      console.error('Error fetching admin records', err);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    let active = true;
    if (active) {
      Promise.resolve().then(() => {
        fetchAdminData();
      });
    }
    return () => {
      active = false;
    };
  }, [fetchAdminData]);

  // Update Booking Status
  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await axios.put(`${API_URL}/appointments/${id}/status`, { status });
      if (res.data.success) {
        setBookings(prev => 
          prev.map(app => app._id === id ? { ...app, status } : app)
        );
        // Refresh analytics numbers
        const statsRes = await axios.get(`${API_URL}/analytics`);
        if (statsRes.data.success) setStats(statsRes.data.stats);
      }
    } catch (err) {
      alert('Error updating booking status: ' + (err.response?.data?.message || err.message));
    }
  };

  // SERVICES CRUD
  const handleAddService = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/services`, newService);
      if (res.data.success) {
        setServices(prev => [res.data.service, ...prev]);
        setShowServiceForm(false);
        setNewService({ name: '', category: 'Hair Services', description: '', price: '', duration: '', imageUrl: '', isPopular: false });
      }
    } catch (err) {
      alert('Error creating service: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      const res = await axios.delete(`${API_URL}/services/${id}`);
      if (res.data.success) {
        setServices(prev => prev.filter(s => s._id !== id));
      }
    } catch (err) {
      alert('Error deleting service: ' + (err.response?.data?.message || err.message));
    }
  };

  // GALLERY CRUD
  const handleAddGalleryItem = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/gallery`, newGalleryItem);
      if (res.data.success) {
        setGallery(prev => [res.data.galleryItem, ...prev]);
        setShowGalleryForm(false);
        setNewGalleryItem({ title: '', category: 'Haircut', imageUrl: '', isBeforeAfter: false, beforeImageUrl: '', afterImageUrl: '' });
      }
    } catch (err) {
      alert('Error creating gallery item: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteGalleryItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this gallery image?')) return;
    try {
      const res = await axios.delete(`${API_URL}/gallery/${id}`);
      if (res.data.success) {
        setGallery(prev => prev.filter(g => g._id !== id));
      }
    } catch (err) {
      alert('Error deleting gallery item: ' + (err.response?.data?.message || err.message));
    }
  };

  // OFFERS CRUD
  const handleAddOffer = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/offers`, newOffer);
      if (res.data.success) {
        setOffers(prev => [res.data.offer, ...prev]);
        setShowOfferForm(false);
        setNewOffer({ title: '', description: '', discountCode: '', discountPercentage: '', expiryDate: '', bannerImageUrl: '' });
      }
    } catch (err) {
      alert('Error creating offer: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteOffer = async (id) => {
    if (!window.confirm('Are you sure you want to delete this promo offer?')) return;
    try {
      const res = await axios.delete(`${API_URL}/offers/${id}`);
      if (res.data.success) {
        setOffers(prev => prev.filter(o => o._id !== id));
      }
    } catch (err) {
      alert('Error deleting offer: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="pt-24 min-h-screen bg-viva-black pb-16 font-body text-viva-white">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-white/5 pb-6 mb-8 gap-4">
          <div>
            <span className="text-viva-gold text-xs uppercase tracking-widest font-semibold">Luxury Control Panel</span>
            <h1 className="font-heading text-3xl font-bold uppercase tracking-widest mt-1">Salon Administration</h1>
          </div>
          <button 
            onClick={fetchAdminData}
            className="text-xs border border-viva-gold/30 hover:border-viva-gold text-viva-gold hover:text-viva-black hover:bg-viva-gold px-4 py-2 rounded transition-colors uppercase tracking-wider"
          >
            Refresh Records
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap gap-2 border-b border-white/5 pb-6 mb-8">
          {[
            { id: 'analytics', label: 'Analytics Report', icon: <FiTrendingUp /> },
            { id: 'bookings', label: 'Bookings Calendar', icon: <FiCalendar /> },
            { id: 'services', label: 'Services Manager', icon: <FiLayers /> },
            { id: 'gallery', label: 'Gallery Lookbook', icon: <FiImage /> },
            { id: 'offers', label: 'Promos Planner', icon: <FiSettings /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded text-xs uppercase tracking-wider transition-colors border ${
                activeTab === tab.id 
                  ? 'bg-viva-gold border-viva-gold text-viva-black font-bold shadow-gold-glow' 
                  : 'bg-viva-charcoal border-white/5 text-viva-white hover:border-viva-gold/30'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-4 border-viva-gold border-t-transparent rounded-full animate-spin mx-auto mb-4 shadow-gold-glow"></div>
            <span className="text-xs text-viva-gold tracking-widest uppercase">Syncing Records...</span>
          </div>
        ) : (
          <div>
            {/* TAB 1: ANALYTICS REPORT */}
            {activeTab === 'analytics' && (
              <div className="space-y-8 animate-fade-in">
                {/* Stats row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-viva-charcoal p-6 rounded-lg border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-viva-gray uppercase tracking-widest">Total Sales</span>
                      <p className="font-heading text-2xl font-bold text-viva-gold mt-1">₹{stats.totalRevenue}</p>
                    </div>
                    <FiDollarSign className="text-3xl text-viva-gold/30" />
                  </div>
                  <div className="bg-viva-charcoal p-6 rounded-lg border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-viva-gray uppercase tracking-widest">Scheduled Bookings</span>
                      <p className="font-heading text-2xl font-bold text-viva-white mt-1">{stats.totalBookings}</p>
                    </div>
                    <FiCalendar className="text-3xl text-viva-gold/30" />
                  </div>
                  <div className="bg-viva-charcoal p-6 rounded-lg border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-viva-gray uppercase tracking-widest">Pending Confirmation</span>
                      <p className="font-heading text-2xl font-bold text-viva-gold mt-1">{stats.pendingBookings}</p>
                    </div>
                    <FiTrendingUp className="text-3xl text-viva-gold/30 animate-pulse" />
                  </div>
                  <div className="bg-viva-charcoal p-6 rounded-lg border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-viva-gray uppercase tracking-widest">Active Members</span>
                      <p className="font-heading text-2xl font-bold text-viva-white mt-1">{stats.activeUsers}</p>
                    </div>
                    <FiUsers className="text-3xl text-viva-gold/30" />
                  </div>
                </div>

                {/* SVG High-Fidelity Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Chart 1: Therapist workloads */}
                  <div className="bg-viva-charcoal border border-white/5 p-6 rounded-lg">
                    <h3 className="font-heading text-base font-bold text-viva-gold uppercase tracking-wider mb-6">Stylist Booking Workloads</h3>
                    {stats.stylistsChart.length === 0 ? (
                      <p className="text-xs text-viva-gray">No workload data compiled yet.</p>
                    ) : (
                      <div className="space-y-4">
                        {stats.stylistsChart.map((st, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-viva-white font-medium">{st.name}</span>
                              <span className="text-viva-gold font-bold">{st.value} Bookings</span>
                            </div>
                            {/* Visual Progress Bar */}
                            <div className="h-2 w-full bg-viva-black rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gold-gradient rounded-full" 
                                style={{ width: `${Math.min(100, (st.value / (stats.totalBookings || 1)) * 100)}%` }} 
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Chart 2: Popular service categories */}
                  <div className="bg-viva-charcoal border border-white/5 p-6 rounded-lg">
                    <h3 className="font-heading text-base font-bold text-viva-gold uppercase tracking-wider mb-6">Popular Beauty Treatments</h3>
                    {stats.servicesChart.length === 0 ? (
                      <p className="text-xs text-viva-gray">No popularity data compiled yet.</p>
                    ) : (
                      <div className="space-y-4">
                        {stats.servicesChart.map((srv, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-viva-white font-medium">{srv.name}</span>
                              <span className="text-viva-gold font-bold">{srv.value} Bookings</span>
                            </div>
                            <div className="h-2 w-full bg-viva-black rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gold-gradient rounded-full" 
                                style={{ width: `${Math.min(100, (srv.value / (stats.totalBookings || 1)) * 100)}%` }} 
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: BOOKINGS CALENDAR */}
            {activeTab === 'bookings' && (
              <div className="bg-viva-charcoal border border-white/5 p-6 rounded-lg overflow-x-auto animate-fade-in">
                <h3 className="font-heading text-xl font-bold uppercase tracking-wider text-viva-gold mb-6">Bookings Manager</h3>
                
                {bookings.length === 0 ? (
                  <p className="text-xs text-viva-gray py-4 text-center">No customer bookings logged yet.</p>
                ) : (
                  <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
                    <thead>
                      <tr className="bg-viva-black border-b border-white/5 text-viva-gold font-heading tracking-widest uppercase">
                        <th className="p-3">Client Details</th>
                        <th className="p-3">Grooming Ritual</th>
                        <th className="p-3">Stylist</th>
                        <th className="p-3">Scheduled Date/Time</th>
                        <th className="p-3">Total Amount</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {bookings.map(app => (
                        <tr key={app._id} className="hover:bg-viva-black/25">
                          <td className="p-3">
                            <span className="block text-viva-white font-bold">{app.userName}</span>
                            <span className="block text-[10px] text-viva-gray">{app.userEmail}</span>
                            <span className="block text-[10px] text-viva-gray">{app.userPhone}</span>
                          </td>
                          <td className="p-3">
                            <div className="flex flex-col gap-0.5 max-w-xs truncate">
                              {app.serviceDetails?.map((s, i) => (
                                <span key={i} className="text-[10px] text-viva-white font-semibold">&bull; {s.name}</span>
                              ))}
                            </div>
                          </td>
                          <td className="p-3 text-viva-white font-semibold">{app.stylistName}</td>
                          <td className="p-3">
                            <span className="block text-viva-white font-bold">{app.date}</span>
                            <span className="block text-[10px] text-viva-gold font-mono">{app.timeSlot}</span>
                          </td>
                          <td className="p-3 text-viva-gold font-bold text-sm">₹{app.totalAmount}</td>
                          <td className="p-3">
                            <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border ${
                              app.status === 'confirmed' 
                                ? 'bg-green-950/30 text-green-300 border-green-900/40' 
                                : app.status === 'cancelled' 
                                  ? 'bg-red-950/30 text-red-300 border-red-900/40' 
                                  : app.status === 'completed'
                                    ? 'bg-blue-950/30 text-blue-300 border-blue-900/40'
                                    : 'bg-yellow-950/30 text-yellow-300 border-yellow-900/40'
                            }`}>
                              {app.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            {app.status === 'pending' && (
                              <div className="flex justify-end gap-1.5">
                                <button 
                                  onClick={() => handleUpdateStatus(app._id, 'confirmed')}
                                  className="w-7 h-7 bg-green-900/20 hover:bg-green-900/50 border border-green-800 text-green-300 rounded flex items-center justify-center transition-colors"
                                  title="Approve"
                                >
                                  <FiCheck />
                                </button>
                                <button 
                                  onClick={() => handleUpdateStatus(app._id, 'cancelled')}
                                  className="w-7 h-7 bg-red-900/20 hover:bg-red-950/50 border border-red-800 text-red-300 rounded flex items-center justify-center transition-colors"
                                  title="Reject"
                                >
                                  <FiX />
                                </button>
                              </div>
                            )}
                            {app.status === 'confirmed' && (
                              <button 
                                onClick={() => handleUpdateStatus(app._id, 'completed')}
                                className="bg-blue-900/30 hover:bg-blue-900/60 border border-blue-800 text-blue-300 px-3 py-1 rounded text-[10px] uppercase font-bold tracking-wider transition-colors"
                              >
                                Mark Completed
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* TAB 3: SERVICES MANAGER */}
            {activeTab === 'services' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center bg-viva-charcoal border border-white/5 p-4 rounded-lg">
                  <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-viva-gold">Catalog Services</h3>
                  <button 
                    onClick={() => setShowServiceForm(!showServiceForm)}
                    className="flex items-center gap-1.5 bg-viva-gold text-viva-black font-body font-bold text-xs uppercase tracking-widest px-4 py-2 rounded shadow-gold-glow hover:scale-105 transition-transform"
                  >
                    <FiPlus /> Add Treatment
                  </button>
                </div>

                {/* Add Service Dialog */}
                {showServiceForm && (
                  <form onSubmit={handleAddService} className="bg-viva-charcoal border border-viva-gold/30 p-6 rounded-lg space-y-4 max-w-2xl animate-fade-in">
                    <h4 className="font-heading text-base font-bold text-viva-gold uppercase tracking-wider">New Salon Treatment</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <label className="text-[9px] uppercase tracking-widest text-viva-gray mb-1.5">Service Name</label>
                        <input 
                          type="text" 
                          value={newService.name} 
                          onChange={(e) => setNewService({ ...newService, name: e.target.value })} 
                          className="viva-input" 
                          required 
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-[9px] uppercase tracking-widest text-viva-gray mb-1.5">Category</label>
                        <select 
                          value={newService.category} 
                          onChange={(e) => setNewService({ ...newService, category: e.target.value })} 
                          className="viva-input cursor-pointer"
                        >
                          <option value="Hair Services">Hair Services</option>
                          <option value="Skin Services">Skin Services</option>
                          <option value="Grooming">Grooming</option>
                          <option value="Nail Services">Nail Services</option>
                          <option value="Bridal Services">Bridal Services</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="flex flex-col">
                        <label className="text-[9px] uppercase tracking-widest text-viva-gray mb-1.5">Price (₹)</label>
                        <input 
                          type="number" 
                          value={newService.price} 
                          onChange={(e) => setNewService({ ...newService, price: e.target.value })} 
                          className="viva-input" 
                          required 
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-[9px] uppercase tracking-widest text-viva-gray mb-1.5">Duration (Mins)</label>
                        <input 
                          type="number" 
                          value={newService.duration} 
                          onChange={(e) => setNewService({ ...newService, duration: e.target.value })} 
                          className="viva-input" 
                          required 
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-[9px] uppercase tracking-widest text-viva-gray mb-1.5">Popular Tag</label>
                        <div className="flex items-center mt-3 gap-2">
                          <input 
                            type="checkbox" 
                            checked={newService.isPopular} 
                            onChange={(e) => setNewService({ ...newService, isPopular: e.target.checked })} 
                            className="w-4 h-4 accent-viva-gold rounded cursor-pointer" 
                          />
                          <span className="text-xs text-viva-gray">Enable popular star</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[9px] uppercase tracking-widest text-viva-gray mb-1.5">Treatment Image URL</label>
                      <input 
                        type="url" 
                        value={newService.imageUrl} 
                        onChange={(e) => setNewService({ ...newService, imageUrl: e.target.value })} 
                        className="viva-input" 
                        placeholder="https://images.unsplash.com/..."
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[9px] uppercase tracking-widest text-viva-gray mb-1.5">Description</label>
                      <textarea 
                        value={newService.description} 
                        onChange={(e) => setNewService({ ...newService, description: e.target.value })} 
                        rows={3} 
                        className="viva-input" 
                        required 
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <button 
                        type="button" 
                        onClick={() => setShowServiceForm(false)} 
                        className="text-xs text-viva-gray border border-white/5 px-4 py-2 rounded"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="bg-viva-gold text-viva-black font-body font-bold text-xs uppercase tracking-widest px-5 py-2 rounded shadow-gold-glow"
                      >
                        Create Service
                      </button>
                    </div>
                  </form>
                )}

                {/* Services list */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map(srv => (
                    <div key={srv._id} className="bg-viva-charcoal border border-white/5 p-4 rounded-lg flex items-center justify-between gap-4">
                      <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0 border border-white/5">
                        <img src={srv.imageUrl} alt={srv.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <h4 className="font-heading font-bold text-sm text-viva-white uppercase truncate">{srv.name}</h4>
                        <span className="text-[9px] text-viva-gold uppercase tracking-widest block mt-0.5">{srv.category.replace(' Services', '')}</span>
                        <span className="text-[10px] text-viva-gray block font-mono mt-1">₹{srv.price} &bull; {srv.duration} Mins</span>
                      </div>
                      <button 
                        onClick={() => handleDeleteService(srv._id)}
                        className="p-2 border border-red-900/30 text-red-400 hover:bg-red-950/20 rounded transition-colors"
                        title="Delete Service"
                      >
                        <FiTrash />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: GALLERY LOOKBOOK */}
            {activeTab === 'gallery' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center bg-viva-charcoal border border-white/5 p-4 rounded-lg">
                  <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-viva-gold">Lookbook Assets</h3>
                  <button 
                    onClick={() => setShowGalleryForm(!showGalleryForm)}
                    className="flex items-center gap-1.5 bg-viva-gold text-viva-black font-body font-bold text-xs uppercase tracking-widest px-4 py-2 rounded shadow-gold-glow"
                  >
                    <FiPlus /> Upload Photo
                  </button>
                </div>

                {/* Add Photo Dialog */}
                {showGalleryForm && (
                  <form onSubmit={handleAddGalleryItem} className="bg-viva-charcoal border border-viva-gold/30 p-6 rounded-lg space-y-4 max-w-2xl">
                    <h4 className="font-heading text-base font-bold text-viva-gold uppercase tracking-wider">New Lookbook Item</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <label className="text-[9px] uppercase tracking-widest text-viva-gray mb-1.5">Photo Title</label>
                        <input 
                          type="text" 
                          value={newGalleryItem.title} 
                          onChange={(e) => setNewGalleryItem({ ...newGalleryItem, title: e.target.value })} 
                          className="viva-input" 
                          required 
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-[9px] uppercase tracking-widest text-viva-gray mb-1.5">Category</label>
                        <select 
                          value={newGalleryItem.category} 
                          onChange={(e) => setNewGalleryItem({ ...newGalleryItem, category: e.target.value })} 
                          className="viva-input cursor-pointer"
                        >
                          <option value="Haircut">Haircut</option>
                          <option value="Hair Color">Hair Color</option>
                          <option value="Bridal">Bridal</option>
                          <option value="Nail Art">Nail Art</option>
                          <option value="Spa">Spa</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col pt-2">
                      <label className="flex items-center gap-2 text-xs text-viva-white cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={newGalleryItem.isBeforeAfter} 
                          onChange={(e) => setNewGalleryItem({ ...newGalleryItem, isBeforeAfter: e.target.checked })} 
                          className="w-4 h-4 accent-viva-gold cursor-pointer" 
                        />
                        <span>Enable Before & After comparison slider</span>
                      </label>
                    </div>

                    {newGalleryItem.isBeforeAfter ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
                        <div className="flex flex-col">
                          <label className="text-[9px] uppercase tracking-widest text-viva-gray mb-1.5">Before Image URL</label>
                          <input 
                            type="url" 
                            value={newGalleryItem.beforeImageUrl} 
                            onChange={(e) => setNewGalleryItem({ ...newGalleryItem, beforeImageUrl: e.target.value })} 
                            className="viva-input" 
                            required 
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-[9px] uppercase tracking-widest text-viva-gray mb-1.5">After Image URL</label>
                          <input 
                            type="url" 
                            value={newGalleryItem.afterImageUrl} 
                            onChange={(e) => setNewGalleryItem({ ...newGalleryItem, afterImageUrl: e.target.value })} 
                            className="viva-input" 
                            required 
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <label className="text-[9px] uppercase tracking-widest text-viva-gray mb-1.5">Single Photo URL</label>
                        <input 
                          type="url" 
                          value={newGalleryItem.imageUrl} 
                          onChange={(e) => setNewGalleryItem({ ...newGalleryItem, imageUrl: e.target.value })} 
                          className="viva-input" 
                          required 
                        />
                      </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                      <button 
                        type="button" 
                        onClick={() => setShowGalleryForm(false)} 
                        className="text-xs text-viva-gray border border-white/5 px-4 py-2 rounded"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="bg-viva-gold text-viva-black font-body font-bold text-xs uppercase tracking-widest px-5 py-2 rounded shadow-gold-glow"
                      >
                        Upload Look
                      </button>
                    </div>
                  </form>
                )}

                {/* Gallery List */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {gallery.map(item => (
                    <div key={item._id} className="bg-viva-charcoal border border-white/5 p-3 rounded-lg flex flex-col justify-between gap-3">
                      <div className="aspect-[4/3] w-full rounded overflow-hidden relative">
                        <img src={item.imageUrl || item.afterImageUrl} alt={item.title} className="w-full h-full object-cover" />
                        {item.isBeforeAfter && (
                          <span className="absolute top-2 left-2 bg-viva-gold text-viva-black text-[8px] font-bold px-1.5 py-0.5 uppercase rounded tracking-wider">BeforeAfter</span>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="min-w-0">
                          <h4 className="font-heading font-bold text-xs text-viva-white uppercase truncate">{item.title}</h4>
                          <span className="text-[8px] text-viva-gray uppercase tracking-widest block">{item.category}</span>
                        </div>
                        <button 
                          onClick={() => handleDeleteGalleryItem(item._id)}
                          className="p-1.5 border border-red-900/30 text-red-400 hover:bg-red-950/20 rounded transition-colors"
                          title="Delete photo"
                        >
                          <FiTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: PROMOS PLANNER */}
            {activeTab === 'offers' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center bg-viva-charcoal border border-white/5 p-4 rounded-lg">
                  <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-viva-gold">Loyalty Banners & Offers</h3>
                  <button 
                    onClick={() => setShowOfferForm(!showOfferForm)}
                    className="flex items-center gap-1.5 bg-viva-gold text-viva-black font-body font-bold text-xs uppercase tracking-widest px-4 py-2 rounded shadow-gold-glow"
                  >
                    <FiPlus /> Create Coupon
                  </button>
                </div>

                {/* Add Offer Dialog */}
                {showOfferForm && (
                  <form onSubmit={handleAddOffer} className="bg-viva-charcoal border border-viva-gold/30 p-6 rounded-lg space-y-4 max-w-2xl">
                    <h4 className="font-heading text-base font-bold text-viva-gold uppercase tracking-wider">New Promo Offer</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="flex flex-col sm:col-span-2">
                        <label className="text-[9px] uppercase tracking-widest text-viva-gray mb-1.5">Offer Title</label>
                        <input 
                          type="text" 
                          value={newOffer.title} 
                          onChange={(e) => setNewOffer({ ...newOffer, title: e.target.value })} 
                          className="viva-input" 
                          required 
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-[9px] uppercase tracking-widest text-viva-gray mb-1.5">Code (e.g. SUMMER25)</label>
                        <input 
                          type="text" 
                          value={newOffer.discountCode} 
                          onChange={(e) => setNewOffer({ ...newOffer, discountCode: e.target.value.toUpperCase() })} 
                          className="viva-input" 
                          required 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <label className="text-[9px] uppercase tracking-widest text-viva-gray mb-1.5">Discount Percentage (%)</label>
                        <input 
                          type="number" 
                          min={1}
                          max={100}
                          value={newOffer.discountPercentage} 
                          onChange={(e) => setNewOffer({ ...newOffer, discountPercentage: e.target.value })} 
                          className="viva-input" 
                          required 
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-[9px] uppercase tracking-widest text-viva-gray mb-1.5">Expiry Date</label>
                        <input 
                          type="date" 
                          value={newOffer.expiryDate} 
                          onChange={(e) => setNewOffer({ ...newOffer, expiryDate: e.target.value })} 
                          className="viva-input cursor-pointer" 
                          required 
                        />
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <label className="text-[9px] uppercase tracking-widest text-viva-gray mb-1.5">Banner Image URL</label>
                      <input 
                        type="url" 
                        value={newOffer.bannerImageUrl} 
                        onChange={(e) => setNewOffer({ ...newOffer, bannerImageUrl: e.target.value })} 
                        className="viva-input" 
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-[9px] uppercase tracking-widest text-viva-gray mb-1.5">Description</label>
                      <textarea 
                        value={newOffer.description} 
                        onChange={(e) => setNewOffer({ ...newOffer, description: e.target.value })} 
                        rows={2} 
                        className="viva-input" 
                        required 
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button 
                        type="button" 
                        onClick={() => setShowOfferForm(false)} 
                        className="text-xs text-viva-gray border border-white/5 px-4 py-2 rounded"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="bg-viva-gold text-viva-black font-body font-bold text-xs uppercase tracking-widest px-5 py-2 rounded shadow-gold-glow"
                      >
                        Create Promo
                      </button>
                    </div>
                  </form>
                )}

                {/* Offers list */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {offers.map(offer => (
                    <div key={offer._id} className="bg-viva-charcoal border border-white/5 p-5 rounded-lg flex flex-col justify-between h-[200px]">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="font-heading font-bold text-base text-viva-white uppercase">{offer.title}</h4>
                          <span className="bg-viva-black border border-viva-gold/30 px-2.5 py-1 text-[10px] text-viva-gold font-mono rounded tracking-widest">{offer.discountCode}</span>
                        </div>
                        <p className="text-[10px] text-viva-gray mt-2 leading-relaxed line-clamp-3">{offer.description}</p>
                      </div>
                      <div className="flex justify-between items-center border-t border-white/5 pt-3">
                        <span className="text-xs text-viva-gray font-light">Expires: {offer.expiryDate}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-viva-gold font-heading font-black text-sm">{offer.discountPercentage}% OFF</span>
                          <button 
                            onClick={() => handleDeleteOffer(offer._id)}
                            className="p-1.5 border border-red-900/30 text-red-400 hover:bg-red-950/20 rounded transition-colors"
                            title="Delete Offer"
                          >
                            <FiTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
