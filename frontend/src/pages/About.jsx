import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { FaAward, FaCrown, FaGem, FaCertificate } from 'react-icons/fa';

const About = () => {
  const team = [
    {
      name: "Alex Gold",
      role: "Lead Master Stylist",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
      description: "12+ years sculpting runway hair designs and high-fashion coloring systems.",
      specialty: "Balayage & Couture Cut"
    },
    {
      name: "Sophia Rose",
      role: "Bridal Artistry Director",
      image: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&q=80&w=400",
      description: "Elite visual makeup artist specializing in HD airbrush draping and organic skin therapies.",
      specialty: "Bridal Makeup & Facials"
    },
    {
      name: "Marcus Beard",
      role: "Signature Grooming Expert",
      image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=400",
      description: "Classic barbershop technique combined with modern beard detailing and hot steam relaxation.",
      specialty: "Razor Detailing & Shaves"
    },
    {
      name: "Chloe Nails",
      role: "Nail Extensions Specialist",
      image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=400",
      description: "Gel extensions designer and hand-painted chrome overlay nail designer.",
      specialty: "Chrome Gel Nail Art"
    }
  ];

  const milestones = [
    {
      year: "2018",
      title: "The Genesis",
      description: "VIVA Salon was founded in Beverly Hills, California with a commitment to providing luxury grooming with standard organic treatments."
    },
    {
      year: "2020",
      title: "Bridal Makeup Wing Launch",
      description: "We launched our specialized Bridal Makeup wing, becoming a destination for wedding preparations and HD Airbrush makeovers."
    },
    {
      year: "2023",
      title: "VIP Lounge Expansion",
      description: "Created private membership lounge rooms with full bar facilities, catering to high-profile clients and early booking rewards."
    },
    {
      year: "2026",
      title: "The Ultimate Makeover",
      description: "Complete architectural and digital upgrade, establishing our flagship black + gold aesthetic beauty lounge space."
    }
  ];

  // Motion variants
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut" }
  };

  const staggerContainer = {
    initial: {},
    animate: { transition: { staggerChildren: 0.15 } }
  };

  return (
    <div className="pt-24 min-h-screen bg-viva-black select-none text-viva-white">
      {/* 1. Header Banner */}
      <section className="relative py-24 px-6 text-center border-b border-white/5 bg-[radial-gradient(rgba(212,164,55,0.03)_1px,transparent_1px)] [background-size:30px_30px]">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="max-w-4xl mx-auto flex flex-col items-center"
        >
          <span className="text-viva-gold font-body text-xs uppercase tracking-[0.3em] font-semibold mb-4">Our Legacy</span>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-[0.15em] uppercase mb-6 leading-tight">
            The Story Behind VIVA
          </h1>
          <div className="w-12 h-[1px] bg-viva-gold/40 mb-6"></div>
          <p className="font-body text-xs sm:text-sm text-viva-gray max-w-xl leading-relaxed font-light">
            Founded with the vision to blend high-fashion artistry with a royal, tranquil environment, VIVA has grown into California's premier luxury salon.
          </p>
        </motion.div>
      </section>

      {/* 2. Mission & Vision */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <motion.div 
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          <motion.div 
            variants={fadeInUp}
            className="bg-[#0c0e11] border border-white/5 p-8 rounded-lg transition-colors hover:border-viva-gold/20"
          >
            <FaCrown className="text-2xl text-viva-gold mb-6" />
            <h3 className="font-heading text-xl font-bold uppercase text-viva-white tracking-wider mb-4">Our Mission</h3>
            <p className="text-xs text-viva-gray leading-relaxed font-light">
              To provide our clients with a premium grooming ritual that enhances their natural aesthetic, delivered by masters of the craft in a luxurious matte black and gold ambient lounge. We commit to using organic elixir ingredients and precision styling.
            </p>
          </motion.div>
          <motion.div 
            variants={fadeInUp}
            className="bg-[#0c0e11] border border-white/5 p-8 rounded-lg transition-colors hover:border-viva-gold/20"
          >
            <FaGem className="text-2xl text-viva-gold mb-6" />
            <h3 className="font-heading text-xl font-bold uppercase text-viva-white tracking-wider mb-4">Our Vision</h3>
            <p className="text-xs text-viva-gray leading-relaxed font-light">
              To set the absolute global benchmark for luxury beauty lounge spaces, blending classic styling arts with cutting-edge facial skin science, and offering an unmatched VIP membership experience that treats grooming as self-care royalty.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* 3. Milestone Timeline */}
      <section className="py-24 px-6 bg-[#0c0e11] border-y border-white/5">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <span className="text-viva-gold font-body text-xs uppercase tracking-[0.3em] font-semibold mb-4">History</span>
          <h2 className="font-heading text-3xl font-bold tracking-widest uppercase mb-16 text-center">Brand Milestones</h2>
          
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, amount: 0.1 }}
            className="relative border-l border-viva-gold/15 pl-8 space-y-12 ml-4"
          >
            {milestones.map((m, idx) => (
              <motion.div 
                key={idx} 
                variants={fadeInUp}
                className="timeline-item relative group"
              >
                <span className="font-heading text-lg font-bold text-viva-gold block mb-1 group-hover:text-viva-white transition-colors duration-300">{m.year}</span>
                <h4 className="font-heading text-base font-bold text-viva-white uppercase tracking-wider mb-2">{m.title}</h4>
                <p className="text-xs text-viva-gray leading-relaxed font-light max-w-2xl">{m.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 4. Team Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16 flex flex-col items-center">
          <span className="text-viva-gold font-body text-xs uppercase tracking-[0.3em] font-semibold mb-4">The Artisans</span>
          <h2 className="font-heading text-3xl font-bold tracking-widest uppercase mb-4">Meet Our Master Stylists</h2>
          <div className="w-12 h-[1px] bg-viva-gold/30"></div>
        </div>

        <motion.div 
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {team.map((member, index) => (
            <motion.div 
              key={index} 
              variants={fadeInUp}
              className="interactive-card bg-viva-charcoal border border-white/5 rounded overflow-hidden group hover:border-viva-gold/30"
            >
              <div className="h-72 overflow-hidden relative">
                <img src={member.image} alt={member.name} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-viva-black/80 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <p className="text-[10px] text-viva-gold uppercase tracking-widest font-semibold border border-viva-gold/25 px-2.5 py-0.5 rounded-full bg-viva-black/50">{member.specialty}</p>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-heading text-lg font-bold text-viva-white uppercase tracking-wide group-hover:text-viva-gold transition-colors duration-300 mb-1">{member.name}</h3>
                <p className="text-[9px] text-viva-gray uppercase tracking-widest mb-4 font-light">{member.role}</p>
                <p className="text-xs text-viva-gray leading-relaxed font-light">{member.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 5. Interior & Why Choose Us */}
      <section className="py-24 px-6 bg-[#0c0e11] border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            {...fadeInUp}
            className="flex flex-col items-start"
          >
            <span className="text-viva-gold font-body text-xs uppercase tracking-[0.3em] font-semibold mb-4">The Lounge</span>
            <h2 className="font-heading text-3xl font-bold tracking-widest uppercase mb-8">Premium Salon Interior</h2>
            <p className="text-xs sm:text-sm text-viva-gray leading-relaxed mb-8 font-light max-w-lg">
              Every detail of our salon interior is built to reflect our passion for style. We feature bespoke Italian leather styling chairs, professional soft-lighting filters to prevent color discrepancies, and air purifiers to filter chemical particles.
            </p>
            
            <div className="grid grid-cols-3 gap-4 w-full">
              <div className="flex flex-col items-center justify-center text-center p-4 bg-viva-black border border-white/5 rounded hover:border-viva-gold/20 transition-all duration-300">
                <FaAward className="text-lg text-viva-gold mb-2" />
                <span className="text-[9px] text-viva-white uppercase tracking-widest font-bold">Award Winner</span>
              </div>
              <div className="flex flex-col items-center justify-center text-center p-4 bg-viva-black border border-white/5 rounded hover:border-viva-gold/20 transition-all duration-300">
                <FaCertificate className="text-lg text-viva-gold mb-2" />
                <span className="text-[9px] text-viva-white uppercase tracking-widest font-bold">Organic Care</span>
              </div>
              <div className="flex flex-col items-center justify-center text-center p-4 bg-viva-black border border-white/5 rounded hover:border-viva-gold/20 transition-all duration-300">
                <FaCrown className="text-lg text-viva-gold mb-2" />
                <span className="text-[9px] text-viva-white uppercase tracking-widest font-bold">VIP Privacy</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, amount: 0.1 }}
            className="grid grid-cols-2 gap-4"
          >
            <motion.img variants={fadeInUp} src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=400"
                 alt="Interior hair spot" className="rounded border border-white/5 object-cover w-full h-44 hover:opacity-90 transition-opacity" />
            <motion.img variants={fadeInUp} src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=400"
                 alt="Interior nails spot" className="rounded border border-white/5 object-cover w-full h-44 hover:opacity-90 transition-opacity" />
            <motion.img variants={fadeInUp} src="https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&q=80&w=400"
                 alt="Interior facial spot" className="rounded border border-white/5 object-cover w-full h-44 hover:opacity-90 transition-opacity" />
            <motion.img variants={fadeInUp} src="https://images.unsplash.com/photo-1595853035070-59a39fe84de3?auto=format&fit=crop&q=80&w=400"
                 alt="Interior highlights" className="rounded border border-white/5 object-cover w-full h-44 hover:opacity-90 transition-opacity" />
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;
