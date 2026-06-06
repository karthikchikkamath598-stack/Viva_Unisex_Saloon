import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ReactLenis } from 'lenis/react';
import 'lenis/dist/lenis.css';

import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';

// Common Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CustomCursor from './components/CustomCursor';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingScreen from './components/LoadingScreen';
import LuxuryBackground from './components/LuxuryBackground';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Catalog from './pages/Catalog';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import ScheduleAppointment from './pages/ScheduleAppointment';
import BookingSuccess from './pages/BookingSuccess';
import AdminSettings from './pages/AdminSettings';

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
        <Route path="/catalog" element={<PageWrapper><Catalog /></PageWrapper>} />
        <Route path="/contact" element={<PageWrapper><Contact /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/signup" element={<PageWrapper><Signup /></PageWrapper>} />
        <Route path="/forgot-password" element={<PageWrapper><ForgotPassword /></PageWrapper>} />
        <Route path="/reset-password/:token" element={<PageWrapper><ResetPassword /></PageWrapper>} />
        <Route path="/admin/login" element={<PageWrapper><AdminLogin /></PageWrapper>} />

        {/* Protected User Dashboard */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <PageWrapper><Dashboard /></PageWrapper>
            </ProtectedRoute>
          } 
        />

        {/* Booking & Scheduling Pages */}
        <Route path="/booking" element={<PageWrapper><ScheduleAppointment /></PageWrapper>} />
        <Route path="/schedule-appointment" element={<PageWrapper><ScheduleAppointment /></PageWrapper>} />
        <Route path="/booking-success" element={<PageWrapper><BookingSuccess /></PageWrapper>} />

        {/* Protected Admin Dashboard & Settings */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute adminOnly={true}>
              <PageWrapper><AdminDashboard /></PageWrapper>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/settings" 
          element={
            <ProtectedRoute adminOnly={true}>
              <PageWrapper><AdminSettings /></PageWrapper>
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
      <BookingProvider>
      {showLoader ? (
        <LoadingScreen onComplete={() => setShowLoader(false)} />
      ) : (
        <ReactLenis root>
          <Router>
            <ScrollToTop />
            
            <LuxuryBackground />
            <CustomCursor />
            
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
      </BookingProvider>
    </AuthProvider>
  );
}

export default App;
