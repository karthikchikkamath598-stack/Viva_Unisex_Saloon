import React, { useState, useRef, useEffect } from 'react';
import { FiCalendar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const CalendarDatePicker = ({ selectedDate, onChange, minDate, blockedHolidays = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Set local calendar view state (month and year)
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (selectedDate) {
      setCurrentDate(new Date(selectedDate));
    } else if (minDate) {
      setCurrentDate(new Date(minDate));
    }
  }, [selectedDate, minDate]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Generate calendar days
  const getDaysInMonth = () => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // Index of first day (0-6, Sun-Sat)
    const totalDays = new Date(year, month + 1, 0).getDate(); // Number of days in current month

    const days = [];

    // Padding for preceding month
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ day: null, dateStr: null, isCurrentMonth: false });
    }

    // Days of current month
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ day: d, dateStr, isCurrentMonth: true });
    }

    return days;
  };

  const days = getDaysInMonth();

  const isDateDisabled = (dateStr) => {
    if (!dateStr) return true;
    const dateObj = new Date(dateStr);
    
    // Disable Tuesdays (Tuesday in local day is 2)
    if (dateObj.getDay() === 2) {
      return true;
    }

    // Disable past dates
    if (minDate) {
      const minDateObj = new Date(minDate);
      const compareDate = new Date(dateStr);
      minDateObj.setHours(0, 0, 0, 0);
      compareDate.setHours(0, 0, 0, 0);
      if (compareDate < minDateObj) {
        return true;
      }
    }

    // Disable blocked holidays
    if (blockedHolidays && blockedHolidays.includes(dateStr)) {
      return true;
    }

    return false;
  };

  const handleDayClick = (dateStr) => {
    if (isDateDisabled(dateStr)) return;
    onChange(dateStr);
    setIsOpen(false);
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return 'Select Booking Date';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Date Input Box Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-zinc-950 border border-zinc-850 hover:border-[#D4AF37]/50 rounded-lg p-3 text-sm text-white transition-all duration-300 outline-none text-left cursor-pointer"
      >
        <span className={selectedDate ? 'text-white' : 'text-zinc-400'}>
          {formatDisplayDate(selectedDate)}
        </span>
        <FiCalendar className="text-[#D4AF37] text-lg" />
      </button>

      {/* Popover Calendar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 mt-2 z-50 w-full sm:w-[320px] bg-[#121417] border border-[#D4AF37]/25 rounded-xl shadow-2xl overflow-hidden font-body"
          >
            {/* Header controls */}
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-zinc-950">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="w-7 h-7 flex items-center justify-center rounded border border-white/5 hover:border-[#D4AF37] text-zinc-400 hover:text-white transition-colors"
              >
                <FiChevronLeft />
              </button>
              
              <span className="font-heading text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
                {monthNames[month]} {year}
              </span>

              <button
                type="button"
                onClick={handleNextMonth}
                className="w-7 h-7 flex items-center justify-center rounded border border-white/5 hover:border-[#D4AF37] text-zinc-400 hover:text-white transition-colors"
              >
                <FiChevronRight />
              </button>
            </div>

            {/* Days Grid */}
            <div className="p-4">
              {/* Day Labels */}
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(dLabel => (
                  <span key={dLabel} className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider font-heading">
                    {dLabel}
                  </span>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((item, idx) => {
                  const { day, dateStr, isCurrentMonth } = item;
                  
                  if (!isCurrentMonth) {
                    return <div key={`empty-${idx}`} />;
                  }

                  const isDisabled = isDateDisabled(dateStr);
                  const isSelected = selectedDate === dateStr;
                  const isToday = new Date().toISOString().split('T')[0] === dateStr;

                  return (
                    <button
                      type="button"
                      key={`day-${day}`}
                      disabled={isDisabled}
                      onClick={() => handleDayClick(dateStr)}
                      className={`h-8 w-8 rounded text-[11px] font-mono tracking-tighter flex items-center justify-center transition-all duration-200 border ${
                        isSelected
                          ? 'bg-[#D4AF37] border-[#D4AF37] text-zinc-950 font-bold shadow-gold-glow scale-105'
                          : isDisabled
                            ? 'bg-transparent border-transparent text-zinc-700 cursor-not-allowed line-through font-light opacity-30'
                            : isToday
                              ? 'bg-zinc-900 border border-[#D4AF37]/35 text-white'
                              : 'bg-zinc-950/45 border-transparent hover:border-[#D4AF37]/40 text-white'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Info note */}
            <div className="px-4 pb-4 text-center">
              <span className="text-[9px] text-zinc-500 font-light block">
                Closed on Tuesdays &bull; Select available future dates.
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CalendarDatePicker;
