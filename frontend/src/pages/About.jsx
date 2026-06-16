import React from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import { FiScissors, FiDroplet, FiSun, FiFeather, FiSmile, FiAward } from 'react-icons/fi';

const About = () => {

  const services = [
    { icon: <FiScissors />, title: 'Hair Cutting & Styling' },
    { icon: <FiDroplet />, title: 'Hair Coloring & Treatments' },
    { icon: <FiSun />, title: 'Skin & Facial Care' },
    { icon: <FiFeather />, title: 'Threading & Hair Removal' },
    { icon: <FiSmile />, title: 'Bridal & Party Makeup' },
    { icon: <FiAward />, title: "Men's Grooming & Shaving" },
  ];

  const stats = [
    { value: '4.7★', label: 'Rating', sub: '56+ Reviews' },
    { value: '7', label: 'Days Open', sub: '8 AM – 10 PM' },
    { value: 'Unisex', label: 'For Everyone', sub: 'Men & Women' },
    { value: '100%', label: 'Satisfaction', sub: 'Guaranteed' },
  ];

  return (
    <div className="pt-24 min-h-screen bg-viva-black text-viva-white select-none">

      {/* ── HERO ── */}
      <section className="relative py-24 px-6 text-center overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(rgba(212,164,55,0.04)_1px,transparent_1px)] [background-size:28px_28px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_60%,rgba(212,164,55,0.06),transparent)]" />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="relative max-w-3xl mx-auto flex flex-col items-center"
        >
          <span className="text-viva-gold text-xs uppercase tracking-[0.35em] font-semibold mb-4">
            Bhongir's Premier Unisex Salon
          </span>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold uppercase tracking-[0.1em] mb-5 leading-tight">
            The Complete <span className="text-viva-gold">Makeover</span>
          </h1>
          <div className="w-12 h-[1px] bg-viva-gold/40 mb-6" />
          <p className="text-sm text-viva-gray max-w-xl leading-relaxed font-light">
            VIVA Unisex Salon is Bhongir's go-to destination for professional hair, skin, and grooming services —
            for both men and women, every day of the week.
          </p>

          {/* Info pills */}
          <div className="mt-8 flex flex-wrap justify-center gap-3 text-xs text-viva-gray">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
              <FaMapMarkerAlt className="text-viva-gold flex-shrink-0" />
              <span>Apna Bazar, Bhongir Main Road · beside Prince Medical Hall</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
              <FaClock className="text-viva-gold flex-shrink-0" />
              <span>Open Daily · 8:00 AM – 10:00 PM</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
              <FaStar className="text-viva-gold flex-shrink-0" />
              <span>4.7 ★ · 56+ Reviews</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── WHO WE ARE + STATS ── */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Story text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <span className="text-viva-gold text-xs uppercase tracking-[0.3em] font-semibold block mb-3">Our Story</span>
            <h2 className="font-heading text-3xl font-bold uppercase tracking-wider mb-5">Who We Are</h2>
            <div className="w-10 h-[1px] bg-viva-gold/40 mb-6" />
            <p className="text-sm text-viva-gray leading-relaxed font-light mb-4">
              Founded in the heart of Bhongir, Telangana, VIVA Unisex Salon brings skilled professionals
              and quality products together to deliver a complete beauty and grooming experience under one roof.
            </p>
            <p className="text-sm text-viva-gray leading-relaxed font-light">
              With a <span className="text-viva-gold font-medium">4.7-star rating</span> from 56+ happy customers
              and open <span className="text-viva-white font-medium">7 days a week</span>, we are Bhongir's most
              trusted salon for everyone.
            </p>
          </motion.div>

          {/* Stats grid */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="grid grid-cols-2 gap-4"
          >
            {stats.map((s, i) => (
              <div key={i} className="bg-[#0c0e11] border border-white/5 hover:border-viva-gold/25 p-6 rounded-xl text-center transition-all duration-300 group">
                <span className="font-heading text-2xl font-bold text-viva-gold block group-hover:scale-105 transition-transform duration-300">{s.value}</span>
                <span className="text-[11px] text-viva-white uppercase tracking-widest font-semibold block mt-1">{s.label}</span>
                <span className="text-[10px] text-viva-gray block mt-0.5">{s.sub}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="py-20 px-6 bg-[#0c0e11] border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 flex flex-col items-center"
          >
            <span className="text-viva-gold text-xs uppercase tracking-[0.3em] font-semibold mb-3">What We Offer</span>
            <h2 className="font-heading text-3xl font-bold uppercase tracking-widest mb-4">Our Services</h2>
            <div className="w-10 h-[1px] bg-viva-gold/40" />
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {services.map((svc, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className="group flex items-center gap-3 bg-viva-black border border-white/5 hover:border-viva-gold/30 px-5 py-4 rounded-xl transition-all duration-300 hover:-translate-y-0.5"
              >
                <span className="text-viva-gold text-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0">{svc.icon}</span>
                <span className="text-xs font-semibold text-viva-white uppercase tracking-wide group-hover:text-viva-gold transition-colors duration-300 leading-tight">{svc.title}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_50%_50%,rgba(212,164,55,0.05),transparent)]" />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative max-w-xl mx-auto flex flex-col items-center"
        >
          <h2 className="font-heading text-3xl font-bold uppercase tracking-widest mb-4">
            Ready for Your <span className="text-viva-gold">Makeover?</span>
          </h2>
          <p className="text-sm text-viva-gray mb-8 font-light">
            Walk in or book online — we're open every day at Bhongir Main Road.
          </p>
          <a
            href="/booking"
            className="inline-flex items-center gap-3 bg-viva-gold hover:bg-viva-gold/90 text-viva-black font-heading font-bold uppercase tracking-[0.2em] text-sm px-10 py-4 rounded-lg transition-all duration-300 hover:scale-105 shadow-[0_0_24px_rgba(212,164,55,0.2)]"
          >
            <FiScissors />
            Book Appointment
          </a>
        </motion.div>
      </section>

    </div>
  );
};

export default About;
