import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import SplitBeforeAfter from '../components/SplitBeforeAfter';
import { FiMaximize2, FiX } from 'react-icons/fi';
import SplitText from '../components/SplitText';

const fallbackGallery = [
  { _id: "g1", imageUrl: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600", category: "Hair Color", title: "Signature Gold Highlights", isBeforeAfter: true, beforeImageUrl: "https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?auto=format&fit=crop&q=80&w=600", afterImageUrl: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600" },
  { _id: "g2", imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600", category: "Bridal", title: "Classic South Asian Bridal Look", isBeforeAfter: true, beforeImageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=600", afterImageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600" },
  { _id: "g3", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600", category: "Haircut", title: "Sleek Fade & Beard Trim", isBeforeAfter: false },
  { _id: "g4", imageUrl: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=600", category: "Nail Art", title: "Chrome French Extensions", isBeforeAfter: false },
  { _id: "g5", imageUrl: "https://images.unsplash.com/photo-1595853035070-59a39fe84de3?auto=format&fit=crop&q=80&w=600", category: "Spa", title: "Keratin Revival Finish", isBeforeAfter: false },
  { _id: "g6", imageUrl: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&q=80&w=600", category: "Bridal", title: "Glamorous reception look", isBeforeAfter: false },
  { _id: "g7", imageUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=600", category: "Haircut", title: "Premium Men Cut", isBeforeAfter: false }
];

// Interactive 3D Tilt Card specifically optimized for Gallery images
const GalleryCard = ({ item, onClick }) => {
  const cardRef = useRef(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setCoords({ x, y });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setCoords({ x: 0, y: 0 });
      }}
      onClick={onClick}
      className="break-inside-avoid relative group rounded-lg overflow-hidden border border-white/5 cursor-pointer shadow-md bg-viva-charcoal interactive-card glass-reflection mb-6"
      animate={{
        rotateY: coords.x * 12,
        rotateX: -coords.y * 12,
        z: isHovered ? 12 : 0,
        boxShadow: isHovered 
          ? '0 15px 30px rgba(0, 0, 0, 0.7), 0 0 20px rgba(212, 164, 55, 0.08)' 
          : '0 4px 12px rgba(0, 0, 0, 0.4)'
      }}
      style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
      transition={{ type: 'spring', damping: 25, stiffness: 220, mass: 0.1 }}
    >
      <div className="relative overflow-hidden w-full h-full" style={{ transform: 'translateZ(1px)' }}>
        <motion.img 
          src={item.imageUrl} 
          alt={item.title} 
          className="w-full object-cover rounded-lg"
          animate={{ scale: isHovered ? 1.04 : 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          loading="lazy"
        />

        {/* Dynamic mouse-reactive light reflection gradient overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at ${50 + coords.x * 100}% ${50 + coords.y * 100}%, rgba(255, 255, 255, 0.12) 0%, transparent 60%)`
          }}
        />

        {/* Overlay details */}
        <div className="absolute inset-0 bg-gradient-to-t from-viva-black/90 via-viva-black/35 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
          <span className="text-[10px] text-viva-gold uppercase tracking-widest font-semibold mb-1" style={{ transform: 'translateZ(10px)' }}>{item.category}</span>
          <h4 className="font-heading text-sm font-bold text-viva-white uppercase tracking-wider mb-3" style={{ transform: 'translateZ(15px)' }}>{item.title}</h4>
          <div className="w-8 h-8 rounded-full bg-viva-gold/15 border border-viva-gold/30 flex items-center justify-center text-viva-gold hover:bg-viva-gold hover:text-viva-black transition-colors self-start" style={{ transform: 'translateZ(20px)' }}>
            <FiMaximize2 className="text-xs" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Gallery = () => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [lightboxImage, setLightboxImage] = useState(null);
  const { API_URL } = useContext(AuthContext);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await axios.get(`${API_URL}/gallery`);
        if (res.data.success && res.data.gallery.length > 0) {
          setGalleryItems(res.data.gallery);
        } else {
          setGalleryItems(fallbackGallery);
        }
      } catch (err) {
        console.error('Error fetching gallery data:', err);
        setGalleryItems(fallbackGallery);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, [API_URL]);

  const categories = ['All', 'Haircut', 'Hair Color', 'Bridal', 'Nail Art', 'Spa'];

  const filteredItems = selectedCategory === 'All' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === selectedCategory);

  // Divide into Before/After vs standard gallery items
  const beforeAfterItems = filteredItems.filter(item => item.isBeforeAfter);
  const standardItems = filteredItems.filter(item => !item.isBeforeAfter);

  return (
    <div className="pt-24 min-h-screen bg-viva-black pb-16 font-body relative">
      {/* 1. Page Header */}
      <section className="py-12 px-6 text-center bg-[radial-gradient(rgba(212,164,55,0.03)_1px,transparent_1px)] [background-size:24px_24px]">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <span className="text-viva-gold font-body text-xs uppercase tracking-[0.3em] font-semibold mb-3 block overflow-hidden">
            <SplitText text="BRAND PORTFOLIO" type="char" />
          </span>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-widest uppercase mb-4">
            Lookbook Gallery
          </h1>
          <div className="w-12 h-[1px] bg-viva-gold mb-6"></div>
          <p className="font-body text-xs sm:text-sm text-viva-gray max-w-xl leading-relaxed font-light">
            Browse real transformation work completed in our lounges in Bhongir. Filter by hair coloring, bridal looks, and premium spa manicure treatments.
          </p>
        </div>
      </section>

      {/* 2. Category Filters */}
      <section className="px-6 pb-8 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded text-xs font-body uppercase tracking-wider transition-all duration-300 border ${
                selectedCategory === cat 
                  ? 'bg-viva-gold border-viva-gold text-viva-black font-bold shadow-gold-glow' 
                  : 'bg-viva-charcoal border-white/10 text-viva-white hover:border-viva-gold/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* 3. Before/After Section */}
      {beforeAfterItems.length > 0 && (
        <section className="py-16 px-6 max-w-7xl mx-auto">
          <h2 className="font-heading text-2xl font-bold tracking-widest uppercase mb-12 text-center text-viva-gold">
            Bespoke Transformations (Before & After)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {beforeAfterItems.map((item) => (
              <div key={item._id} className="bg-viva-charcoal p-4 rounded-lg border border-viva-gold/10 shadow-lg">
                <div className="rounded overflow-hidden">
                  <SplitBeforeAfter 
                    beforeImage={item.beforeImageUrl} 
                    afterImage={item.afterImageUrl} 
                    beforeLabel="Initial"
                    afterLabel="VIVA Royal"
                  />
                </div>
                <h4 className="font-heading text-lg font-bold text-viva-white mt-4 uppercase tracking-wider text-center">
                  {item.title}
                </h4>
                <p className="text-[10px] text-viva-gold text-center uppercase tracking-widest mt-1 font-semibold">
                  {item.category} Makeover
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Portfolio Grid (Pinterest Masonry style with 3D hover) */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <h2 className="font-heading text-2xl font-bold tracking-widest uppercase mb-12 text-center text-viva-gold">
          Lookbook Portfolio
        </h2>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-viva-gold border-t-transparent rounded-full animate-spin shadow-gold-glow mb-4"></div>
            <p className="text-xs text-viva-gold tracking-widest uppercase">Opening Gallery...</p>
          </div>
        ) : standardItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-viva-gray">No portfolio items found matching this filter.</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {standardItems.map((item) => (
              <GalleryCard 
                key={item._id} 
                item={item} 
                onClick={() => setLightboxImage(item.imageUrl)} 
              />
            ))}
          </div>
        )}
      </section>

      {/* 5. Premium Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div 
            className="fixed inset-0 z-[100] bg-viva-black/90 backdrop-blur-2xl flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImage(null)}
          >
            {/* Close Button */}
            <motion.button 
              className="absolute top-6 right-6 text-viva-white hover:text-viva-gold transition-colors p-2 text-2xl border border-white/10 rounded bg-viva-black/50"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={() => setLightboxImage(null)}
            >
              <FiX />
            </motion.button>

            {/* Enlarged Image container */}
            <motion.div
              initial={{ scale: 0.93, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.93, opacity: 0, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative max-w-full max-h-[85vh] rounded-lg overflow-hidden border border-white/5 shadow-2xl bg-viva-charcoal"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={lightboxImage} 
                alt="Enlarged look" 
                className="max-w-full max-h-[85vh] object-contain"
              />
              {/* Soft gold border glow on modal */}
              <div className="absolute inset-0 border border-viva-gold/20 pointer-events-none rounded-lg" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;
