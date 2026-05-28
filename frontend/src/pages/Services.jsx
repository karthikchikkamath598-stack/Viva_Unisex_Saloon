import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { FiClock, FiBookmark } from 'react-icons/fi';
import { FaBookmark } from 'react-icons/fa';

const fallbackServices = [
  { _id: "s1", name: "Premium Haircut & Styling (Men)", category: "Hair Services", price: 299, duration: 45, description: "Tailored haircut with consultation, signature wash, relaxing head massage, and hot towel finish.", imageUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=600" },
  { _id: "s2", name: "Designer Cut & Blowout (Women)", category: "Hair Services", price: 499, duration: 60, description: "Couture haircut personalized to your hair profile, finished with a professional luxury blowout.", imageUrl: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600" },
  { _id: "s3", name: "Organic Keratin Infusion", category: "Hair Services", price: 3499, duration: 120, description: "Premium formaldehyde-free smoothing treatment that eliminates frizz, adds shine, and restores hair structure.", imageUrl: "https://images.unsplash.com/photo-1595853035070-59a39fe84de3?auto=format&fit=crop&q=80&w=600" },
  { _id: "s5", name: "Golden Elixir Hydra Facial", category: "Skin Services", price: 1599, duration: 75, description: "Advanced multi-step facial using 24k gold leaf serums, deep vacuum extraction, and hyperbaric oxygen.", imageUrl: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600" },
  { _id: "s7", name: "Royal Beard Grooming & Sculpt", category: "Grooming", price: 299, duration: 30, description: "Precision beard shaping with hot steam, luxury pre-shave oil, straight-razor detailing, and conditioning balm.", imageUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=600" },
  { _id: "s9", name: "Signature Gel Manicure", category: "Nail Services", price: 499, duration: 40, description: "Nail shaping, cuticle therapy, organic scrub, massage, and high-gloss long-lasting gel polish.", imageUrl: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=600" },
  { _id: "s11", name: "Imperial Bridal Makeover & Styling", category: "Bridal Services", price: 7999, duration: 180, description: "The ultimate bridal package: HD airbrush makeup, couture hair design, outfit draping, and setting service.", imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600" }
];

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const { user, toggleSaveService, API_URL } = useContext(AuthContext);
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

  const handleBookNow = (serviceId) => {
    navigate(`/booking?service=${serviceId}`);
  };

  const handleSaveToggle = async (e, srvId) => {
    e.stopPropagation();
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    await toggleSaveService(srvId);
  };

  const categories = ['All', 'Hair Services', 'Skin Services', 'Grooming', 'Nail Services', 'Bridal Services'];

  const filteredServices = activeCategory === 'All' 
    ? services 
    : services.filter(s => s.category === activeCategory);

  // Motion animation parameters
  const staggerContainer = {
    initial: {},
    animate: { transition: { staggerChildren: 0.08 } }
  };

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.4 } }
  };

  return (
    <div className="pt-24 min-h-screen bg-viva-black select-none text-viva-white">
      {/* Page Header */}
      <section className="py-16 px-6 text-center bg-[radial-gradient(rgba(212,164,55,0.03)_1px,transparent_1px)] [background-size:24px_24px]">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto flex flex-col items-center"
        >
          <span className="text-viva-gold font-body text-xs uppercase tracking-[0.3em] font-semibold mb-3">Our Menu</span>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-widest uppercase mb-4">
            Services & Rituals
          </h1>
          <div className="w-12 h-[1px] bg-viva-gold/40 mb-6"></div>
          <p className="font-body text-xs sm:text-sm text-viva-gray max-w-xl leading-relaxed font-light">
            Indulge in our exquisite collection of premium cosmetic and grooming therapies, conducted by award-winning specialists.
          </p>
        </motion.div>
      </section>

      {/* Category Tabs */}
      <section className="px-6 pb-8 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-2 sm:gap-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 sm:px-6 py-2 rounded text-xs font-body uppercase tracking-wider transition-all duration-300 border ${
                activeCategory === cat 
                  ? 'bg-viva-gold border-viva-gold text-viva-black font-bold shadow-gold-glow' 
                  : 'bg-viva-charcoal border-white/10 text-viva-white hover:border-viva-gold/40'
              }`}
            >
              {cat.replace(' Services', '')}
            </button>
          ))}
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 px-6 max-w-7xl mx-auto min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-viva-gold border-t-transparent rounded-full animate-spin shadow-gold-glow mb-4"></div>
            <p className="text-xs text-viva-gold tracking-widest uppercase">Opening Menu...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-sm text-viva-gray">No services found in this category.</p>
          </div>
        ) : (
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            key={activeCategory} // Triggers new grid animation sequence on category switch
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredServices.map((service) => {
                const isSaved = user?.savedServices?.includes(service._id);
                return (
                  <motion.div 
                    layout
                    key={service._id} 
                    variants={cardVariants}
                    className="interactive-card bg-viva-charcoal rounded overflow-hidden border border-white/5 hover:border-viva-gold/30 flex flex-col justify-between"
                  >
                    <div>
                      {/* Image container */}
                      <div className="h-56 overflow-hidden relative">
                        <img 
                          src={service.imageUrl} 
                          alt={service.name} 
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-viva-charcoal to-transparent" />
                        
                        {/* Price Overlay */}
                        <div className="absolute bottom-4 left-4 bg-viva-black/85 border border-viva-gold/20 px-3 py-1 rounded">
                          <span className="font-heading text-viva-gold font-bold text-sm">₹{service.price}</span>
                        </div>

                        {/* Bookmark Button */}
                        <button 
                          onClick={(e) => handleSaveToggle(e, service._id)}
                          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-viva-black/80 hover:bg-viva-gold hover:text-viva-black border border-white/10 flex items-center justify-center text-viva-gold transition-colors duration-300"
                        >
                          {isSaved ? <FaBookmark className="text-xs" /> : <FiBookmark className="text-xs" />}
                        </button>
                      </div>

                      {/* Info details */}
                      <div className="p-6">
                        <div className="flex items-center space-x-2 text-[10px] text-viva-gold tracking-widest uppercase font-semibold mb-2">
                          <span>{service.category.replace(' Services', '')}</span>
                          <span>&bull;</span>
                          <span className="flex items-center gap-1"><FiClock /> {service.duration} Min</span>
                        </div>
                        <h3 className="font-heading text-lg font-bold uppercase text-viva-white mb-3 group-hover:text-viva-gold transition-colors duration-300">
                          {service.name}
                        </h3>
                        <p className="text-xs text-viva-gray leading-relaxed font-light">
                          {service.description}
                        </p>
                      </div>
                    </div>

                    {/* Book now */}
                    <div className="p-6 pt-0">
                      <button
                        onClick={() => handleBookNow(service._id)}
                        className="w-full py-3 bg-viva-black hover:bg-viva-gold border border-white/5 hover:border-viva-gold text-viva-white hover:text-viva-black font-body font-bold text-xs uppercase tracking-widest rounded transition-all duration-300"
                      >
                        Book Ritual
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </section>
    </div>
  );
};

export default Services;
