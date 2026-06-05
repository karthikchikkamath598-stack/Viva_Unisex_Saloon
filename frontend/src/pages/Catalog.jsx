import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { FiSearch, FiShoppingCart, FiTrash2, FiClock, FiGrid, FiList } from 'react-icons/fi';

const fallbackServices = [
  { _id: "service_22", name: "Keratin Smoothing (Medium)", category: "Hair Services", price: 8500, duration: 150, rating: 4.9, description: "Deep protein smoothing treatment to eliminate frizz and add shine (Medium hair).", imageUrl: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600" },
  { _id: "service_43", name: "Advance Hair Cut", category: "Hair Services", price: 1200, duration: 50, rating: 5.0, description: "Couture haircut including shampoo wash, conditioner, and blow dry setting.", imageUrl: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600" },
  { _id: "service_69", name: "Classic Facial - Golden", category: "Skin Services", price: 1700, duration: 60, rating: 4.8, description: "Exquisite classic skin therapy utilizing active golden extracts.", imageUrl: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600" },
  { _id: "service_72", name: "Premium Facial - Advance Gold", category: "Skin Services", price: 2500, duration: 60, rating: 4.9, description: "Luxury advanced clinical treatment specifically formulated as a gold therapy.", imageUrl: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&q=80&w=600" },
  { _id: "service_78", name: "Signature Facial - Bridal Special", category: "Skin Services", price: 4500, duration: 90, rating: 5.0, description: "The ultimate Brightening & Whitening premium bridal glow face ritual.", imageUrl: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600" },
  { _id: "service_84", name: "Threading - Full Face", category: "Nail Services", price: 200, duration: 25, rating: 4.7, description: "Precision threading and profiling for full face.", imageUrl: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=600" },
  { _id: "service_105", name: "Manicure - D Tan", category: "Nail Services", price: 700, duration: 45, rating: 4.8, description: "Luxury therapeutic skin exfoliating and profiling ritual for hands.", imageUrl: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=600" },
  { _id: "service_115", name: "Kings Grooming - Stylish Hair Cut", category: "Grooming", price: 229, duration: 40, rating: 4.8, description: "Premium men's grooming and styling service: stylish hair cut.", imageUrl: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600" },
  { _id: "service_136", name: "Kings Special Groom - In Saloon", category: "Grooming", price: 5999, duration: 180, rating: 4.9, description: "Exclusive groom ritual bundle package: in saloon.", imageUrl: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600" },
  { _id: "service_182", name: "Bridal Makeup - Marriage", category: "Bridal Services", price: 18000, duration: 180, rating: 5.0, description: "Signature ultimate high-definition bridal makeup and bridal look.", imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600" }
];

const Catalog = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name-asc');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [selectedServices, setSelectedServices] = useState([]); // Cart for booking
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { API_URL } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get(`${API_URL}/services`);
        if (res.data.success && res.data.services.length > 0) {
          setServices(res.data.services);
        } else {
          setServices(fallbackServices);
        }
      } catch (err) {
        console.warn('Could not connect to services API, using static fallbacks.', err);
        setServices(fallbackServices);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, [API_URL]);

  // Cart operations
  const toggleSelectService = (service) => {
    setSelectedServices(prev => {
      const exists = prev.some(s => s._id === service._id);
      if (exists) {
        return prev.filter(s => s._id !== service._id);
      } else {
        return [...prev, service];
      }
    });
    setIsDrawerOpen(true);
  };

  const removeService = (id) => {
    setSelectedServices(prev => prev.filter(s => s._id !== id));
  };

  const handleCheckout = () => {
    if (selectedServices.length === 0) return;
    const ids = selectedServices.map(s => s._id).join(',');
    navigate(`/booking?services=${ids}`);
  };

  const totalDuration = selectedServices.reduce((acc, curr) => acc + curr.duration, 0);
  const totalPrice = selectedServices.reduce((acc, curr) => acc + curr.price, 0);

  // Filters logic
  const filtered = services.filter(srv => {
    const matchesSearch = srv.name.toLowerCase().includes(search.toLowerCase()) || 
                          srv.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || srv.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Sorting logic
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'rating-desc') return b.rating - a.rating;
    if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
    return 0;
  });

  const categories = ['All', 'Hair Services', 'Skin Services', 'Grooming', 'Nail Services', 'Bridal Services'];

  return (
    <div className="pt-24 min-h-screen bg-viva-black relative">
      {/* 1. Page Header */}
      <section className="py-12 px-6 text-center border-b border-white/5 bg-[radial-gradient(rgba(212,164,55,0.03)_1px,transparent_1px)] [background-size:24px_24px]">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <span className="text-viva-gold font-body text-xs uppercase tracking-[0.3em] font-semibold mb-3">Complete Catalog</span>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-widest uppercase mb-4">
            Interactive Catalog
          </h1>
          <div className="w-12 h-[1px] bg-viva-gold mb-6"></div>
          <p className="font-body text-xs sm:text-sm text-viva-gray max-w-xl leading-relaxed font-light">
            Search, sort and group your signature treatments. Select multiple treatments to compile your bespoke makeover appointment ritual.
          </p>
        </div>
      </section>

      {/* 2. Controls Panel */}
      <section className="py-6 px-6 bg-viva-charcoal border-b border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 items-center justify-between">
          
          {/* Search bar */}
          <div className="relative w-full lg:w-96">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-viva-gray" />
            <input
              type="text"
              placeholder="Search treatments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="viva-input w-full pl-10"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 items-center justify-center">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded text-[10px] uppercase font-body tracking-wider transition-colors duration-300 ${
                  selectedCategory === cat 
                    ? 'bg-viva-gold text-viva-black font-bold' 
                    : 'bg-viva-black/60 text-viva-white border border-white/10 hover:border-viva-gold/30'
                }`}
              >
                {cat.replace(' Services', '')}
              </button>
            ))}
          </div>

          {/* Sorter and Layout toggles */}
          <div className="flex items-center space-x-4 w-full lg:w-auto justify-end">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="viva-input text-xs py-2 px-3 border border-white/10 cursor-pointer"
            >
              <option value="name-asc">Sort: A-Z</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Rating: Elite First</option>
            </select>

            <div className="flex items-center border border-white/10 rounded overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 ${viewMode === 'grid' ? 'bg-viva-gold text-viva-black' : 'bg-viva-black text-viva-white'}`}
              >
                <FiGrid />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 ${viewMode === 'list' ? 'bg-viva-gold text-viva-black' : 'bg-viva-black text-viva-white'}`}
              >
                <FiList />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Catalog Grid / List */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-viva-gold border-t-transparent rounded-full animate-spin shadow-gold-glow mb-4"></div>
            <p className="text-xs text-viva-gold tracking-widest uppercase">Opening Book...</p>
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-sm text-viva-gray">No items found matching your filters.</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sorted.map(srv => {
              const inCart = selectedServices.some(s => s._id === srv._id);
              return (
                <div key={srv._id} className="bg-viva-charcoal border border-viva-gold/10 rounded-lg overflow-hidden gold-card-hover flex flex-col justify-between">
                  <div className="h-48 overflow-hidden relative">
                    <img src={srv.imageUrl} alt={srv.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-viva-charcoal to-transparent" />
                    <div className="absolute top-4 right-4 bg-viva-black/80 px-2 py-1 text-[10px] text-viva-gold rounded uppercase font-semibold">
                      {srv.rating} ★
                    </div>
                  </div>
                  <div className="p-6 flex-grow">
                    <span className="text-[10px] text-viva-gold uppercase tracking-widest block mb-2">{srv.category.replace(' Services', '')}</span>
                    <h3 className="font-heading text-lg font-bold text-viva-white mb-2 uppercase">{srv.name}</h3>
                    <p className="text-xs text-viva-gray leading-relaxed mb-6 line-clamp-3">{srv.description}</p>
                    <div className="flex items-center space-x-2 text-[10px] text-viva-gray font-light mb-4">
                      <FiClock /> <span>{srv.duration} Mins Duration</span>
                    </div>
                  </div>
                  <div className="p-6 pt-0 flex justify-between items-center border-t border-white/5">
                    <span className="font-heading text-viva-gold font-bold text-xl">₹{srv.price}</span>
                    <button
                      onClick={() => toggleSelectService(srv)}
                      className={`text-xs font-body font-bold uppercase tracking-widest px-4 py-2 rounded transition-all duration-300 ${
                        inCart 
                          ? 'bg-red-900/30 text-red-200 border border-red-900/60' 
                          : 'bg-viva-gold text-viva-black shadow-gold-glow hover:scale-105'
                      }`}
                    >
                      {inCart ? 'Deselect' : 'Add to Ritual'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View Mode */
          <div className="space-y-4">
            {sorted.map(srv => {
              const inCart = selectedServices.some(s => s._id === srv._id);
              return (
                <div key={srv._id} className="bg-viva-charcoal border border-viva-gold/10 p-6 rounded-lg flex flex-col md:flex-row items-center justify-between gap-6 hover:border-viva-gold/30 transition-colors">
                  <div className="w-24 h-24 rounded overflow-hidden flex-shrink-0">
                    <img src={srv.imageUrl} alt={srv.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center space-x-3 mb-1">
                      <span className="text-[9px] text-viva-gold uppercase tracking-widest">{srv.category.replace(' Services', '')}</span>
                      <span className="text-[10px] text-viva-gray font-light">|</span>
                      <span className="text-[10px] text-viva-gray font-light flex items-center gap-1"><FiClock /> {srv.duration} Mins</span>
                    </div>
                    <h3 className="font-heading text-lg font-bold text-viva-white uppercase">{srv.name}</h3>
                    <p className="text-xs text-viva-gray leading-relaxed font-light mt-2 line-clamp-2 max-w-2xl">{srv.description}</p>
                  </div>
                  <div className="flex items-center space-x-6">
                    <span className="font-heading text-viva-gold font-bold text-xl">₹{srv.price}</span>
                    <button
                      onClick={() => toggleSelectService(srv)}
                      className={`text-xs font-body font-bold uppercase tracking-widest px-4 py-2.5 rounded transition-all duration-300 whitespace-nowrap ${
                        inCart 
                          ? 'bg-red-900/30 text-red-200 border border-red-900/60' 
                          : 'bg-viva-gold text-viva-black shadow-gold-glow hover:scale-105'
                      }`}
                    >
                      {inCart ? 'Remove' : 'Add to Ritual'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Complete Pricing Table Segment */}
      <section className="bg-viva-charcoal py-24 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading text-2xl font-bold tracking-widest uppercase mb-12 text-center text-viva-gold">
            Summary Menu & Pricing Table
          </h2>
          <div className="border border-viva-gold/10 rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-viva-black border-b border-viva-gold/20 text-viva-gold font-heading tracking-widest uppercase">
                  <th className="p-4">Service Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4 text-right">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {services.map(s => (
                  <tr key={s._id} className="hover:bg-viva-black/30 transition-colors">
                    <td className="p-4 font-semibold text-viva-white">{s.name}</td>
                    <td className="p-4 text-viva-gray">{s.category.replace(' Services', '')}</td>
                    <td className="p-4 text-viva-gray">{s.duration} Min</td>
                    <td className="p-4 text-right text-viva-gold font-bold">₹{s.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 5. Sticky Floating Booking Drawer Toggle */}
      {selectedServices.length > 0 && (
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="fixed bottom-6 left-6 z-40 bg-viva-gold text-viva-black font-body font-bold text-xs uppercase tracking-widest px-6 py-4 rounded-full shadow-gold-glow flex items-center gap-2 hover:scale-105 transition-all duration-300"
        >
          <FiShoppingCart />
          <span>My Selected Ritual ({selectedServices.length})</span>
        </button>
      )}

      {/* 6. Dynamic Side Booking Drawer Overlay */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden font-body">
          <div className="absolute inset-0 bg-viva-black/80 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
          <div className="absolute inset-y-0 right-0 max-w-md w-full bg-viva-charcoal border-l border-viva-gold/20 shadow-2xl flex flex-col justify-between">
            
            {/* Drawer Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-heading text-xl font-bold uppercase text-viva-gold tracking-wider">Your Ritual Items</h3>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="text-viva-gray hover:text-viva-white text-xs border border-white/10 px-2 py-1 rounded"
              >
                Close
              </button>
            </div>

            {/* Selected Items List */}
            <div className="p-6 overflow-y-auto flex-grow space-y-4">
              {selectedServices.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-viva-gray">No treatments selected yet. Add services from the catalog!</p>
                </div>
              ) : (
                selectedServices.map(item => (
                  <div key={item._id} className="flex justify-between items-center bg-viva-black/60 p-4 rounded border border-white/5">
                    <div>
                      <h4 className="font-heading font-bold text-sm text-viva-white uppercase">{item.name}</h4>
                      <div className="flex items-center space-x-2 text-[10px] text-viva-gray mt-1">
                        <span>{item.duration} Min</span>
                        <span>&bull;</span>
                        <span className="text-viva-gold">₹{item.price}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeService(item._id)}
                      className="text-red-400 hover:text-red-300 p-2 hover:bg-white/5 rounded transition-colors"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Checkout Pricing Panel */}
            {selectedServices.length > 0 && (
              <div className="p-6 bg-viva-black border-t border-white/5">
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-xs text-viva-gray">
                    <span>Cumulative Duration:</span>
                    <span>{totalDuration} Mins</span>
                  </div>
                  <div className="flex justify-between text-base font-heading font-bold text-viva-white">
                    <span>Total Estimate Amount:</span>
                    <span className="text-viva-gold">₹{totalPrice}</span>
                  </div>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full py-4 bg-viva-gold hover:bg-viva-goldLight text-viva-black font-body font-bold text-xs uppercase tracking-widest rounded shadow-gold-glow transition-all duration-300 hover:scale-[1.02]"
                >
                  Proceed to Schedule
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalog;
