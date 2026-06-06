import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { FiSave, FiPlus, FiTrash, FiCalendar, FiClock, FiSettings, FiPhone, FiMail, FiUser } from 'react-icons/fi';

const AdminSettings = () => {
  const { API_URL } = useContext(AuthContext);
  
  // Settings details state
  const [ownerName, setOwnerName] = useState('');
  const [salonPhone, setSalonPhone] = useState('');
  const [ownerWhatsapp, setOwnerWhatsapp] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  
  const [workingHoursStart, setWorkingHoursStart] = useState('10:00 AM');
  const [workingHoursEnd, setWorkingHoursEnd] = useState('08:00 PM');
  
  const [slots, setSlots] = useState([]);
  const [disabledSlots, setDisabledSlots] = useState([]);
  const [blockedHolidays, setBlockedHolidays] = useState([]);

  // Form states
  const [newSlot, setNewSlot] = useState('');
  const [newHoliday, setNewHoliday] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${API_URL}/settings`);
        if (res.data.success) {
          const s = res.data.settings;
          setOwnerName(s.ownerName || '');
          setSalonPhone(s.salonPhone || '');
          setOwnerWhatsapp(s.ownerWhatsapp || '');
          setOwnerEmail(s.ownerEmail || '');
          setWorkingHoursStart(s.workingHoursStart || '10:00 AM');
          setWorkingHoursEnd(s.workingHoursEnd || '08:00 PM');
          setSlots(s.slots || []);
          setDisabledSlots(s.disabledSlots || []);
          setBlockedHolidays(s.blockedHolidays || []);
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err);
        setError('Could not load administrative settings.');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [API_URL]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const payload = {
        ownerName,
        salonPhone,
        ownerWhatsapp,
        ownerEmail,
        workingHoursStart,
        workingHoursEnd,
        slots,
        disabledSlots,
        blockedHolidays
      };

      const res = await axios.put(`${API_URL}/settings`, payload);
      if (res.data.success) {
        setMessage('Settings saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(res.data.message || 'Failed to save settings.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred while saving settings.');
    } finally {
      setSaving(false);
    }
  };

  // Slots manager functions
  const handleAddSlot = () => {
    if (!newSlot) return;
    if (slots.includes(newSlot)) {
      setError('This slot already exists.');
      return;
    }
    setSlots(prev => [...prev, newSlot].sort());
    setNewSlot('');
  };

  const handleRemoveSlot = (slot) => {
    setSlots(prev => prev.filter(s => s !== slot));
    setDisabledSlots(prev => prev.filter(s => s !== slot));
  };

  const handleToggleDisableSlot = (slot) => {
    setDisabledSlots(prev => {
      if (prev.includes(slot)) {
        return prev.filter(s => s !== slot);
      } else {
        return [...prev, slot];
      }
    });
  };

  // Holiday manager functions
  const handleAddHoliday = () => {
    if (!newHoliday) return;
    if (blockedHolidays.includes(newHoliday)) {
      setError('This holiday date is already blocked.');
      return;
    }
    setBlockedHolidays(prev => [...prev, newHoliday].sort());
    setNewHoliday('');
  };

  const handleRemoveHoliday = (date) => {
    setBlockedHolidays(prev => prev.filter(d => d !== date));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin shadow-gold-glow mb-4"></div>
        <p className="font-heading text-xs text-[#D4AF37] uppercase tracking-widest">Loading Settings Panel...</p>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-zinc-950 pb-16 font-body text-white">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Settings Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-zinc-800 pb-6 mb-8 gap-4">
          <div>
            <span className="text-[#D4AF37] text-xs uppercase tracking-widest font-semibold flex items-center gap-1">
              <FiSettings /> Configuration Panel
            </span>
            <h1 className="font-heading text-3xl font-bold uppercase tracking-widest mt-1">Salon Settings</h1>
          </div>
        </div>

        {error && (
          <div className="bg-red-950/40 border border-red-900/50 text-red-200 p-4 rounded text-xs mb-8 text-center">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-zinc-900 border border-[#D4AF37]/35 text-[#D4AF37] p-4 rounded text-xs mb-8 text-center shadow-md">
            {message}
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Owner details card */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-zinc-900 border border-zinc-800/80 p-6 rounded-xl space-y-4">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[#D4AF37] border-b border-zinc-800 pb-3 flex items-center gap-2">
                <FiUser /> Salon Owner Configuration
              </h3>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-400">Owner Name</label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-2.5 text-sm focus:border-[#D4AF37] outline-none text-white transition-colors"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-400">Salon Phone Number</label>
                  <input
                    type="tel"
                    value={salonPhone}
                    onChange={(e) => setSalonPhone(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-2.5 text-sm focus:border-[#D4AF37] outline-none text-white transition-colors"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-400">Owner WhatsApp Contact</label>
                  <input
                    type="tel"
                    value={ownerWhatsapp}
                    onChange={(e) => setOwnerWhatsapp(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-2.5 text-sm focus:border-[#D4AF37] outline-none text-white transition-colors"
                    placeholder="Enter phone with country code e.g. +919999999999"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-400">Owner Email Address</label>
                  <input
                    type="email"
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-2.5 text-sm focus:border-[#D4AF37] outline-none text-white transition-colors"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Working Hours */}
            <div className="bg-zinc-900 border border-zinc-800/80 p-6 rounded-xl space-y-4">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[#D4AF37] border-b border-zinc-800 pb-3 flex items-center gap-2">
                <FiClock /> Working Hours
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-400">Shift Starts</label>
                  <input
                    type="text"
                    value={workingHoursStart}
                    onChange={(e) => setWorkingHoursStart(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-2.5 text-sm focus:border-[#D4AF37] outline-none text-white"
                    placeholder="e.g. 10:00 AM"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-400">Shift Ends</label>
                  <input
                    type="text"
                    value={workingHoursEnd}
                    onChange={(e) => setWorkingHoursEnd(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-2.5 text-sm focus:border-[#D4AF37] outline-none text-white"
                    placeholder="e.g. 08:00 PM"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Slots and holidays cards */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Slot Management Card */}
            <div className="bg-zinc-900 border border-zinc-800/80 p-6 rounded-xl space-y-4">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[#D4AF37] border-b border-zinc-800 pb-3 flex items-center gap-2">
                <FiClock /> Slots Management
              </h3>
              
              {/* Add slot sub-form */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. 02:30 PM"
                  value={newSlot}
                  onChange={(e) => setNewSlot(e.target.value)}
                  className="flex-grow bg-zinc-950 border border-zinc-850 rounded-lg p-2 text-xs focus:border-[#D4AF37] outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddSlot}
                  className="bg-zinc-800 hover:bg-zinc-700 text-[#D4AF37] border border-zinc-700 rounded-lg px-4 flex items-center gap-1 text-xs"
                >
                  <FiPlus /> Add
                </button>
              </div>

              {/* Slots List */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {slots.map(slot => {
                  const isDisabled = disabledSlots.includes(slot);
                  return (
                    <div key={slot} className="flex items-center justify-between p-2 bg-zinc-950 border border-zinc-850 rounded-lg text-xs">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={!isDisabled}
                          onChange={() => handleToggleDisableSlot(slot)}
                          className="w-3.5 h-3.5 accent-[#D4AF37] rounded cursor-pointer"
                        />
                        <span className={`font-mono ${isDisabled ? 'text-zinc-550 line-through' : 'text-white'}`}>{slot}</span>
                        {isDisabled && <span className="text-[9px] bg-red-950/20 text-red-400 border border-red-900/30 px-1 py-0.5 rounded">Disabled</span>}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSlot(slot)}
                        className="text-zinc-500 hover:text-red-450 p-1 transition-colors"
                        title="Remove Slot"
                      >
                        <FiTrash />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Blocked Holidays Card */}
            <div className="bg-zinc-900 border border-zinc-800/80 p-6 rounded-xl space-y-4">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[#D4AF37] border-b border-zinc-800 pb-3 flex items-center gap-2">
                <FiCalendar /> Block Holidays
              </h3>
              
              {/* Add holiday */}
              <div className="flex gap-2">
                <input
                  type="date"
                  value={newHoliday}
                  onChange={(e) => setNewHoliday(e.target.value)}
                  className="flex-grow bg-zinc-950 border border-zinc-850 rounded-lg p-2 text-xs focus:border-[#D4AF37] outline-none cursor-pointer"
                />
                <button
                  type="button"
                  onClick={handleAddHoliday}
                  className="bg-zinc-800 hover:bg-zinc-700 text-[#D4AF37] border border-zinc-700 rounded-lg px-4 flex items-center gap-1 text-xs"
                >
                  <FiPlus /> Block
                </button>
              </div>

              {/* Holidays list */}
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {blockedHolidays.length === 0 ? (
                  <p className="text-[10px] text-zinc-500 italic py-2 text-center">No blocked holiday dates.</p>
                ) : (
                  blockedHolidays.map(date => (
                    <div key={date} className="flex items-center justify-between p-2 bg-zinc-950 border border-zinc-850 rounded-lg text-xs font-mono">
                      <span>{date}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveHoliday(date)}
                        className="text-zinc-500 hover:text-red-450 p-1"
                        title="Unblock Date"
                      >
                        <FiTrash />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sticky footer action button */}
          <div className="col-span-12 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="py-3 px-8 bg-[#D4AF37] hover:bg-[#F3C65F] text-zinc-950 font-body font-bold text-xs uppercase tracking-widest rounded-lg transition-all shadow-md flex items-center gap-2 hover:scale-[1.02]"
            >
              <FiSave /> {saving ? 'Saving changes...' : 'Save Settings'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AdminSettings;
