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
import ProtectedRoute from './components/ProtectedRoute';
import LoadingScreen from './components/LoadingScreen';
import LuxuryBackground from './components/LuxuryBackground';

// Pages (Lazy Loaded)
const Home = React.lazy(() => import('./pages/Home'));
const About = React.lazy(() => import('./pages/About'));
const Catalog = React.lazy(() => import('./pages/Catalog'));
const Contact = React.lazy(() => import('./pages/Contact'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const AdminLogin = React.lazy(() => import('./pages/AdminLogin'));
const AdminRegister = React.lazy(() => import('./pages/AdminRegister'));
const ScheduleAppointment = React.lazy(() => import('./pages/ScheduleAppointment'));
const BookingSuccess = React.lazy(() => import('./pages/BookingSuccess'));
const AdminSettings = React.lazy(() => import('./pages/AdminSettings'));
const Memberships = React.lazy(() => import('./pages/Memberships'));

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
        <Route path="/memberships" element={<PageWrapper><Memberships /></PageWrapper>} />
        <Route path="/membership" element={<PageWrapper><Memberships /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><AdminLogin /></PageWrapper>} />
        <Route path="/admin/login" element={<PageWrapper><AdminLogin /></PageWrapper>} />
        <Route path="/admin-login" element={<PageWrapper><AdminLogin /></PageWrapper>} />
        <Route path="/admin/register" element={<PageWrapper><AdminRegister /></PageWrapper>} />
        <Route path="/admin-register" element={<PageWrapper><AdminRegister /></PageWrapper>} />

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
          path="/admin/dashboard" 
          element={
            <ProtectedRoute adminOnly={true}>
              <PageWrapper><AdminDashboard /></PageWrapper>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute adminOnly={true}>
              <PageWrapper><AdminDashboard /></PageWrapper>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/services" 
          element={
            <ProtectedRoute adminOnly={true}>
              <PageWrapper><AdminDashboard /></PageWrapper>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/catalog" 
          element={
            <ProtectedRoute adminOnly={true}>
              <PageWrapper><AdminDashboard /></PageWrapper>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/orders" 
          element={
            <ProtectedRoute adminOnly={true}>
              <PageWrapper><AdminDashboard /></PageWrapper>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/revenue" 
          element={
            <ProtectedRoute adminOnly={true}>
              <PageWrapper><AdminDashboard /></PageWrapper>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/staff" 
          element={
            <ProtectedRoute adminOnly={true}>
              <PageWrapper><AdminDashboard /></PageWrapper>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/memberships" 
          element={
            <ProtectedRoute adminOnly={true}>
              <PageWrapper><AdminDashboard /></PageWrapper>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/customers" 
          element={
            <ProtectedRoute adminOnly={true}>
              <PageWrapper><AdminDashboard /></PageWrapper>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/gallery" 
          element={
            <ProtectedRoute adminOnly={true}>
              <PageWrapper><AdminDashboard /></PageWrapper>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/notifications" 
          element={
            <ProtectedRoute adminOnly={true}>
              <PageWrapper><AdminDashboard /></PageWrapper>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/billing" 
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

const LayoutWrapper = () => {
  return (
    <div className="flex flex-col min-h-screen bg-transparent text-viva-white selection:bg-viva-gold selection:text-viva-black">
      <Navbar />
      
      <main className="flex-grow">
        <React.Suspense fallback={<div className="min-h-screen bg-zinc-950 flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div></div>}>
          <AnimatedRoutes />
        </React.Suspense>
      </main>

      <Footer />
    </div>
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
            
            <LayoutWrapper />
          </Router>
        </ReactLenis>
      )}
      </BookingProvider>
    </AuthProvider>
  );
}

export default App;
