import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'viva_booking_services';

export const BookingContext = createContext(null);

export const BookingProvider = ({ children }) => {
  const [selectedServices, setSelectedServices] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync to localStorage whenever selectedServices changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedServices));
    } catch (e) {
      console.warn('BookingContext: failed to persist to localStorage', e);
    }
  }, [selectedServices]);

  const addService = useCallback((service) => {
    setSelectedServices(prev => {
      if (prev.some(s => s._id === service._id)) return prev;
      return [...prev, service];
    });
  }, []);

  const removeService = useCallback((id) => {
    setSelectedServices(prev => prev.filter(s => s._id !== id));
  }, []);

  const toggleService = useCallback((service) => {
    setSelectedServices(prev => {
      const exists = prev.some(s => s._id === service._id);
      return exists ? prev.filter(s => s._id !== service._id) : [...prev, service];
    });
  }, []);

  const clearBooking = useCallback(() => {
    setSelectedServices([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  const totalAmount = selectedServices.reduce((acc, s) => acc + (s.price || 0), 0);
  const totalDuration = selectedServices.reduce((acc, s) => acc + (s.duration || 0), 0);

  return (
    <BookingContext.Provider value={{
      selectedServices,
      totalAmount,
      totalDuration,
      addService,
      removeService,
      toggleService,
      clearBooking,
      setSelectedServices
    }}>
      {children}
    </BookingContext.Provider>
  );
};

// Convenience hook
export const useBooking = () => {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used inside <BookingProvider>');
  return ctx;
};
