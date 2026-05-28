import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { FiPlay, FiAward, FiCheck, FiShield, FiScissors, FiCompass, FiArrowRight, FiClock, FiBookOpen } from 'react-icons/fi';
import { FaUserTie, FaMagic, FaHandHoldingHeart, FaUserCheck, FaBriefcase, FaListUl, FaCrown, FaStar } from 'react-icons/fa';
import SplitBeforeAfter from '../components/SplitBeforeAfter';

// Counter component for animated stats count up on scroll-in
const Counter = ({ target, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const elementRef = React.useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.1 });

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (observer) observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const duration = 1500;
    const end = parseInt(target);
    if (start === end) return;

    const totalMiliseconds = duration;
    const incrementTime = Math.abs(Math.floor(totalMiliseconds / end));
    
    let timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) {
        clearInterval(timer);
      }
    }, Math.max(incrementTime, 12));

    return () => clearInterval(timer);
  }, [visible, target]);

  return <span ref={elementRef}>{count}{suffix}</span>;
};

const Home = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const isClosedToday = new Date().getDay() === 2; // 2 = Tuesday

  // Motion preset variants
  const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
    transition: { duration: 0.8, ease: "easeOut" }
  };

  const staggerContainer = {
    initial: {},
    whileInView: { transition: { staggerChildren: 0.15 } },
    viewport: { once: true, amount: 0.1 }
  };

  // Mock catalog categories matching image
  const categories = ['All', 'Hair', 'Skin', 'Grooming', 'Nails', 'Makeup'];

  // Catalog items list in Rupees matching image
  const catalogItems = [
    { id: "service_1", name: "Haircut (Men)", category: "Hair", price: 299, image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=400" },
    { id: "service_2", name: "Haircut (Women)", category: "Hair", price: 499, image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=400" },
    { id: "service_3", name: "Hair Spa", category: "Hair", price: 899, image: "https://images.unsplash.com/photo-1595853035070-59a39fe84de3?auto=format&fit=crop&q=80&w=400" },
    { id: "service_4", name: "Keratin Treatment", category: "Hair", price: 3499, image: "https://images.unsplash.com/photo-1620331702289-448a044618a4?auto=format&fit=crop&q=80&w=400" },
    { id: "service_5", name: "Global Hair Color", category: "Hair", price: 2999, image: "https://images.unsplash.com/photo-1595959183075-c1d09e519826?auto=format&fit=crop&q=80&w=400" },
    { id: "service_6", name: "Face Cleanup", category: "Skin", price: 399, image: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=400" },
    { id: "service_7", name: "Gold Facial", category: "Skin", price: 1599, image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&q=80&w=400" },
    { id: "service_8", name: "Beard Styling", category: "Grooming", price: 299, image: "https://images.unsplash.com/photo-1621574539437-4b7cb63120b8?auto=format&fit=crop&q=80&w=400" },
    { id: "service_9", name: "Manicure", category: "Nails", price: 499, image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=400" },
    { id: "service_10", name: "Bridal Makeup", category: "Makeup", price: 7999, image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400" }
  ];

  const filteredCatalog = activeTab === 'All' 
    ? catalogItems 
    : catalogItems.filter(item => item.category === activeTab);

  return (
    <div className="bg-viva-black text-viva-white min-h-screen relative overflow-hidden">
      
      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 px-6 md:px-12 lg:px-20 overflow-hidden">
        
        {/* Deep dark gold vignette overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-viva-black/80 via-viva-black to-viva-black z-0 pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Hero Left Content */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="lg:col-span-6 text-left flex flex-col items-start"
          >
            <span className="text-viva-gold text-xs font-bold uppercase tracking-[0.25em] mb-4">
              WELCOME TO VIVA UNISEX SALON
            </span>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[0.1em] text-viva-white mb-6 uppercase leading-tight animate-tracking-in">
              Your Style, <br />
              <span className="text-gold-gradient">Our Passion</span>
            </h1>
            <p className="font-body text-xs sm:text-sm text-viva-gray leading-relaxed mb-10 max-w-sm font-light">
              At Viva, we believe everyone deserves to look and feel their best. Experience premium unisex salon services in a luxurious and relaxing environment.
            </p>
            <div className="flex flex-wrap gap-4 items-center w-full sm:w-auto">
              <Link
                to="/booking"
                className="gold-shimmer text-viva-black font-body font-bold text-xs uppercase tracking-widest px-6 py-4 rounded shadow-gold-glow hover:scale-105 transition-all w-full sm:w-auto text-center"
              >
                Book Appointment
              </Link>
              <Link
                to="/catalog"
                className="flex items-center justify-center gap-2.5 font-body text-xs text-viva-white hover:text-viva-gold uppercase tracking-wider font-bold group w-full sm:w-auto"
              >
                <span className="w-10 h-10 rounded-full border border-viva-gold/30 group-hover:border-viva-gold flex items-center justify-center transition-colors">
                  <FiBookOpen className="text-viva-gold" />
                </span>
                <span>Virtual Catalog</span>
              </Link>
            </div>
          </motion.div>

          {/* Hero Right Collage Grid */}
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="lg:col-span-6 grid grid-cols-2 gap-4"
          >
            <div className="space-y-4">
              <div className="h-56 rounded-lg overflow-hidden border border-viva-gold/10 relative group">
                <img src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=400" 
                     alt="Men style look" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/10" />
              </div>
              <div className="h-44 rounded-lg overflow-hidden border border-viva-gold/10 relative group">
                <img src="https://images.unsplash.com/photo-1595959183075-c1d09e519826?auto=format&fit=crop&q=80&w=400" 
                     alt="Bride style look" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/10" />
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <div className="h-72 rounded-lg overflow-hidden border border-viva-gold/10 relative group">
                <img src="https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=400" 
                     alt="Women hair look" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/10" />
              </div>
            </div>
          </motion.div>

        </div>

        {/* Feature Icons Row Banner */}
        <div className="absolute bottom-6 left-0 w-full z-10 px-6 border-t border-white/5 pt-6 hidden lg:block">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-viva-gray font-body font-light">
            <div className="flex items-center gap-2"><FaUserTie className="text-viva-gold" /> Professional Staff</div>
            <div className="flex items-center gap-2"><FaMagic className="text-viva-gold" /> Premium Products</div>
            <div className="flex items-center gap-2"><FiShield className="text-viva-gold" /> Hygienic & Safe</div>
            <div className="flex items-center gap-2"><FaHandHoldingHeart className="text-viva-gold" /> Unisex Salon</div>
          </div>
        </div>
      </section>

      {/* 2. ABOUT VIVA SECTION ("More Than Just A Salon") */}
      <section className="py-24 px-6 bg-viva-black relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Visual styling chairs panel */}
          <motion.div 
            {...fadeInUp}
            className="lg:col-span-5 relative"
          >
            <div className="relative rounded overflow-hidden border border-viva-gold/15 shadow-gold-glow">
              <img src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=700" 
                   alt="Interior styling lounge" 
                   className="w-full h-[400px] object-cover hover:scale-105 transition-transform duration-700" />
              {/* Play icon overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-16 h-16 rounded-full bg-viva-black/85 backdrop-blur-sm border border-viva-gold flex items-center justify-center text-viva-gold hover:scale-110 transition-transform shadow-lg">
                  <FiPlay className="text-xl ml-1" />
                </a>
              </div>
            </div>
          </motion.div>

          {/* Middle Story & Checklist */}
          <motion.div 
            {...fadeInUp}
            className="lg:col-span-4 flex flex-col items-start text-left"
          >
            <span className="text-viva-gold text-xs font-bold uppercase tracking-[0.25em] mb-3">ABOUT VIVA</span>
            <h2 className="font-heading text-3xl font-bold tracking-wider uppercase text-viva-white mb-6">
              More Than Just <br />
              <span className="text-gold-gradient">A Salon</span>
            </h2>
            <p className="text-xs text-viva-gray leading-relaxed mb-8 font-light">
              Viva Unisex Salon is your destination for complete grooming and makeover. Our expert stylists and therapists are dedicated to bringing out the best in you with personalized care and advanced techniques.
            </p>
            <ul className="space-y-4 text-xs font-body font-light text-viva-white">
              <li className="flex items-center gap-3"><span className="w-5 h-5 rounded-full border border-viva-gold/30 flex items-center justify-center text-[10px] text-viva-gold"><FiCheck /></span> Experienced Professionals</li>
              <li className="flex items-center gap-3"><span className="w-5 h-5 rounded-full border border-viva-gold/30 flex items-center justify-center text-[10px] text-viva-gold"><FiCheck /></span> High-Quality Products</li>
              <li className="flex items-center gap-3"><span className="w-5 h-5 rounded-full border border-viva-gold/30 flex items-center justify-center text-[10px] text-viva-gold"><FiCheck /></span> Personalized Care</li>
            </ul>
          </motion.div>

          {/* Right Statistics Counters */}
          <motion.div 
            {...fadeInUp}
            className="lg:col-span-3 grid grid-cols-2 lg:grid-cols-1 gap-6 pt-8 lg:pt-0 border-t lg:border-t-0 lg:border-l border-white/5 lg:pl-10"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded border border-viva-gold/20 flex items-center justify-center text-viva-gold flex-shrink-0">
                <FaUserCheck className="text-base" />
              </div>
              <div>
                <p className="font-heading text-2xl font-bold text-viva-gold"><Counter target="5000" suffix="+" /></p>
                <p className="text-[10px] text-viva-gray uppercase tracking-widest mt-1">Happy Clients</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded border border-viva-gold/20 flex items-center justify-center text-viva-gold flex-shrink-0">
                <FaBriefcase className="text-base" />
              </div>
              <div>
                <p className="font-heading text-2xl font-bold text-viva-white"><Counter target="10" suffix="+" /></p>
                <p className="text-[10px] text-viva-gray uppercase tracking-widest mt-1">Years Experience</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded border border-viva-gold/20 flex items-center justify-center text-viva-gold flex-shrink-0">
                <FaUserTie className="text-base" />
              </div>
              <div>
                <p className="font-heading text-2xl font-bold text-viva-gold"><Counter target="20" suffix="+" /></p>
                <p className="text-[10px] text-viva-gray uppercase tracking-widest mt-1">Expert Stylists</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded border border-viva-gold/20 flex items-center justify-center text-viva-gold flex-shrink-0">
                <FaListUl className="text-base" />
              </div>
              <div>
                <p className="font-heading text-2xl font-bold text-viva-white"><Counter target="100" suffix="+" /></p>
                <p className="text-[10px] text-viva-gray uppercase tracking-widest mt-1">Services Offered</p>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* MAGIC BENTO GRID SECTION */}
      <section className="py-24 px-6 bg-viva-black relative border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center mb-16 flex flex-col items-center">
            <span className="text-viva-gold text-xs font-bold uppercase tracking-[0.25em] mb-3">EXPERIENCE VIVA</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-widest uppercase text-viva-white animate-tracking-in">
              The Magic <span className="text-gold-gradient">Bento Grid</span>
            </h2>
            <p className="text-xs text-viva-gray mt-4 max-w-md font-light">
              Explore our curated offerings, exclusive lounge access, and real-time appointment bookings in one interactive space.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[220px]">
            
            {/* Card 1: VIP Quick Booking Portal (2x2) */}
            <motion.div 
              {...fadeInUp}
              className="lg:col-span-2 lg:row-span-2 rounded-2xl glassmorphism border-gold-subtle p-8 flex flex-col justify-between relative overflow-hidden group interactive-card"
            >
              {/* Subtle background glow */}
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-viva-gold/10 rounded-full blur-3xl group-hover:bg-viva-gold/20 transition-all duration-700 pointer-events-none" />
              
              <div className="z-10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-viva-gold text-[10px] font-bold uppercase tracking-[0.2em] bg-viva-gold/10 px-3 py-1 rounded-full">
                    VIP EXPERIENCE
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-500 text-[10px] font-semibold tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    LIVE BOOKING
                  </span>
                </div>
                
                <h3 className="font-heading text-2xl font-bold text-viva-white uppercase tracking-wider mb-3">
                  Instant Luxury <br />
                  <span className="text-gold-gradient">Reservation</span>
                </h3>
                
                <p className="text-xs text-viva-gray max-w-sm leading-relaxed mb-6 font-light">
                  Skip the wait. Instantly book your premium slot with our top-tier master stylists in a single tap.
                </p>

                {/* Quick services tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {['Haircut', 'Spa Treatment', 'Grooming', 'Nail Art'].map(srv => (
                    <span key={srv} className="text-[10px] text-viva-white/70 bg-white/5 border border-white/10 hover:border-viva-gold/30 hover:text-viva-gold px-2.5 py-1 rounded transition-colors cursor-pointer">
                      {srv}
                    </span>
                  ))}
                </div>
              </div>

              <div className="z-10 mt-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-white/5 pt-4">
                <div>
                  <p className="text-[9px] text-viva-gray uppercase tracking-widest">Next Available Slot</p>
                  <p className="text-xs text-viva-gold font-bold">Today at 3:30 PM</p>
                </div>
                <Link
                  to="/booking"
                  className="gold-shimmer text-viva-black text-center font-body font-bold text-[10px] uppercase tracking-widest px-5 py-3 rounded shadow-gold-glow hover:scale-105 transition-all"
                >
                  Book Now
                </Link>
              </div>
            </motion.div>

            {/* Card 2: Timings (1x1) */}
            <motion.div 
              {...fadeInUp}
              className="lg:col-span-1 lg:row-span-1 rounded-2xl bg-viva-charcoal border border-white/5 p-6 flex flex-col justify-between group interactive-card"
            >
              <div className="flex items-center justify-between">
                <FiClock className="text-viva-gold text-xl" />
                <span className={`text-[8px] font-bold tracking-widest uppercase border px-2 py-0.5 rounded ${
                  isClosedToday 
                    ? 'text-red-500 border-red-500/20 bg-red-500/10 shadow-[0_0_8px_rgba(239,68,68,0.2)]' 
                    : 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10'
                }`}>
                  {isClosedToday ? 'Closed' : 'Open'}
                </span>
              </div>
              <div>
                <h4 className="font-heading text-sm font-bold text-viva-white uppercase tracking-wider mb-2">Salon Hours</h4>
                <div className="text-xs text-viva-gray space-y-1 font-light">
                  <p className="flex justify-between"><span>Mon, Wed - Sat:</span> <span className="text-viva-white font-semibold">9 AM - 9 PM</span></p>
                  <p className="flex justify-between"><span>Tuesday:</span> <span className="text-red-500 font-bold uppercase tracking-wider">Closed</span></p>
                  <p className="flex justify-between"><span>Sunday:</span> <span className="text-viva-white">10 AM - 7 PM</span></p>
                </div>
              </div>
              <p className="text-[9px] text-viva-gray font-light">
                *Appointments highly recommended
              </p>
            </motion.div>

            {/* Card 3: VIP Lounge Perks (1x1) */}
            <motion.div 
              {...fadeInUp}
              className="lg:col-span-1 lg:row-span-1 rounded-2xl bg-viva-charcoal border border-white/5 p-6 flex flex-col justify-between group interactive-card"
            >
              <div className="w-8 h-8 rounded bg-viva-gold/10 border border-viva-gold/20 flex items-center justify-center text-viva-gold">
                <FaCrown className="text-sm" />
              </div>
              <div>
                <h4 className="font-heading text-sm font-bold text-viva-white uppercase tracking-wider mb-1">Lounge Perks</h4>
                <p className="text-[11px] text-viva-gray leading-relaxed font-light">
                  Enjoy custom refreshments, premium Wi-Fi, and private acoustic styling chambers.
                </p>
              </div>
              <span className="text-[9px] text-viva-gold uppercase tracking-wider font-bold">
                Complimentary
              </span>
            </motion.div>

            {/* Card 4: Active Offers (2x1) */}
            <motion.div 
              {...fadeInUp}
              className="lg:col-span-2 lg:row-span-1 rounded-2xl bg-viva-charcoal border border-white/5 p-6 flex flex-col justify-between relative overflow-hidden group interactive-card"
            >
              {/* Pattern lines in background */}
              <div className="absolute right-0 bottom-0 opacity-[0.03] text-viva-gold text-9xl font-bold font-heading pointer-events-none transform translate-x-4 translate-y-8 select-none select-none">
                20%
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-viva-gold text-[9px] font-bold uppercase tracking-widest border border-viva-gold/20 bg-viva-gold/5 px-2.5 py-0.5 rounded">
                  Limited Offer
                </span>
                <span className="text-[10px] text-viva-gray font-mono font-light">ENDS IN 3 DAYS</span>
              </div>
              
              <div className="my-2">
                <h4 className="font-heading text-base font-bold text-viva-white uppercase tracking-wider mb-1">
                  Signature Summer Glow Package
                </h4>
                <p className="text-[11px] text-viva-gray font-light">
                  Get 20% off on all hair spa and customized detan facial combinations.
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-3">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-viva-gray uppercase tracking-widest">PROMO:</span>
                  <code className="text-xs text-viva-white bg-viva-black px-2 py-0.5 rounded border border-white/5 font-mono select-all cursor-pointer hover:text-viva-gold transition-colors">
                    VIVAGLOW20
                  </code>
                </div>
                <button 
                  onClick={() => navigate('/booking?promo=VIVAGLOW20')}
                  className="text-[10px] font-bold text-viva-gold hover:text-viva-white transition-colors uppercase tracking-widest flex items-center gap-1"
                >
                  Claim Code <FiArrowRight />
                </button>
              </div>
            </motion.div>

            {/* Card 5: Statistics Counter (2x1) */}
            <motion.div 
              {...fadeInUp}
              className="lg:col-span-2 lg:row-span-1 rounded-2xl bg-viva-charcoal border border-white/5 p-6 flex flex-col justify-between group interactive-card"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-heading text-xs font-bold text-viva-gold uppercase tracking-[0.2em]">Our Milestones</h4>
                <span className="text-[9px] text-viva-gray uppercase font-light">Real-Time Growth</span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 my-2">
                <div className="text-center border-r border-white/5">
                  <p className="font-heading text-2xl font-bold text-viva-gold"><Counter target="5000" suffix="+" /></p>
                  <p className="text-[9px] text-viva-gray uppercase tracking-widest mt-1">Clients</p>
                </div>
                <div className="text-center border-r border-white/5">
                  <p className="font-heading text-2xl font-bold text-viva-white"><Counter target="20" suffix="+" /></p>
                  <p className="text-[9px] text-viva-gray uppercase tracking-widest mt-1">Stylists</p>
                </div>
                <div className="text-center">
                  <p className="font-heading text-2xl font-bold text-viva-gold"><Counter target="10" suffix="+" /></p>
                  <p className="text-[9px] text-viva-gray uppercase tracking-widest mt-1">Awards</p>
                </div>
              </div>

              <div className="text-[9px] text-viva-gray text-center font-light border-t border-white/5 pt-2">
                Trusted by high-profile personalities and clients across India
              </div>
            </motion.div>

            {/* Card 6: Reviews Testimonial (2x1) */}
            <motion.div 
              {...fadeInUp}
              className="lg:col-span-2 lg:row-span-1 rounded-2xl bg-viva-charcoal border border-white/5 p-6 flex flex-col justify-between group interactive-card"
            >
              <div className="flex items-center justify-between">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="text-viva-gold text-xs" />
                  ))}
                </div>
                <span className="text-[9px] text-viva-gray uppercase font-light">Verified Review</span>
              </div>

              <p className="text-xs italic text-viva-gray leading-relaxed my-2 font-light">
                "The styling is absolute perfection. The VIP lounge experience makes you feel like royalty. Strongly recommend their Keratin treatment and beard detailing."
              </p>

              <div className="flex items-center justify-between border-t border-white/5 pt-2 text-[10px]">
                <span className="text-viva-white font-semibold">Rajesh K.</span>
                <span className="text-viva-gold font-light">Elite Gold Member</span>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 3. SERVICES SECTION ("Beauty. Style. Confidence.") */}
      <section className="py-24 px-6 bg-viva-charcoal border-y border-white/5 relative">
        <div className="max-w-7xl mx-auto">
          
          {/* Header segment with right side link */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="text-left">
              <span className="text-viva-gold text-xs font-bold uppercase tracking-[0.25em] mb-3 block">OUR SERVICES</span>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-wider uppercase text-viva-white">
                Beauty. Style. <span className="text-gold-gradient">Confidence.</span>
              </h2>
            </div>
            <Link 
              to="/services" 
              className="text-xs uppercase font-body font-bold tracking-widest text-viva-gold hover:text-viva-white border border-viva-gold/20 hover:border-viva-white px-5 py-3 rounded transition-colors self-start md:self-auto"
            >
              View All Services
            </Link>
          </div>

          {/* 6-Column Grid matching reference */}
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, amount: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {/* Card 1 */}
            <motion.div variants={fadeInUp} className="bg-viva-black p-8 rounded-lg border border-white/5 hover:border-viva-gold/30 transition-all duration-300 flex flex-col justify-between h-[230px] group">
              <div>
                <div className="w-10 h-10 rounded border border-viva-gold/30 flex items-center justify-center text-viva-gold mb-5 group-hover:bg-viva-gold group-hover:text-viva-black transition-all">
                  <FiScissors className="text-lg" />
                </div>
                <h4 className="font-heading text-lg font-bold text-viva-white uppercase mb-2">Hair Styling</h4>
                <p className="text-[11px] text-viva-gray leading-relaxed font-light">Haircuts, blowdry, styling and advanced treatments.</p>
              </div>
              <Link to="/services" className="text-[10px] font-bold text-viva-gold tracking-wider uppercase flex items-center gap-1 mt-4">
                Explore <FiArrowRight />
              </Link>
            </motion.div>

            {/* Card 2 */}
            <motion.div variants={fadeInUp} className="bg-viva-black p-8 rounded-lg border border-white/5 hover:border-viva-gold/30 transition-all duration-300 flex flex-col justify-between h-[230px] group">
              <div>
                <div className="w-10 h-10 rounded border border-viva-gold/30 flex items-center justify-center text-viva-gold mb-5 group-hover:bg-viva-gold group-hover:text-viva-black transition-all">
                  <FaMagic className="text-lg" />
                </div>
                <h4 className="font-heading text-lg font-bold text-viva-white uppercase mb-2">Hair Treatments</h4>
                <p className="text-[11px] text-viva-gray leading-relaxed font-light">Keratin, smoothening, hair spa and more.</p>
              </div>
              <Link to="/services" className="text-[10px] font-bold text-viva-gold tracking-wider uppercase flex items-center gap-1 mt-4">
                Explore <FiArrowRight />
              </Link>
            </motion.div>

            {/* Card 3 */}
            <motion.div variants={fadeInUp} className="bg-viva-black p-8 rounded-lg border border-white/5 hover:border-viva-gold/30 transition-all duration-300 flex flex-col justify-between h-[230px] group">
              <div>
                <div className="w-10 h-10 rounded border border-viva-gold/30 flex items-center justify-center text-viva-gold mb-5 group-hover:bg-viva-gold group-hover:text-viva-black transition-all">
                  <FaUserCheck className="text-lg" />
                </div>
                <h4 className="font-heading text-lg font-bold text-viva-white uppercase mb-2">Skin & Face</h4>
                <p className="text-[11px] text-viva-gray leading-relaxed font-light">Facials, cleanups, detan and skin treatments.</p>
              </div>
              <Link to="/services" className="text-[10px] font-bold text-viva-gold tracking-wider uppercase flex items-center gap-1 mt-4">
                Explore <FiArrowRight />
              </Link>
            </motion.div>

            {/* Card 4 */}
            <motion.div variants={fadeInUp} className="bg-viva-black p-8 rounded-lg border border-white/5 hover:border-viva-gold/30 transition-all duration-300 flex flex-col justify-between h-[230px] group">
              <div>
                <div className="w-10 h-10 rounded border border-viva-gold/30 flex items-center justify-center text-viva-gold mb-5 group-hover:bg-viva-gold group-hover:text-viva-black transition-all">
                  <FiCompass className="text-lg" />
                </div>
                <h4 className="font-heading text-lg font-bold text-viva-white uppercase mb-2">Beard & Grooming</h4>
                <p className="text-[11px] text-viva-gray leading-relaxed font-light">Beard styling, trimming and men's grooming.</p>
              </div>
              <Link to="/services" className="text-[10px] font-bold text-viva-gold tracking-wider uppercase flex items-center gap-1 mt-4">
                Explore <FiArrowRight />
              </Link>
            </motion.div>

            {/* Card 5 */}
            <motion.div variants={fadeInUp} className="bg-viva-black p-8 rounded-lg border border-white/5 hover:border-viva-gold/30 transition-all duration-300 flex flex-col justify-between h-[230px] group">
              <div>
                <div className="w-10 h-10 rounded border border-viva-gold/30 flex items-center justify-center text-viva-gold mb-5 group-hover:bg-viva-gold group-hover:text-viva-black transition-all">
                  <FaHandHoldingHeart className="text-lg" />
                </div>
                <h4 className="font-heading text-lg font-bold text-viva-white uppercase mb-2">Nail Care</h4>
                <p className="text-[11px] text-viva-gray leading-relaxed font-light">Manicure, pedicure, nail extensions and more.</p>
              </div>
              <Link to="/services" className="text-[10px] font-bold text-viva-gold tracking-wider uppercase flex items-center gap-1 mt-4">
                Explore <FiArrowRight />
              </Link>
            </motion.div>

            {/* Card 6 */}
            <motion.div variants={fadeInUp} className="bg-viva-black p-8 rounded-lg border border-white/5 hover:border-viva-gold/30 transition-all duration-300 flex flex-col justify-between h-[230px] group">
              <div>
                <div className="w-10 h-10 rounded border border-viva-gold/30 flex items-center justify-center text-viva-gold mb-5 group-hover:bg-viva-gold group-hover:text-viva-black transition-all">
                  <FiAward className="text-lg" />
                </div>
                <h4 className="font-heading text-lg font-bold text-viva-white uppercase mb-2">Makeup</h4>
                <p className="text-[11px] text-viva-gray leading-relaxed font-light">Bridal, party and editorial makeup services.</p>
              </div>
              <Link to="/services" className="text-[10px] font-bold text-viva-gold tracking-wider uppercase flex items-center gap-1 mt-4">
                Explore <FiArrowRight />
              </Link>
            </motion.div>
          </motion.div>

        </div>
      </section>

      {/* 4. EXPLORE CATALOG SECTION (Rupee pricing catalog) */}
      <section className="py-24 px-6 bg-viva-black relative">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          
          <div className="text-center mb-12 flex flex-col items-center">
            <span className="text-viva-gold text-xs font-bold uppercase tracking-[0.25em] mb-3">OUR CATALOG</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-widest uppercase text-viva-white mb-6">
              Explore Our Services
            </h2>
            
            {/* Category tabs */}
            <div className="flex flex-wrap gap-2 items-center justify-center mt-6">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  className={`px-4 py-2 rounded text-[10px] font-body uppercase tracking-wider transition-colors border ${
                    activeTab === cat 
                      ? 'bg-viva-gold border-viva-gold text-viva-black font-bold shadow-gold-glow' 
                      : 'bg-viva-charcoal border-white/5 text-viva-white hover:border-viva-gold/30'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Aligned Cards grid in Rupees */}
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, amount: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 w-full"
          >
            {filteredCatalog.map((item) => (
              <motion.div 
                key={item.id}
                variants={fadeInUp}
                className="bg-viva-charcoal border border-white/5 hover:border-viva-gold/20 rounded-lg overflow-hidden group flex flex-col justify-between h-[280px]"
              >
                <div className="h-32 overflow-hidden relative">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-viva-charcoal to-transparent" />
                </div>
                <div className="p-4 flex-grow flex flex-col justify-between">
                  <div>
                    <h4 className="font-heading text-xs font-bold text-viva-white uppercase tracking-wider line-clamp-2 min-h-[32px]">{item.name}</h4>
                    <span className="text-[8px] text-viva-gold uppercase tracking-widest block mt-1">{item.category} Treatment</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-white/5 pt-3 mt-3">
                    <span className="font-heading text-viva-gold font-bold text-sm">₹{item.price}</span>
                    <button
                      onClick={() => navigate(`/booking?service=${item.id}`)}
                      className="text-[9px] font-bold text-viva-white hover:text-viva-gold transition-colors uppercase tracking-widest"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <Link
            to="/catalog"
            className="mt-16 bg-viva-gold hover:bg-viva-goldLight text-viva-black font-body font-bold text-xs uppercase tracking-widest px-8 py-4 rounded shadow-gold-glow hover:scale-105 transition-transform"
          >
            View Full Catalog
          </Link>
        </div>
      </section>

      {/* Before / After Drag Slider segment */}
      <section className="py-24 px-6 bg-viva-charcoal border-t border-white/5 relative">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <span className="text-viva-gold text-xs font-bold uppercase tracking-[0.25em] mb-3">Transformations</span>
          <h2 className="font-heading text-3xl font-bold tracking-widest uppercase mb-12 text-center text-viva-white">
            Signature Hair Makeovers
          </h2>
          <SplitBeforeAfter 
            beforeImage="https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?auto=format&fit=crop&q=80&w=800"
            afterImage="https://images.unsplash.com/photo-1620331702289-448a044618a4?auto=format&fit=crop&q=80&w=800"
            beforeLabel="Before Treatment"
            afterLabel="After Styling"
          />
        </div>
      </section>

    </div>
  );
};

export default Home;
