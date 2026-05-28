import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiInstagram, FiFacebook, FiYoutube } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import VivaLogo from './VivaLogo';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-viva-charcoal border-t border-viva-gold/15 text-viva-white pt-16 pb-8 px-6 font-body relative overflow-hidden">
      {/* Decorative Golden Ambient Aura */}
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-viva-gold/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        {/* Column 1: Brand details */}
        <div>
          <Link to="/" className="flex items-center space-x-3 mb-6">
            <VivaLogo size={50} />
            <div className="flex flex-col leading-none">
              <span className="font-heading text-2xl font-bold tracking-[0.15em] text-gold-gradient">
                VIVA
              </span>
              <span className="text-[9px] font-body tracking-[0.3em] text-viva-gray mt-0.5">
                UNISEX SALON
              </span>
            </div>
          </Link>
          <p className="text-sm text-viva-gray mb-6 leading-relaxed">
            Viva Unisex Salon is your go-to place for complete grooming and makeover. We bring out the best version of you.
          </p>
          <div className="flex items-center space-x-4">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-viva-gold/20 flex items-center justify-center text-viva-gray hover:text-viva-gold hover:border-viva-gold transition-colors duration-300">
              <FiInstagram className="text-base" />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-viva-gold/20 flex items-center justify-center text-viva-gray hover:text-viva-gold hover:border-viva-gold transition-colors duration-300">
              <FiFacebook className="text-base" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-viva-gold/20 flex items-center justify-center text-viva-gray hover:text-viva-gold hover:border-viva-gold transition-colors duration-300">
              <FiYoutube className="text-base" />
            </a>
            <a href="https://wa.me/919347581733" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-viva-gold/20 flex items-center justify-center text-viva-gray hover:text-viva-gold hover:border-viva-gold transition-colors duration-300">
              <FaWhatsapp className="text-base" />
            </a>
          </div>
        </div>

        {/* Column 2: Hours */}
        <div>
          <h4 className="font-heading text-lg font-bold tracking-widest text-viva-gold mb-6 uppercase">
            Opening Hours
          </h4>
          <ul className="space-y-3 text-sm text-viva-gray">
            <li className="flex justify-between border-b border-white/5 pb-2">
              <span>Mon, Wed - Sat:</span>
              <span className="text-viva-white font-medium">09:00 AM - 09:00 PM</span>
            </li>
            <li className="flex justify-between border-b border-white/5 pb-2">
              <span>Tuesday:</span>
              <span className="text-red-500 font-bold uppercase tracking-wider">Closed</span>
            </li>
            <li className="flex justify-between border-b border-white/5 pb-2">
              <span>Sunday:</span>
              <span className="text-viva-white font-medium">10:00 AM - 07:00 PM</span>
            </li>
          </ul>
        </div>

        {/* Column 3: Contact details */}
        <div>
          <h4 className="font-heading text-lg font-bold tracking-widest text-viva-gold mb-6 uppercase">
            Contact Us
          </h4>
          <ul className="space-y-4 text-sm text-viva-gray mb-4">
            <li>
              <span className="block text-xs uppercase tracking-wider text-viva-white/40 mb-1">Location</span>
              <span className="text-viva-white font-medium">Bhuvanagiri Town Main Rd, Bhuvanagiri, Telangana 508116</span>
            </li>
            <li>
              <span className="block text-xs uppercase tracking-wider text-viva-white/40 mb-1">Bookings & Info</span>
              <a href="tel:+919347581733" className="text-viva-gold hover:underline font-medium">+91 93475 81733</a>
            </li>
            <li>
              <span className="block text-xs uppercase tracking-wider text-viva-white/40 mb-1">General Inquiries</span>
              <a href="mailto:dpjella123@gmail.com" className="text-viva-white hover:underline font-medium">dpjella123@gmail.com</a>
            </li>
          </ul>
        </div>

        {/* Column 4: Newsletter */}
        <div>
          <h4 className="font-heading text-lg font-bold tracking-widest text-viva-gold mb-6 uppercase">
            Newsletter
          </h4>
          <p className="text-sm text-viva-gray mb-4 leading-relaxed">
            Subscribe to get special offers and salon updates.
          </p>
          <form onSubmit={handleSubscribe} className="flex space-y-2">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="viva-input w-full"
              required
            />
            <button
              type="submit"
              className="bg-viva-gold text-viva-black font-bold px-4 py-2 text-xs hover:scale-[1.02] transition-transform duration-300"
            >
              {subscribed ? 'Joined!' : 'Subscribe'}
            </button>
          </form>
          {subscribed && (
            <p className="text-xs text-viva-gold mt-2 animate-pulse">Welcome to our circle! Check your email shortly.</p>
          )}
        </div>
      </div>

      {/* Mock Map Panel */}
      <div className="max-w-7xl mx-auto h-48 rounded-lg overflow-hidden border border-viva-gold/10 mb-12 relative">
        <div className="absolute inset-0 bg-viva-black/40 flex items-center justify-center z-10 pointer-events-none">
          <div className="bg-viva-black/85 backdrop-blur-sm border border-viva-gold/30 p-4 rounded text-center max-w-xs shadow-lg">
            <p className="font-heading text-viva-gold font-bold tracking-wider text-sm mb-1">VIVA Unisex Lounge</p>
            <p className="text-[10px] text-viva-gray">Hovering on Main Street, Your City</p>
          </div>
        </div>
        {/* Mock Map Visual (Golden stylized canvas style) */}
        <div className="w-full h-full bg-[#111111] bg-[radial-gradient(#222222_1px,transparent_1px)] [background-size:16px_16px] flex items-center justify-center opacity-70">
          <div className="w-3 h-3 rounded-full bg-viva-gold animate-ping absolute"></div>
          <div className="w-3 h-3 rounded-full bg-viva-gold absolute"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-viva-gray">
        <p>&copy; {new Date().getFullYear()} VIVA Unisex Salon. All Rights Reserved.</p>
        <div className="flex space-x-6 mt-4 sm:mt-0">
          <Link to="/about" className="hover:text-viva-gold transition-colors">Privacy Policy</Link>
          <Link to="/contact" className="hover:text-viva-gold transition-colors">Terms & Conditions</Link>
          <Link to="/catalog" className="hover:text-viva-gold transition-colors">Pricing Catalog</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
