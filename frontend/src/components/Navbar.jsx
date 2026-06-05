import React, { useState, useEffect, useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { HiMenuAlt3, HiX } from 'react-icons/hi';
import { RiUserSharedLine } from 'react-icons/ri';
import VivaLogo from './VivaLogo';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
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

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Catalog', path: '/catalog' },
    { name: 'Contact', path: '/contact' }
  ];

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
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <Link 
                to={user.role === 'admin' ? '/admin' : '/dashboard'} 
                className="font-body text-sm text-viva-gold hover:text-viva-white transition-colors duration-300 flex items-center space-x-1"
              >
                <span>Dashboard</span>
              </Link>
              <button 
                onClick={handleLogout}
                className="text-xs text-viva-gray hover:text-viva-white border border-viva-gray/30 hover:border-viva-white/60 px-3 py-1.5 rounded transition-all duration-300"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link 
              to="/login"
              className="text-viva-white hover:text-viva-gold transition-colors duration-300 flex items-center space-x-1 py-1"
            >
              <RiUserSharedLine className="text-lg" />
              <span className="text-sm font-body tracking-wider">Login</span>
            </Link>
          )}

          <Link
            to="/booking"
            className="gold-shimmer text-viva-black font-body font-bold text-xs uppercase tracking-widest px-5 py-3 rounded shadow-gold-glow hover:scale-105 transition-transform duration-300"
          >
            Book Ritual
          </Link>
        </div>

        {/* Mobile menu trigger button */}
        <div className="md:hidden flex items-center space-x-4">
          <Link
            to="/booking"
            className="gold-shimmer text-viva-black font-body font-bold text-[10px] uppercase tracking-widest px-3 py-2 rounded shadow-gold-glow"
          >
            Book
          </Link>
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
              <span className="text-sm font-body text-viva-gray">Hello, {user.name}</span>
              <Link
                to={user.role === 'admin' ? '/admin' : '/dashboard'}
                onClick={() => setIsOpen(false)}
                className="font-body text-base text-viva-gold"
              >
                Go to Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-viva-gray border border-viva-gray/30 px-6 py-2 rounded"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="font-body text-lg text-viva-white hover:text-viva-gold transition-colors"
            >
              Login / Sign Up
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
