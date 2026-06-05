import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ReactLenis } from 'lenis/react';
import 'lenis/dist/lenis.css';

import { AuthProvider } from './context/AuthContext';

// Common Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
// import CustomCursor from './components/CustomCursor';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingScreen from './components/LoadingScreen';
import LuxuryBackground from './components/LuxuryBackground';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Catalog from './pages/Catalog';
import Booking from './pages/Booking';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';

// Scroll to top helper when switching pages
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
};

// Smooth Route Page Wrapper Animation with luxury blur/scale transitions
const PageWrapper = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, filter: 'blur(8px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 1.02, filter: 'blur(8px)' }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
};

// Sub-component to extract useLocation for route-based animations
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
        <Route path="/services" element={<PageWrapper><Services /></PageWrapper>} />
        <Route path="/catalog" element={<PageWrapper><Catalog /></PageWrapper>} />
        <Route path="/gallery" element={<PageWrapper><Gallery /></PageWrapper>} />
        <Route path="/contact" element={<PageWrapper><Contact /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />

        {/* Protected User Dashboard */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <PageWrapper><Dashboard /></PageWrapper>
            </ProtectedRoute>
          } 
        />

        {/* Protected Booking Page */}
        <Route 
          path="/booking" 
          element={
            <ProtectedRoute>
              <PageWrapper><Booking /></PageWrapper>
            </ProtectedRoute>
          } 
        />

        {/* Protected Admin Dashboard */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute adminOnly={true}>
              <PageWrapper><AdminDashboard /></PageWrapper>
            </ProtectedRoute>
          } 
        />

        {/* Redirect any other path to home */}
        <Route path="*" element={<PageWrapper><Home /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const [showLoader, setShowLoader] = useState(true);

  return (
    <AuthProvider>
      {showLoader ? (
        <LoadingScreen onComplete={() => setShowLoader(false)} />
      ) : (
        <ReactLenis root>
          <Router>
            <ScrollToTop />
            
            <LuxuryBackground />
            
            {/* Layout wrapper */}
            <div className="flex flex-col min-h-screen bg-transparent text-viva-white selection:bg-viva-gold selection:text-viva-black">
              <Navbar />
              
              <main className="flex-grow">
                <AnimatedRoutes />
              </main>

              <Footer />
            </div>
          </Router>
        </ReactLenis>
      )}
    </AuthProvider>
  );
}

export default App;
