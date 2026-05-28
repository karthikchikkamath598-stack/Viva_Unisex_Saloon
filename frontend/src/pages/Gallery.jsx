import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import SplitBeforeAfter from '../components/SplitBeforeAfter';
import { FiMaximize2, FiX } from 'react-icons/fi';

const fallbackGallery = [
  { _id: "g1", imageUrl: "https://images.unsplash.com/photo-1620331702289-448a044618a4?auto=format&fit=crop&q=80&w=600", category: "Hair Color", title: "Signature Gold Highlights", isBeforeAfter: true, beforeImageUrl: "https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?auto=format&fit=crop&q=80&w=600", afterImageUrl: "https://images.unsplash.com/photo-1620331702289-448a044618a4?auto=format&fit=crop&q=80&w=600" },
  { _id: "g2", imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600", category: "Bridal", title: "Classic South Asian Bridal Look", isBeforeAfter: true, beforeImageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=600", afterImageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600" },
  { _id: "g3", imageUrl: "https://images.unsplash.com/photo-1605497746445-97d1b0a9ead2?auto=format&fit=crop&q=80&w=600", category: "Haircut", title: "Sleek Fade & Beard Trim", isBeforeAfter: false },
  { _id: "g4", imageUrl: "https://images.unsplash.com/photo-1632345031435-8797b2d58045?auto=format&fit=crop&q=80&w=600", category: "Nail Art", title: "Chrome French Extensions", isBeforeAfter: false },
  { _id: "g5", imageUrl: "https://images.unsplash.com/photo-1595853035070-59a39fe84de3?auto=format&fit=crop&q=80&w=600", category: "Spa", title: "Keratin Revival Finish", isBeforeAfter: false },
  { _id: "g6", imageUrl: "https://images.unsplash.com/photo-1595959183075-c1d09e519826?auto=format&fit=crop&q=80&w=600", category: "Bridal", title: "Glamorous reception look", isBeforeAfter: false },
  { _id: "g7", imageUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=600", category: "Haircut", title: "Premium Men Cut", isBeforeAfter: false }
];

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
          <span className="text-viva-gold font-body text-xs uppercase tracking-[0.3em] font-semibold mb-3">Brand Portfolio</span>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-widest uppercase mb-4">
            Lookbook Gallery
          </h1>
          <div className="w-12 h-[1px] bg-viva-gold mb-6"></div>
          <p className="font-body text-xs sm:text-sm text-viva-gray max-w-xl leading-relaxed font-light">
            Browse real transformation work completed in our lounges. Filter by hair coloring, bridal looks, and premium spa manicure treatments.
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
              <div key={item._id} className="bg-viva-charcoal p-4 rounded-lg border border-viva-gold/10">
                <SplitBeforeAfter 
                  beforeImage={item.beforeImageUrl} 
                  afterImage={item.afterImageUrl} 
                  beforeLabel="Initial"
                  afterLabel="VIVA Royal"
                />
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

      {/* 4. Portfolio Grid (Pinterest Masonry style) */}
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
              <div 
                key={item._id} 
                className="break-inside-avoid relative group rounded-lg overflow-hidden border border-white/5 cursor-pointer shadow-md bg-viva-charcoal"
                onClick={() => setLightboxImage(item.imageUrl)}
              >
                <img 
                  src={item.imageUrl} 
                  alt={item.title} 
                  className="w-full object-cover group-hover:scale-[1.03] transition-transform duration-500 rounded-lg"
                  loading="lazy"
                />
                {/* Overlay details */}
                <div className="absolute inset-0 bg-gradient-to-t from-viva-black/90 via-viva-black/35 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <span className="text-[10px] text-viva-gold uppercase tracking-widest font-semibold mb-1">{item.category}</span>
                  <h4 className="font-heading text-base font-bold text-viva-white uppercase tracking-wider mb-3">{item.title}</h4>
                  <div className="w-8 h-8 rounded-full bg-viva-gold/15 border border-viva-gold/30 flex items-center justify-center text-viva-gold hover:bg-viva-gold hover:text-viva-black transition-colors self-start">
                    <FiMaximize2 className="text-sm" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-[100] bg-viva-black/95 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setLightboxImage(null)}
        >
          <button 
            className="absolute top-6 right-6 text-viva-white hover:text-viva-gold transition-colors p-2 text-2xl border border-white/10 rounded"
            onClick={() => setLightboxImage(null)}
          >
            <FiX />
          </button>
          <img 
            src={lightboxImage} 
            alt="Enlarged look" 
            className="max-w-full max-h-[85vh] rounded-lg object-contain shadow-gold-glow border border-white/5"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default Gallery;
