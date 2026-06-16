import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import AccessRestricted from './AccessRestricted';
import AdminErrorBoundary from './AdminErrorBoundary';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen bg-viva-black flex flex-col items-center justify-center">
        {/* Loading Spinner */}
        <div className="w-12 h-12 border-4 border-viva-gold border-t-transparent rounded-full animate-spin shadow-gold-glow mb-4"></div>
        <p className="font-heading text-viva-gold tracking-widest text-sm animate-pulse uppercase">Loading Luxury...</p>
      </div>
    );
  }

  if (adminOnly) {
    if (!user || !['admin', 'owner', 'software_manager', 'software_developer'].includes(user.role)) {
      return <AccessRestricted message="Access Denied: Only administrators are permitted to access this portal." />;
    }
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 1024;
    if (isMobile) {
      return <AccessRestricted message="Admin Dashboard is available only on Desktop Devices." preventRedirect={true} />;
    }
    
    return <AdminErrorBoundary>{children}</AdminErrorBoundary>;
  }

  return children;
};

export default ProtectedRoute;
