import React, { useState, useEffect, useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { HiMenuAlt3, HiX } from 'react-icons/hi';
import { RiUserSharedLine } from 'react-icons/ri';
import VivaLogo from './VivaLogo';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const { selectedServices } = useBooking();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const handleBookRitual = () => {
    if (selectedServices.length > 0) {
      navigate('/catalog?drawer=open');
    } else {
      navigate('/catalog?msg=select');
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Catalog', path: '/catalog' },
    { name: 'Contact', path: '/contact' }
  ];

  const renderAvatar = () => {
    if (user?.profileImage || user?.imageUrl) {
      return (
        <img 
          src={user.profileImage || user.imageUrl} 
          alt={user.name} 
          className="w-8 h-8 rounded-full border border-viva-gold/40 object-cover"
        />
      );
    }
    return (
      <div className="w-8 h-8 rounded-full bg-viva-gold/10 border border-viva-gold/40 flex items-center justify-center text-viva-gold font-bold text-xs uppercase">
        {user?.name?.charAt(0) || 'U'}
      </div>
    );
  };

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
      isScrolled 
        ? 'bg-viva-black/90 backdrop-blur-md py-4 border-b border-viva-gold/25 shadow-gold-glow' 
        : 'bg-transparent py-6 border-b border-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Branding Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <VivaLogo size={40} className="group-hover:scale-105 transition-transform duration-300" />
          <div className="flex flex-col leading-none">
            <span className="font-heading text-xl font-bold tracking-[0.15em] text-gold-gradient">
              VIVA
            </span>
            <span className="text-[8px] font-body tracking-[0.3em] text-viva-gray mt-0.5 group-hover:text-viva-gold transition-colors duration-300">
              UNISEX SALON
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) => `font-body text-sm tracking-wider hover:text-viva-gold transition-all duration-300 relative py-1 after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-viva-gold after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 ${
                isActive ? 'text-viva-gold after:scale-x-100' : 'text-viva-white'
              }`}
            >
              {link.name}
            </NavLink>
          ))}
        </div>

        {/* Action Button Controls */}
        <div className="hidden md:flex items-center space-x-6">
          {user ? (
            <div className="flex items-center space-x-4">
              <Link 
                to={user.role === 'admin' ? '/admin' : '/dashboard'} 
                className="flex items-center space-x-2 group animate-fade-in"
              >
                {renderAvatar()}
                <span className="font-body text-xs text-viva-white group-hover:text-viva-gold transition-colors duration-300 font-medium">
                  {user.role === 'admin' ? 'Admin Portal' : 'My Account'}
                </span>
              </Link>
              <button 
                onClick={handleLogout}
                className="text-xs text-viva-gray hover:text-viva-white border border-viva-gray/30 hover:border-viva-white/60 px-3 py-1.5 rounded transition-all duration-300 animate-fade-in"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4 animate-fade-in">
              <Link 
                to="/login"
                className="text-viva-white hover:text-viva-gold transition-colors duration-300 flex items-center space-x-1 py-1"
              >
                <RiUserSharedLine className="text-lg" />
                <span className="text-xs font-body tracking-wider font-semibold">Login</span>
              </Link>
              <Link 
                to="/signup"
                className="text-xs text-viva-white border border-viva-white/30 hover:border-viva-gold hover:text-zinc-950 hover:bg-viva-gold px-3 py-1.5 rounded transition-all duration-300 font-semibold"
              >
                Sign Up
              </Link>
            </div>
          )}

          <button
            onClick={handleBookRitual}
            className="gold-shimmer text-viva-black font-body font-bold text-xs uppercase tracking-widest px-5 py-3 rounded shadow-gold-glow hover:scale-105 transition-transform duration-300"
          >
            Book Ritual
          </button>
        </div>

        {/* Mobile menu trigger button */}
        <div className="md:hidden flex items-center space-x-4">
          <button
            onClick={() => {
              setIsOpen(false);
              handleBookRitual();
            }}
            className="gold-shimmer text-viva-black font-body font-bold text-[10px] uppercase tracking-widest px-3 py-2 rounded shadow-gold-glow"
          >
            Book
          </button>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="text-viva-white hover:text-viva-gold transition-colors duration-300 p-1"
          >
            {isOpen ? <HiX className="text-2xl" /> : <HiMenuAlt3 className="text-2xl" />}
          </button>
        </div>
      </div>

      {/* Mobile drop-down items overlay */}
      <div className={`md:hidden fixed top-[73px] left-0 w-full h-[calc(100vh-73px)] bg-viva-black/95 backdrop-blur-lg border-t border-viva-gold/15 transition-all duration-500 ${
        isOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-4 invisible pointer-events-none'
      }`}>
        <div className="flex flex-col items-center justify-center h-full space-y-8 px-6 text-center">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className="font-heading text-2xl tracking-widest text-viva-white hover:text-viva-gold transition-colors duration-300"
            >
              {link.name}
            </Link>
          ))}
          
          <div className="w-full border-t border-viva-gold/10 my-4"></div>

          {user ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center gap-3">
                {renderAvatar()}
                <span className="text-sm font-body text-viva-gray">Hello, {user.name}</span>
              </div>
              <Link
                to={user.role === 'admin' ? '/admin' : '/dashboard'}
                onClick={() => setIsOpen(false)}
                className="font-body text-base text-viva-gold font-bold tracking-wider"
              >
                {user.role === 'admin' ? 'Admin Dashboard' : 'My Dashboard'}
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-viva-gray border border-viva-gray/30 hover:border-viva-white px-6 py-2 rounded transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="font-body text-lg text-viva-white hover:text-viva-gold transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                onClick={() => setIsOpen(false)}
                className="font-body text-lg text-viva-white hover:text-viva-gold transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
