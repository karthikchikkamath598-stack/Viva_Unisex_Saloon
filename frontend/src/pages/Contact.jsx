import React, { useState } from 'react';
import { FiPhone, FiMail, FiMapPin, FiSend, FiClock, FiMessageSquare } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'General Inquiry',
        message: ''
      });
      // Hide success banner after 6 seconds
      setTimeout(() => setSuccess(false), 6000);
    }, 1500);
  };

  return (
    <div className="pt-24 min-h-screen bg-viva-black pb-16 font-body relative">
      {/* Page Header */}
      <section className="py-12 px-6 text-center bg-[radial-gradient(rgba(212,164,55,0.03)_1px,transparent_1px)] [background-size:24px_24px]">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <span className="text-viva-gold font-body text-xs uppercase tracking-[0.3em] font-semibold mb-3">Reach Out</span>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-widest uppercase mb-4">
            Contact VIVA Lounge
          </h1>
          <div className="w-12 h-[1px] bg-viva-gold mb-6"></div>
          <p className="font-body text-xs sm:text-sm text-viva-gray max-w-xl leading-relaxed font-light">
            Have questions about our signature makeovers, group booking requests, or VIP memberships? Submit a message below.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="py-16 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Left Side: Contact Information Cards */}
        <div className="lg:col-span-5 space-y-8">
          
          <div className="bg-viva-charcoal border border-viva-gold/10 p-8 rounded-lg flex items-start space-x-4">
            <div className="w-12 h-12 bg-viva-black border border-viva-gold/30 rounded-full flex items-center justify-center text-viva-gold flex-shrink-0">
              <FiPhone className="text-xl" />
            </div>
            <div>
              <h4 className="font-heading text-lg font-bold text-viva-white uppercase tracking-wider mb-2">Bookings & Info</h4>
              <p className="text-xs text-viva-gray leading-relaxed mb-1 font-light">Contact our front desk directly for booking alterations.</p>
              <a href="tel:+919347581733" className="text-viva-gold font-mono font-bold text-base hover:underline">+91 93475 81733</a>
            </div>
          </div>

          <div className="bg-viva-charcoal border border-viva-gold/10 p-8 rounded-lg flex items-start space-x-4">
            <div className="w-12 h-12 bg-viva-black border border-viva-gold/30 rounded-full flex items-center justify-center text-viva-gold flex-shrink-0">
              <FiMail className="text-xl" />
            </div>
            <div>
              <h4 className="font-heading text-lg font-bold text-viva-white uppercase tracking-wider mb-2">Support & Press</h4>
              <p className="text-xs text-viva-gray leading-relaxed mb-1 font-light">Send an email for corporate collaborations or PR questions.</p>
              <a href="mailto:dpjella123@gmail.com" className="text-viva-white font-semibold text-sm hover:underline">dpjella123@gmail.com</a>
            </div>
          </div>

          <div className="bg-viva-charcoal border border-viva-gold/10 p-8 rounded-lg flex items-start space-x-4">
            <div className="w-12 h-12 bg-viva-black border border-viva-gold/30 rounded-full flex items-center justify-center text-viva-gold flex-shrink-0">
              <FiMapPin className="text-xl" />
            </div>
            <div>
              <h4 className="font-heading text-lg font-bold text-viva-white uppercase tracking-wider mb-2">Luxury Lounge Location</h4>
              <p className="text-xs text-viva-gray leading-relaxed mb-1 font-light">Visit our flagship styling center.</p>
              <p className="text-viva-white text-xs font-semibold">Bhuvanagiri Town Main Rd, Bhuvanagiri, Telangana 508116</p>
            </div>
          </div>

          <div className="bg-viva-charcoal border border-viva-gold/10 p-8 rounded-lg flex items-start space-x-4">
            <div className="w-12 h-12 bg-viva-black border border-viva-gold/30 rounded-full flex items-center justify-center text-viva-gold flex-shrink-0">
              <FiClock className="text-xl" />
            </div>
            <div>
              <h4 className="font-heading text-lg font-bold text-viva-white uppercase tracking-wider mb-2">Salon Timings</h4>
              <p className="text-xs text-viva-gray font-light">Mon, Wed - Sat: <span className="text-viva-white font-semibold">09:00 AM - 09:00 PM</span></p>
              <p className="text-xs text-viva-gray font-light mt-1">Tuesday: <span className="text-red-500 font-bold uppercase tracking-wider">Closed</span></p>
              <p className="text-xs text-viva-gray font-light mt-1">Sunday: <span className="text-viva-white font-semibold">10:00 AM - 07:00 PM</span></p>
            </div>
          </div>

        </div>

        {/* Right Side: Message Submission Form */}
        <div className="lg:col-span-7 bg-viva-charcoal border border-viva-gold/10 p-8 sm:p-10 rounded-lg shadow-gold-glow">
          <h3 className="font-heading text-2xl font-bold uppercase tracking-wider text-viva-gold mb-8">
            Send A Message
          </h3>

          {success && (
            <div className="bg-green-950/40 border border-green-800 text-green-200 p-4 rounded text-xs mb-8 text-center animate-fade-in">
              Your inquiry has been dispatched! A representative will connect with you within 24 business hours.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <label className="text-[10px] uppercase tracking-widest text-viva-gray mb-2">Your Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="viva-input"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] uppercase tracking-widest text-viva-gray mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="viva-input"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <label className="text-[10px] uppercase tracking-widest text-viva-gray mb-2">Phone (Optional)</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="viva-input"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] uppercase tracking-widest text-viva-gray mb-2">Subject</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="viva-input cursor-pointer"
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Bridal Booking">Bridal Package Booking</option>
                  <option value="VIP Club">VIP Elite Membership</option>
                  <option value="Styling Feedback">Feedback & Reviews</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] uppercase tracking-widest text-viva-gray mb-2">Your Message</label>
              <textarea
                name="message"
                rows={5}
                value={formData.message}
                onChange={handleChange}
                className="viva-input resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="gold-shimmer text-viva-black font-body font-bold text-xs uppercase tracking-widest py-3 px-8 rounded shadow-gold-glow flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform duration-300 w-full"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-viva-black border-t-transparent rounded-full animate-spin"></div>
                  <span>Transmitting...</span>
                </>
              ) : (
                <>
                  <FiSend />
                  <span>Transmit Inquiry</span>
                </>
              )}
            </button>
          </form>
        </div>

      </section>

      {/* Stylized Google Map Frame Mockup */}
      <section className="py-12 px-6 max-w-7xl mx-auto">
        <h2 className="font-heading text-2xl font-bold tracking-widest uppercase mb-8 text-center text-viva-gold">
          Lounge Map Location
        </h2>
        <div className="w-full h-80 rounded-lg overflow-hidden border border-viva-gold/15 relative">
          <div className="absolute inset-0 bg-viva-black/35 flex items-center justify-center z-10 pointer-events-none">
            <div className="bg-viva-black/85 border border-viva-gold/30 p-4 rounded text-center shadow-lg max-w-xs">
              <p className="font-heading text-viva-gold font-bold tracking-wider text-sm">VIVA Unisex Lounge</p>
              <p className="text-[9px] text-viva-gray uppercase tracking-widest mt-1">Bhuvanagiri Flagship</p>
            </div>
          </div>
          <iframe 
            src="https://maps.google.com/maps?q=Bhuvanagiri%20Town%20Main%20Rd,%20Bhuvanagiri,%20Telangana%20508116&t=&z=15&ie=UTF8&iwloc=&output=embed"
            width="100%" 
            height="100%" 
            style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) grayscale(80%) contrast(110%)" }}
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </section>

      {/* Floating WhatsApp Floater */}
      <a
        href="https://wa.me/919347581733?text=Hello%20VIVA%20Salon!%20I%20would%20like%20to%20inquire%20about..."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 bg-green-600 hover:bg-green-500 text-white font-body font-bold text-xs uppercase tracking-widest px-5 py-4 rounded-full shadow-lg flex items-center gap-2 transition-transform duration-300 hover:scale-105"
      >
        <FaWhatsapp className="text-xl" />
        <span className="hidden sm:inline">WhatsApp Chat</span>
      </a>

    </div>
  );
};

export default Contact;
