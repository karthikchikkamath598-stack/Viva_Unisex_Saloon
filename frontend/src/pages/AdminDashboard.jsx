import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
  FiTrendingUp, FiCalendar, FiDollarSign, FiUsers, FiPlus, 
  FiTrash, FiCheck, FiX, FiLayers, FiSettings, FiSliders, FiEdit, 
  FiInfo, FiClock, FiActivity, FiUserPlus, FiPower, FiAward,
  FiImage, FiBell, FiShoppingCart, FiSearch
} from 'react-icons/fi';
import VivaLogo from '../components/VivaLogo';

// Default timeslots for scheduling fallback
const defaultSlots = [
  "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM",
  "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"
];

const subcategoriesByCategory = {
  "Women's Services": [
    "Premium Facial",
    "Face Clean Up",
    "Signature Facial",
    "Hair Spa",
    "Hair Treatment",
    "Rebonding",
    "Keratin",
    "Hair Cut",
    "Blow Dry",
    "Straightening / Smoothening",
    "Temporary Straightening",
    "Colours",
    "Makeup",
    "Bridal Makeup",
    "Threading",
    "Waxing",
    "Manicure",
    "Pedicure",
    "Nail Polish",
    "De Tan Premium",
    "Classic Facial",
    "Foot Massage",
    "Leg Massage"
  ],
  "Men's Services": [
    "Grooming",
    "Colours",
    "Beauty",
    "Spa",
    "Special Groom Package"
  ]
};

const AdminDashboard = () => {
  const { API_URL, logout, user } = useContext(AuthContext);
  const { pathname } = useLocation();

  const formatRole = (role) => {
    if (!role) return '';
    if (role === 'software_developer' || role === 'software_manager') return 'Software Developer';
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  // Map pathname to active sub-tab view
  let activeTab = 'overview';
  if (pathname === '/admin' || pathname === '/admin/dashboard') activeTab = 'overview';
  else if (pathname === '/admin/revenue') activeTab = 'revenue';
  else if (pathname === '/admin/orders') activeTab = 'bookings';
  else if (pathname === '/admin/customers') activeTab = 'customers';
  else if (pathname === '/admin/services' || pathname === '/admin/catalog') activeTab = 'services';
  else if (pathname === '/admin/billing') activeTab = 'billing';
  else if (pathname === '/admin/staff') activeTab = 'staff';
  else if (pathname === '/admin/memberships') activeTab = 'memberships';
  else if (pathname === '/admin/gallery') activeTab = 'gallery';
  else if (pathname === '/admin/notifications') activeTab = 'notifications';
  else if (pathname === '/admin/settings') activeTab = 'settings';

  // Stats / Charts Data
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalAppointments: 0,
    todayAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    monthlyRevenue: 0,
    activeStaff: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    thisMonthRevenue: 0,
    lastMonthRevenue: 0,
    otpSentToday: 0,
    otpVerifiedToday: 0,
    failedOtpAttempts: 0,
    verificationSuccessRate: 100,
    comparison: {
      appointments: { thisMonth: 0, lastMonth: 0, percentChange: 0, growth: true },
      revenue: { thisMonth: 0, lastMonth: 0, percentChange: 0, growth: true },
      customers: { newCustomers: 0, returningCustomers: 0 }
    },
    monthlyRevenueChart: [],
    revenueTrendGraph: [],
    revenueByCategory: [],
    stylistsChart: []
  });

  // Data lists
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // GALLERY CRUD Form States
  const [showGalleryForm, setShowGalleryForm] = useState(false);
  const [newGalleryItem, setNewGalleryItem] = useState({
    title: '',
    category: 'Haircut',
    imageUrl: '',
    isBeforeAfter: false,
    beforeImageUrl: '',
    afterImageUrl: ''
  });

  // Loading states
  const [loading, setLoading] = useState(true);

  // SERVICE CRUD Form States
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [showEditServiceForm, setShowEditServiceForm] = useState(false);
  const [newService, setNewService] = useState({ name: '', category: "Women's Services", subcategory: 'Premium Facial', description: '', price: '', duration: '', imageUrl: '', isPopular: false });
  const [editingService, setEditingService] = useState({ _id: '', name: '', category: "Women's Services", subcategory: 'Premium Facial', description: '', price: '', duration: '', imageUrl: '', isPopular: false });

  // POS Billing States
  const [posCart, setPosCart] = useState([]);
  const [posName, setPosName] = useState('');
  const [posPhone, setPosPhone] = useState('');
  const [posStaff, setPosStaff] = useState('');
  const [posAddGst, setPosAddGst] = useState(false);
  const [posSearch, setPosSearch] = useState('');
  const [posMembership, setPosMembership] = useState({ type: 'None', discount: 0 });
  const [posCheckingMembership, setPosCheckingMembership] = useState(false);
  const [generatedInvoice, setGeneratedInvoice] = useState(null);
  const [posCheckoutLoading, setPosCheckoutLoading] = useState(false);
  const [posCategory, setPosCategory] = useState("Women's Services");
  const [posDiscountType, setPosDiscountType] = useState('percent'); // 'percent' or 'rupees'
  const [posDiscountValue, setPosDiscountValue] = useState('');
  const [billingStats, setBillingStats] = useState({
    todayRevenue: 0,
    thisWeekRevenue: 0,
    thisMonthRevenue: 0,
    totalRevenue: 0,
    topStaff: { name: 'N/A', revenue: 0 },
    mostBookedServices: [],
    dailyBillsCount: 0,
    monthlyRevenueChart: [],
    staffReport: {
      Fardeen: { customersServed: 0, revenueGenerated: 0, servicesCompleted: 0 },
      Hussain: { customersServed: 0, revenueGenerated: 0, servicesCompleted: 0 },
      Sandhya: { customersServed: 0, revenueGenerated: 0, servicesCompleted: 0 }
    }
  });
  const [billsHistory, setBillsHistory] = useState([]);
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingSubTab, setBillingSubTab] = useState('pos'); // pos, analytics, history

  const fetchBillingData = useCallback(async () => {
    setBillingLoading(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('viva_token') || sessionStorage.getItem('viva_token')}`
        }
      };
      const [statsRes, historyRes] = await Promise.all([
        axios.get(`${API_URL}/billing/analytics`, config),
        axios.get(`${API_URL}/billing`, config)
      ]);
      if (statsRes.data.success) {
        setBillingStats(statsRes.data.stats);
      }
      if (historyRes.data.success) {
        setBillsHistory(historyRes.data.bills);
      }
    } catch (err) {
      console.error('Error fetching billing info:', err);
    } finally {
      setBillingLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    if (activeTab === 'billing') {
      fetchBillingData();
    }
  }, [activeTab, fetchBillingData]);

  const handlePhoneBlur = async () => {
    if (!posPhone || posPhone.length < 10) {
      setPosMembership({ type: 'None', discount: 0 });
      return;
    }
    setPosCheckingMembership(true);
    try {
      const res = await axios.get(`${API_URL}/billing/verify/${posPhone}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('viva_token') || sessionStorage.getItem('viva_token')}`
        }
      });
      if (res.data.success) {
        setPosMembership({
          type: res.data.membershipType,
          discount: res.data.discount
        });
      } else {
        setPosMembership({ type: 'None', discount: 0 });
      }
    } catch (err) {
      console.error('Error verifying customer membership:', err);
      setPosMembership({ type: 'None', discount: 0 });
    } finally {
      setPosCheckingMembership(false);
    }
  };

  const addToCart = (service) => {
    setPosCart(prev => [...prev, {
      _id: service._id,
      name: service.name,
      price: service.price
    }]);
  };

  const removeFromCart = (index) => {
    setPosCart(prev => prev.filter((_, idx) => idx !== index));
  };

  const handlePosCheckout = async (e) => {
    e.preventDefault();
    if (!posStaff) {
      alert('Staff selection is mandatory.');
      return;
    }
    if (posCart.length === 0) {
      alert('Please add at least one service to the bill.');
      return;
    }
    setPosCheckoutLoading(true);
    try {
      const payload = {
        customerName: posName,
        mobileNumber: posPhone,
        staffMember: posStaff,
        services: posCart,
        addGst: posAddGst,
        manualDiscountType: posDiscountType,
        manualDiscountValue: posDiscountValue
      };
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('viva_token') || sessionStorage.getItem('viva_token')}`
        }
      };
      const res = await axios.post(`${API_URL}/billing`, payload, config);
      if (res.data.success) {
        setGeneratedInvoice(res.data.bill);
        // Reset POS form
        setPosCart([]);
        setPosName('');
        setPosPhone('');
        setPosStaff('');
        setPosAddGst(false);
        setPosDiscountType('percent');
        setPosDiscountValue('');
        setPosMembership({ type: 'None', discount: 0 });
        // Refresh billing stats
        fetchBillingData();
      }
    } catch (err) {
      alert('Error during POS checkout: ' + (err.response?.data?.message || err.message));
    } finally {
      setPosCheckoutLoading(false);
    }
  };

  const handlePrintInvoice = () => {
    if (!generatedInvoice) return;
    const printWindow = window.open('', '_blank');
    const servicesHtml = generatedInvoice.services.map(s => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${s.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">₹${s.price}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${generatedInvoice.billId}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; color: #333; padding: 20px; }
            .invoice-box { max-width: 400px; margin: auto; padding: 10px; border: 1px solid #eee; }
            .title { text-align: center; margin-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; letter-spacing: 2px; }
            .details { font-size: 12px; margin-bottom: 20px; line-height: 1.5; }
            .totals { font-size: 13px; font-weight: bold; margin-top: 15px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            .text-right { text-align: right; }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <div class="title">
              <div class="logo">VIVA</div>
              <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px;">Unisex Salon - Premium Luxury Lounge</div>
            </div>
            <div class="details">
              <strong>Bill ID:</strong> ${generatedInvoice.billId}<br>
              <strong>Date & Time:</strong> ${generatedInvoice.date} ${generatedInvoice.time}<br>
              <strong>Stylist:</strong> ${generatedInvoice.staffMember}<br>
              ${generatedInvoice.customerName ? `<strong>Customer:</strong> ${generatedInvoice.customerName}<br>` : ''}
              ${generatedInvoice.mobileNumber ? `<strong>Mobile:</strong> ${generatedInvoice.mobileNumber}<br>` : ''}
              ${generatedInvoice.membershipType !== 'None' ? `<strong>Membership:</strong> ${generatedInvoice.membershipType}<br>` : ''}
            </div>
            <table>
              <thead>
                <tr>
                  <th style="text-align: left; padding: 8px; border-bottom: 2px solid #333;">Service</th>
                  <th style="text-align: right; padding: 8px; border-bottom: 2px solid #333;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${servicesHtml}
              </tbody>
            </table>
            <div class="details totals" style="text-align: right;">
              <div>Subtotal: ₹${generatedInvoice.subtotal}</div>
              ${generatedInvoice.discount > 0 ? `<div>Membership Discount (${generatedInvoice.membershipType}): -₹${generatedInvoice.discount}</div>` : ''}
              ${generatedInvoice.gst > 0 ? `<div>GST (18%): ₹${generatedInvoice.gst}</div>` : ''}
              <div style="font-size: 16px; margin-top: 8px; border-top: 1px dashed #333; padding-top: 8px;">Grand Total: ₹${generatedInvoice.grandTotal}</div>
            </div>
            <div style="text-align: center; font-size: 10px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
              Thank you for visiting VIVA. Experience royalty.
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); };
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadInvoicePDF = () => {
    if (!generatedInvoice) return;
    const servicesHtml = generatedInvoice.services.map(s => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #333;">${s.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #333; text-align: right;">₹${s.price}</td>
      </tr>
    `).join('');

    const invoiceContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${generatedInvoice.billId}</title>
          <style>
            body { font-family: 'Georgia', serif; background-color: #0b0b0c; color: #f4f4f4; padding: 40px; margin: 0; }
            .invoice-container { max-width: 600px; margin: auto; background-color: #121417; border: 1px solid #D4AF37; padding: 40px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
            .header { text-align: center; border-bottom: 1px solid #D4AF37; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 36px; font-weight: bold; color: #D4AF37; letter-spacing: 4px; }
            .tagline { font-size: 11px; text-transform: uppercase; color: #a1a1a5; letter-spacing: 2px; margin-top: 5px; }
            .grid { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; font-size: 13px; line-height: 1.6; margin-bottom: 30px; }
            .details-left { color: #d1d1d6; }
            .details-right { text-align: right; color: #d1d1d6; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 13px; }
            th { text-align: left; padding: 12px; border-bottom: 2px solid #D4AF37; color: #D4AF37; text-transform: uppercase; letter-spacing: 1px; }
            td { padding: 12px; border-bottom: 1px solid #222; }
            .totals { text-align: right; font-size: 14px; color: #d1d1d6; line-height: 1.8; }
            .grand-total { font-size: 20px; color: #D4AF37; font-weight: bold; border-top: 1px dashed #D4AF37; padding-top: 10px; margin-top: 10px; }
            .footer { text-align: center; font-size: 11px; color: #8f9194; margin-top: 50px; border-top: 1px solid #222; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="header">
              <div class="logo">VIVA</div>
              <div class="tagline">Unisex Salon - Premium Luxury Lounge</div>
            </div>
            <div class="grid">
              <div class="details-left">
                <strong>INVOICE TO:</strong><br>
                Name: ${generatedInvoice.customerName || 'Valued Guest'}<br>
                Phone: ${generatedInvoice.mobileNumber || 'N/A'}<br>
                Membership: ${generatedInvoice.membershipType}<br>
              </div>
              <div class="details-right">
                <strong>INVOICE DETAILS:</strong><br>
                Invoice ID: ${generatedInvoice.billId}<br>
                Date: ${generatedInvoice.date}<br>
                Time: ${generatedInvoice.time}<br>
                Stylist: ${generatedInvoice.staffMember}<br>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Service Description</th>
                  <th style="text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${servicesHtml}
              </tbody>
            </table>
            <div class="totals">
              <div>Subtotal: ₹${generatedInvoice.subtotal}</div>
              ${generatedInvoice.discount > 0 ? `<div>Membership Discount (${generatedInvoice.membershipType}): -₹${generatedInvoice.discount}</div>` : ''}
              ${generatedInvoice.gst > 0 ? `<div>GST (18%): ₹${generatedInvoice.gst}</div>` : ''}
              <div class="grand-total">Grand Total: ₹${generatedInvoice.grandTotal}</div>
            </div>
            <div class="footer">
              Thank you for choosing VIVA. Experience royalty.<br>
              VIVA Unisex Salon - Luxury Beauty Lounge
            </div>
          </div>
        </body>
      </html>
    `;
    
    const blob = new Blob([invoiceContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice_${generatedInvoice.billId}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // STAFF CRUD Form States
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [showEditStaffForm, setShowEditStaffForm] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', specialty: '', imageUrl: '', skills: '' });
  const [editingStaff, setEditingStaff] = useState({ _id: '', name: '', specialty: '', imageUrl: '', skills: '', status: 'Active' });

  // RESCHEDULE Modal States
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [reschedulingApp, setReschedulingApp] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTimeSlot, setRescheduleTimeSlot] = useState('');
  const [rescheduleSlots, setRescheduleSlots] = useState([]);
  const [rescheduleSlotsLoading, setRescheduleSlotsLoading] = useState(false);

  // MEMBERSHIP Override States
  const [memberships, setMemberships] = useState([]);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overridingUser, setOverridingUser] = useState(null);
  const [overrideType, setOverrideType] = useState('None');
  const [overrideStatus, setOverrideStatus] = useState('None');
  const [overrideExpiryDate, setOverrideExpiryDate] = useState('');

  // CUSTOMER Listing States
  const [customers, setCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerFilter, setCustomerFilter] = useState('All');
  const [expandedCustomerPhone, setExpandedCustomerPhone] = useState(null);

  // SETTINGS & MEMBERSHIPS CONFIGURATION States
  const [settings, setSettingsData] = useState(null);
  const [newBenefits, setNewBenefits] = useState({ student: '', silver: '', platinum: '' });

  const [settingsForm, setSettingsForm] = useState({
    ownerName: '',
    salonPhone: '',
    ownerWhatsapp: '',
    ownerEmail: '',
    workingHoursStart: '',
    workingHoursEnd: ''
  });

  useEffect(() => {
    if (settings) {
      setSettingsForm({
        ownerName: settings.ownerName || '',
        salonPhone: settings.salonPhone || '',
        ownerWhatsapp: settings.ownerWhatsapp || '',
        ownerEmail: settings.ownerEmail || '',
        workingHoursStart: settings.workingHoursStart || '',
        workingHoursEnd: settings.workingHoursEnd || ''
      });
    }
  }, [settings]);

  const handleSaveGeneralSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${API_URL}/settings`, settingsForm);
      if (res.data.success) {
        setSettingsData(res.data.settings);
        alert('Salon configurations updated successfully.');
      }
    } catch (err) {
      alert('Error updating salon settings: ' + (err.response?.data?.message || err.message));
    }
  };

  // MOBILE Screen size check
  const [isMobileScreen, setIsMobileScreen] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredCustomers = customers.filter(c => {
    const searchLower = customerSearch.toLowerCase();
    const matchesSearch = 
      (c.fullName && c.fullName.toLowerCase().includes(searchLower)) || 
      (c.mobileNumber && c.mobileNumber.includes(searchLower));
    const matchesFilter = customerFilter === 'All' || c.membershipTier === customerFilter;
    return matchesSearch && matchesFilter;
  });

  // Initial Fetch all records
  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, appRes, srvRes, staffRes, membershipRes, galleryRes, notificationRes, customerRes, settingsRes] = await Promise.all([
        axios.get(`${API_URL}/analytics`),
        axios.get(`${API_URL}/appointments/admin-bookings`),
        axios.get(`${API_URL}/services`),
        axios.get(`${API_URL}/stylists`),
        axios.get(`${API_URL}/memberships/admin/all`),
        axios.get(`${API_URL}/gallery`),
        axios.get(`${API_URL}/notifications`),
        axios.get(`${API_URL}/customers`),
        axios.get(`${API_URL}/settings`)
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (appRes.data.success) setBookings(appRes.data.appointments);
      if (srvRes.data.success) setServices(srvRes.data.services);
      if (staffRes.data.success) setStaff(statsRes.data.stylists || staffRes.data.stylists);
      if (membershipRes.data.success) setMemberships(membershipRes.data.memberships);
      if (galleryRes.data.success) setGallery(galleryRes.data.gallery || []);
      if (notificationRes.data.success) setNotifications(notificationRes.data.notifications || []);
      if (customerRes.data.success) setCustomers(customerRes.data.customers || []);
      if (settingsRes.data.success) setSettingsData(settingsRes.data.settings);

    } catch (err) {
      console.error('Error fetching admin records', err);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  const handleSaveMembershipConfig = async (tierName, config) => {
    try {
      const updatedMemberships = {
        ...settings.memberships,
        [tierName]: config
      };
      const res = await axios.put(`${API_URL}/settings`, {
        memberships: updatedMemberships
      });
      if (res.data.success) {
        setSettingsData(res.data.settings);
        alert(`${tierName.toUpperCase()} membership configuration updated successfully.`);
      }
    } catch (err) {
      alert('Error updating membership configuration: ' + (err.response?.data?.message || err.message));
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  // Dynamic slots load on rescheduling date pick
  useEffect(() => {
    const fetchRescheduleSlots = async () => {
      if (!rescheduleDate) return;
      setRescheduleSlotsLoading(true);
      setRescheduleTimeSlot('');
      try {
        const res = await axios.get(`${API_URL}/appointments/slots`, {
          params: { date: rescheduleDate }
        });
        if (res.data.success) {
          setRescheduleSlots(res.data.slots);
        } else {
          setRescheduleSlots(defaultSlots.map(s => ({ slot: s, isAvailable: true })));
        }
      } catch (err) {
        console.error('Reschedule slots loading failed:', err);
        setRescheduleSlots(defaultSlots.map(s => ({ slot: s, isAvailable: true })));
      } finally {
        setRescheduleSlotsLoading(false);
      }
    };
    fetchRescheduleSlots();
  }, [rescheduleDate, API_URL]);

  // Update Booking Status (Confirm, Complete, Cancel)
  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await axios.put(`${API_URL}/appointments/${id}/status`, { status });
      if (res.data.success) {
        setBookings(prev => 
          prev.map(app => app._id === id ? { ...app, status: res.data.appointment.status } : app)
        );
        // Refresh analytics numbers
        const statsRes = await axios.get(`${API_URL}/analytics`);
        if (statsRes.data.success) setStats(statsRes.data.stats);
      }
    } catch (err) {
      alert('Error updating booking status: ' + (err.response?.data?.message || err.message));
    }
  };

  // Submit Reschedule details
  const submitReschedule = async (e) => {
    e.preventDefault();
    if (!rescheduleDate || !rescheduleTimeSlot || !reschedulingApp) return;

    try {
      const res = await axios.put(`${API_URL}/appointments/${reschedulingApp._id}/reschedule`, {
        date: rescheduleDate,
        timeSlot: rescheduleTimeSlot
      });

      if (res.data.success) {
        setBookings(prev =>
          prev.map(app => app._id === reschedulingApp._id 
            ? { ...app, appointmentDate: rescheduleDate, appointmentTime: rescheduleTimeSlot } 
            : app
          )
        );
        setShowRescheduleModal(false);
        setReschedulingApp(null);
        setRescheduleDate('');
        setRescheduleTimeSlot('');
        
        // Refresh analytics numbers
        const statsRes = await axios.get(`${API_URL}/analytics`);
        if (statsRes.data.success) setStats(statsRes.data.stats);
      }
    } catch (err) {
      alert('Rescheduling error: ' + (err.response?.data?.message || err.message));
    }
  };

  // SERVICES CRUD
  const handleAddService = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/services`, newService);
      if (res.data.success) {
        setServices(prev => [res.data.service, ...prev]);
        setShowServiceForm(false);
        setNewService({ name: '', category: "Women's Services", subcategory: 'Premium Facial', description: '', price: '', duration: '', imageUrl: '', isPopular: false });
      }
    } catch (err) {
      alert('Error creating service: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEditService = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${API_URL}/services/${editingService._id}`, editingService);
      if (res.data.success) {
        setServices(prev => 
          prev.map(s => s._id === editingService._id ? res.data.service : s)
        );
        setShowEditServiceForm(false);
        setEditingService({ _id: '', name: '', category: "Women's Services", subcategory: 'Premium Facial', description: '', price: '', duration: '', imageUrl: '', isPopular: false });
      }
    } catch (err) {
      alert('Error updating service: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      const res = await axios.delete(`${API_URL}/services/${id}`);
      if (res.data.success) {
        setServices(prev => prev.filter(s => s._id !== id));
      }
    } catch (err) {
      alert('Error deleting service: ' + (err.response?.data?.message || err.message));
    }
  };

  // STAFF CRUD
  const handleAddStaff = async (e) => {
    e.preventDefault();
    try {
      const skillsArray = newStaff.skills.split(',').map(s => s.trim()).filter(Boolean);
      const payload = {
        name: newStaff.name,
        specialty: newStaff.specialty,
        imageUrl: newStaff.imageUrl,
        skills: skillsArray
      };
      
      const res = await axios.post(`${API_URL}/stylists`, payload);
      if (res.data.success) {
        setStaff(prev => [res.data.stylist, ...prev]);
        setShowStaffForm(false);
        setNewStaff({ name: '', specialty: '', imageUrl: '', skills: '' });
      }
    } catch (err) {
      alert('Error adding staff: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEditStaff = async (e) => {
    e.preventDefault();
    try {
      const skillsArray = Array.isArray(editingStaff.skills) 
        ? editingStaff.skills 
        : editingStaff.skills.split(',').map(s => s.trim()).filter(Boolean);

      const payload = {
        ...editingStaff,
        skills: skillsArray
      };

      const res = await axios.put(`${API_URL}/stylists/${editingStaff._id}`, payload);
      if (res.data.success) {
        setStaff(prev => 
          prev.map(s => s._id === editingStaff._id ? res.data.stylist : s)
        );
        setShowEditStaffForm(false);
      }
    } catch (err) {
      alert('Error updating staff: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleToggleStaffStatus = async (st) => {
    const nextStatus = st.status === 'Inactive' ? 'Active' : 'Inactive';
    try {
      const res = await axios.put(`${API_URL}/stylists/${st._id}`, { status: nextStatus });
      if (res.data.success) {
        setStaff(prev => 
          prev.map(s => s._id === st._id ? { ...s, status: nextStatus } : s)
        );
        // Refresh active staff metric in dashboard
        const statsRes = await axios.get(`${API_URL}/analytics`);
        if (statsRes.data.success) setStats(statsRes.data.stats);
      }
    } catch (err) {
      alert('Error toggling staff status: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteStaff = async (id) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) return;
    try {
      const res = await axios.delete(`${API_URL}/stylists/${id}`);
      if (res.data.success) {
        setStaff(prev => prev.filter(s => s._id !== id));
      }
    } catch (err) {
      alert('Error deleting staff: ' + (err.response?.data?.message || err.message));
    }
  };

  // Helper date utilities
  const getTomorrowString = () => {
    const tom = new Date();
    tom.setDate(tom.getDate() + 1);
    return tom.toISOString().split('T')[0];
  };

  // Membership Approval / Rejection Handlers
  const handleApproveStudent = async (userId) => {
    try {
      const res = await axios.put(`${API_URL}/memberships/admin/${userId}/approve`);
      if (res.data.success) {
        alert('Student membership approved successfully.');
        fetchAdminData();
      }
    } catch (err) {
      alert('Error approving student membership: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleRejectStudent = async (userId) => {
    try {
      const res = await axios.put(`${API_URL}/memberships/admin/${userId}/reject`);
      if (res.data.success) {
        alert('Student membership request rejected.');
        fetchAdminData();
      }
    } catch (err) {
      alert('Error rejecting student membership: ' + (err.response?.data?.message || err.message));
    }
  };

  // Membership Manual Override handler
  const handleManualOverride = async (e) => {
    e.preventDefault();
    if (!overridingUser) return;
    try {
      const res = await axios.put(`${API_URL}/memberships/admin/${overridingUser._id}/manual`, {
        type: overrideType,
        status: overrideStatus,
        expiryDate: overrideExpiryDate || null
      });
      if (res.data.success) {
        alert('Membership overridden successfully.');
        setShowOverrideModal(false);
        setOverridingUser(null);
        fetchAdminData();
      }
    } catch (err) {
      alert('Error overriding membership: ' + (err.response?.data?.message || err.message));
    }
  };

  // GALLERY CRUD
  const handleAddGalleryItem = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/gallery`, newGalleryItem);
      if (res.data.success) {
        setGallery(prev => [res.data.galleryItem, ...prev]);
        setShowGalleryForm(false);
        setNewGalleryItem({
          title: '',
          category: 'Haircut',
          imageUrl: '',
          isBeforeAfter: false,
          beforeImageUrl: '',
          afterImageUrl: ''
        });
      }
    } catch (err) {
      alert('Error creating gallery item: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteGalleryItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this gallery item?')) return;
    try {
      const res = await axios.delete(`${API_URL}/gallery/${id}`);
      if (res.data.success) {
        setGallery(prev => prev.filter(g => g._id !== id));
      }
    } catch (err) {
      alert('Error deleting gallery item: ' + (err.response?.data?.message || err.message));
    }
  };

  if (isMobileScreen) {
    return (
      <div className="min-h-screen bg-[#080809] flex flex-col items-center justify-center text-center px-6 select-none font-body">
        <div className="max-w-md w-full bg-[#121417] border border-red-900/30 p-10 rounded-xl shadow-2xl">
          <div className="flex justify-center mb-6">
            <VivaLogo size={56} className="text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.4)]" />
          </div>
          <h2 className="font-heading text-xl font-bold text-white uppercase tracking-widest mb-3">Restricted Portal</h2>
          <p className="text-sm text-red-200 leading-relaxed mb-8 font-light mx-auto">
            Admin Dashboard is available only on Desktop Devices.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div data-lenis-prevent className="min-h-screen bg-zinc-950 font-body text-white flex flex-col md:flex-row">
      
      {/* Left Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-zinc-900 border-b md:border-b-0 md:border-r border-white/5 flex flex-col md:h-screen md:sticky md:top-0 md:left-0 flex-shrink-0 z-40">
        {/* Sidebar Logo Header */}
        <div className="flex items-center gap-3 p-6 border-b border-white/5">
          <VivaLogo
            size={40}
            className="drop-shadow-[0_0_8px_rgba(212,164,55,0.3)] flex-shrink-0"
          />
          <div>
            <h1 className="font-heading text-lg font-bold uppercase tracking-widest text-white">VIVA Salon</h1>
            <span className="text-[#D4AF37] text-[9px] uppercase tracking-widest font-semibold">Admin Panel</span>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
          {[
            { id: 'overview', label: 'Dashboard Overview', icon: <FiSliders />, path: '/admin/dashboard' },
            { id: 'billing', label: 'Billing POS', icon: <FiShoppingCart />, path: '/admin/billing' },
            { id: 'bookings', label: 'Appointments', icon: <FiCalendar />, path: '/admin/orders' },
            { id: 'customers', label: 'Customers', icon: <FiUsers />, path: '/admin/customers' },
            { id: 'services', label: 'Services', icon: <FiLayers />, path: '/admin/catalog' },
            { id: 'memberships', label: 'Memberships', icon: <FiAward />, path: '/admin/memberships' },
            { id: 'gallery', label: 'Gallery', icon: <FiImage />, path: '/admin/gallery' },
            { id: 'notifications', label: 'Notifications', icon: <FiBell />, path: '/admin/notifications' },
            { id: 'revenue', label: 'Revenue Analytics', icon: <FiTrendingUp />, path: '/admin/revenue' },
            { id: 'settings', label: 'Settings', icon: <FiSettings />, path: '/admin/settings' }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <Link
                key={tab.id}
                to={tab.path}
                className={`flex items-center gap-3 px-4 py-3 rounded text-xs uppercase tracking-wider transition-all duration-200 border ${
                  isActive 
                    ? 'bg-[#D4AF37] border-[#D4AF37] text-zinc-950 font-bold shadow-gold-glow' 
                    : 'bg-transparent border-transparent text-white hover:bg-white/5 hover:border-white/5'
                }`}
              >
                <span className="text-sm">{tab.icon}</span>
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer / Logout */}
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-6 py-4 text-red-400 hover:text-red-300 hover:bg-white/5 text-xs font-bold uppercase tracking-widest mt-auto border-t border-white/5 outline-none"
        >
          <FiPower className="text-sm" />
          <span>Logout</span>
        </button>
      </aside>

      {/* Right Content Area */}
      <main className="flex-grow p-6 md:p-10 max-w-full overflow-x-hidden md:h-screen md:overflow-y-auto">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-zinc-800 pb-6 mb-8 gap-4">
          <div>
            <span className="text-[#D4AF37] text-xs uppercase tracking-widest font-semibold flex items-center gap-1">
              {activeTab === 'overview' && <><FiSliders /> Overview Metrics</>}
              {activeTab === 'revenue' && <><FiTrendingUp /> Revenue Metrics</>}
              {activeTab === 'bookings' && <><FiCalendar /> Appointments</>}
              {activeTab === 'customers' && <><FiUsers /> Customers Directory</>}
              {activeTab === 'services' && <><FiLayers /> Treatment Catalog</>}
              {activeTab === 'billing' && <><FiDollarSign /> Billing POS</>}
              {activeTab === 'staff' && <><FiUsers /> Stylists Team</>}
              {activeTab === 'memberships' && <><FiAward /> VIP Memberships</>}
              {activeTab === 'gallery' && <><FiImage /> Before/After Gallery</>}
              {activeTab === 'notifications' && <><FiBell /> System Logs</>}
              {activeTab === 'settings' && <><FiSettings /> Salon Configurations</>}
            </span>
            <h2 className="font-heading text-2xl font-bold uppercase tracking-widest mt-1">
              {activeTab === 'overview' && 'Salon Dashboard'}
              {activeTab === 'revenue' && 'Revenue Analytics'}
              {activeTab === 'bookings' && 'Appointments'}
              {activeTab === 'customers' && 'Customers'}
              {activeTab === 'services' && 'Services'}
              {activeTab === 'billing' && 'Billing POS'}
              {activeTab === 'staff' && 'Staff Management'}
              {activeTab === 'memberships' && 'Memberships'}
              {activeTab === 'gallery' && 'Gallery'}
              {activeTab === 'notifications' && 'Notifications'}
              {activeTab === 'settings' && 'Settings'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <div className="text-right hidden sm:block">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold block">Logged In As: <span className="text-[#D4AF37]">{formatRole(user.role)}</span></span>
                <span className="text-xs text-white font-bold block">{user.fullName || user.name}</span>
                <span className="text-[10px] text-zinc-400 block font-mono">{user.mobileNumber || user.phone}</span>
              </div>
            )}
            <button 
              onClick={fetchAdminData}
              className="text-xs border border-[#D4AF37]/30 hover:border-[#D4AF37] text-[#D4AF37] hover:text-zinc-950 hover:bg-[#D4AF37] px-4 py-2 rounded transition-colors uppercase tracking-wider"
            >
              Refresh Records
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin shadow-gold-glow mb-4"></div>
            <span className="text-xs text-[#D4AF37] tracking-widest uppercase">Syncing Records...</span>
          </div>
        ) : (
          <div>
            
            {/* SUB-VIEW: POS BILLING */}
            {activeTab === 'billing' && (
              <div className="space-y-6 animate-fade-in text-viva-white font-body">
                {/* Billing Sub-navigation tabs */}
                <div className="flex gap-4 border-b border-white/5 pb-4">
                  <button 
                    onClick={() => setBillingSubTab('pos')}
                    className={`px-4 py-2 text-xs uppercase tracking-wider font-bold rounded transition-colors ${
                      billingSubTab === 'pos' ? 'bg-[#D4AF37] text-zinc-950 font-bold shadow-gold-glow' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    New POS Bill
                  </button>
                  <button 
                    onClick={() => setBillingSubTab('analytics')}
                    className={`px-4 py-2 text-xs uppercase tracking-wider font-bold rounded transition-colors ${
                      billingSubTab === 'analytics' ? 'bg-[#D4AF37] text-zinc-950 font-bold shadow-gold-glow' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    Billing Analytics
                  </button>
                  <button 
                    onClick={() => setBillingSubTab('history')}
                    className={`px-4 py-2 text-xs uppercase tracking-wider font-bold rounded transition-colors ${
                      billingSubTab === 'history' ? 'bg-[#D4AF37] text-zinc-950 font-bold shadow-gold-glow' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    Daily Bills Log
                  </button>
                </div>

                {/* POS CHECKOUT SCREEN */}
                {billingSubTab === 'pos' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Smart search and catalogue */}
                    <div className="lg:col-span-7 space-y-6">
                      <div className="bg-zinc-900 border border-white/5 p-5 rounded-lg space-y-4 shadow-xl">
                        <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[#D4AF37]">Smart Service Search</h3>
                        
                        <div className="relative">
                          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                          <input 
                            type="text" 
                            placeholder="Type service name (e.g. Hair, Facial, Keratin)..."
                            value={posSearch}
                            onChange={(e) => setPosSearch(e.target.value)}
                            className="viva-input w-full pl-10"
                          />
                        </div>

                        {/* Category filter tabs */}
                        <div className="flex gap-2">
                          {["All", "Women's Services", "Men's Services"].map(cat => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => { setPosCategory(cat); }}
                              className={`px-3 py-1.5 rounded text-[10px] uppercase tracking-wider font-semibold transition-colors ${
                                posCategory === cat ? 'bg-zinc-800 text-[#D4AF37] border border-[#D4AF37]/50 font-bold' : 'bg-zinc-950 text-zinc-400 border border-white/5'
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Matching Services Grid */}
                      <div className="bg-zinc-900 border border-white/5 p-6 rounded-lg shadow-xl space-y-4">
                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                          <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                            {posSearch ? 'Search Results' : 'Browse Services'}
                          </h4>
                          <span className="text-[10px] text-zinc-500 font-mono font-bold">Click row to add to bill</span>
                        </div>

                        <div className="max-h-[500px] overflow-y-auto space-y-2 pr-1">
                          {services
                            .filter(s => {
                              const matchesSearch = s.name.toLowerCase().includes(posSearch.toLowerCase()) ||
                                                    (s.subcategory && s.subcategory.toLowerCase().includes(posSearch.toLowerCase()));
                              const matchesCategory = posCategory === 'All' || s.category === posCategory;
                              return matchesSearch && matchesCategory;
                            })
                            .map(s => (
                              <div 
                                key={s._id}
                                onClick={() => addToCart(s)}
                                className="flex justify-between items-center bg-zinc-950 hover:bg-zinc-800 border border-white/5 hover:border-[#D4AF37]/30 p-3.5 rounded-lg cursor-pointer transition-all duration-200 select-none group"
                              >
                                <div className="min-w-0">
                                  <span className="text-xs font-bold text-white group-hover:text-[#D4AF37] transition-colors block">&#9745; {s.name}</span>
                                  <span className="text-[9px] text-zinc-500 uppercase tracking-widest block mt-0.5">{s.category.replace(" Services", "")} &bull; {s.subcategory}</span>
                                </div>
                                <span className="text-xs text-[#D4AF37] font-bold font-mono">₹{s.price}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Checkout Form & Totals */}
                    <div className="lg:col-span-5 bg-zinc-900 border border-white/5 p-6 rounded-lg shadow-xl space-y-6">
                      <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[#D4AF37] border-b border-white/5 pb-2 flex items-center gap-2">
                        <FiShoppingCart /> Bill Checkout compiler
                      </h3>

                      {/* Customer Details Form */}
                      <div className="space-y-4">
                        <div className="flex flex-col space-y-1.5">
                          <label className="text-[9px] uppercase tracking-widest text-zinc-450 font-bold">Customer Name (Optional)</label>
                          <input 
                            type="text"
                            placeholder="Guest Name"
                            value={posName}
                            onChange={(e) => setPosName(e.target.value)}
                            className="viva-input w-full"
                          />
                        </div>

                        <div className="flex flex-col space-y-1.5">
                          <label className="text-[9px] uppercase tracking-widest text-zinc-450 font-bold">Mobile Number (Optional)</label>
                          <div className="relative">
                            <input 
                              type="tel"
                              placeholder="e.g. 9876543210"
                              value={posPhone}
                              onChange={(e) => setPosPhone(e.target.value)}
                              onBlur={handlePhoneBlur}
                              className="viva-input w-full"
                              maxLength={10}
                            />
                            {posCheckingMembership && (
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500">Checking...</span>
                            )}
                          </div>
                          {posMembership.type !== 'None' && (
                            <span className="text-[10px] text-viva-gold font-bold uppercase tracking-wide flex items-center gap-1 mt-1">
                              &#9733; {posMembership.type} Member - {posMembership.discount}% Auto-applied!
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col space-y-1.5">
                          <label className="text-[9px] uppercase tracking-widest text-zinc-450 font-bold">Preferred Stylist (Mandatory) *</label>
                          <select
                            value={posStaff}
                            onChange={(e) => setPosStaff(e.target.value)}
                            className="viva-input w-full cursor-pointer border border-[#D4AF37]/30 text-white focus:border-[#D4AF37]"
                            required
                          >
                            <option value="">-- Choose Stylist --</option>
                            <option value="Fardeen">Fardeen</option>
                            <option value="Hussain">Hussain</option>
                            <option value="Sandhya">Sandhya</option>
                          </select>
                        </div>

                        {/* Manual Discount Selector */}
                        <div className="grid grid-cols-3 gap-3 items-end">
                          <div className="col-span-2 flex flex-col space-y-1.5">
                            <label className="text-[9px] uppercase tracking-widest text-zinc-450 font-bold">Manual Discount (Optional)</label>
                            <input 
                              type="number"
                              placeholder={posDiscountType === 'percent' ? "e.g. 10 for 10%" : "e.g. 500 for ₹500"}
                              value={posDiscountValue}
                              onChange={(e) => setPosDiscountValue(e.target.value)}
                              className="viva-input w-full border border-zinc-800 focus:border-[#D4AF37] text-white"
                              min="0"
                            />
                          </div>
                          <div className="flex flex-col space-y-1.5">
                            <label className="text-[9px] uppercase tracking-widest text-zinc-450 font-bold">Discount Unit</label>
                            <select
                              value={posDiscountType}
                              onChange={(e) => setPosDiscountType(e.target.value)}
                              className="viva-input w-full cursor-pointer border border-zinc-800 text-white"
                            >
                              <option value="percent">% Percent</option>
                              <option value="rupees">₹ Rupees</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Selected Cart Listing */}
                      <div className="space-y-3">
                        <span className="text-[9px] uppercase tracking-widest text-zinc-450 font-bold block">Selected Services ({posCart.length})</span>
                        
                        {posCart.length === 0 ? (
                          <div className="text-center py-8 bg-zinc-950 border border-dashed border-white/5 rounded-lg">
                            <p className="text-xs text-zinc-550">Cart is empty. Click services on the left to add.</p>
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                            {posCart.map((item, index) => (
                              <div key={index} className="flex justify-between items-center bg-zinc-950 p-3 rounded-lg border border-white/5 text-xs">
                                <span className="text-white font-medium truncate max-w-[200px]">{item.name}</span>
                                <div className="flex items-center gap-3">
                                  <span className="text-zinc-300 font-mono">₹{item.price}</span>
                                  <button 
                                    type="button" 
                                    onClick={() => removeFromCart(index)}
                                    className="text-red-400 hover:text-red-350 transition-colors outline-none"
                                  >
                                    <FiTrash />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Totals Summary */}
                      {(() => {
                        const subtotal = posCart.reduce((sum, item) => sum + item.price, 0);
                        let discountAmount = 0;
                        let discountLabel = '';

                        if (posDiscountValue !== '' && Number(posDiscountValue) > 0) {
                          if (posDiscountType === 'percent') {
                            discountAmount = Math.round(subtotal * (Number(posDiscountValue) / 100));
                            discountLabel = `Manual Discount (${posDiscountValue}%)`;
                          } else if (posDiscountType === 'rupees') {
                            discountAmount = Math.round(Number(posDiscountValue));
                            discountLabel = `Manual Discount`;
                          }
                        } else if (posMembership.discount > 0) {
                          discountAmount = Math.round(subtotal * (posMembership.discount / 100));
                          discountLabel = `Discount (${posMembership.type})`;
                        }

                        // Cap discount at subtotal to prevent negative totals
                        discountAmount = Math.min(discountAmount, subtotal);

                        const totalAfterDiscount = subtotal - discountAmount;
                        const gstAmount = posAddGst ? Math.round(totalAfterDiscount * 0.18) : 0;
                        const grandTotal = totalAfterDiscount + gstAmount;

                        return (
                          <div className="bg-zinc-950 p-4 rounded-lg border border-white/5 space-y-3 font-mono text-xs">
                            <div className="flex justify-between text-zinc-400 font-body">
                              <span>Subtotal:</span>
                              <span className="font-mono">₹{subtotal}</span>
                            </div>
                            {discountAmount > 0 && (
                              <div className="flex justify-between text-[#D4AF37] font-semibold font-body">
                                <span>{discountLabel}:</span>
                                <span className="font-mono">-₹{discountAmount}</span>
                              </div>
                            )}
                            <div className="flex justify-between items-center text-zinc-400 border-t border-white/5 pt-2">
                              <label className="flex items-center gap-2 cursor-pointer font-body">
                                <input 
                                  type="checkbox" 
                                  checked={posAddGst}
                                  onChange={(e) => setPosAddGst(e.target.checked)}
                                  className="accent-viva-gold rounded cursor-pointer"
                                />
                                <span>Add GST (18%)</span>
                              </label>
                              <span className="font-mono">
                                ₹{gstAmount}
                              </span>
                            </div>
                            <div className="flex justify-between text-white font-bold text-sm border-t border-dashed border-[#D4AF37]/30 pt-3 font-body uppercase tracking-wider">
                              <span>Grand Total:</span>
                              <span className="text-[#D4AF37] font-mono text-lg font-extrabold">
                                ₹{grandTotal}
                              </span>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Checkout Action Button */}
                      <button
                        type="button"
                        onClick={handlePosCheckout}
                        disabled={posCheckoutLoading || !posStaff || posCart.length === 0}
                        className={`w-full py-3.5 rounded-lg font-body font-bold text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${
                          (!posStaff || posCart.length === 0) 
                            ? 'bg-zinc-800 text-zinc-650 border border-transparent cursor-not-allowed'
                            : 'bg-black hover:bg-zinc-950 border border-[#D4AF37] text-white hover:text-[#D4AF37] shadow-gold-glow hover:scale-[1.02] cursor-pointer'
                        }`}
                      >
                        {posCheckoutLoading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : 'Generate Bill & Invoice'}
                      </button>
                    </div>
                  </div>
                )}

                {/* BILLING ANALYTICS DASHBOARD */}
                {billingSubTab === 'analytics' && (
                  <div className="space-y-8">
                    {/* Revenue statistics cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="bg-zinc-900 border border-white/5 p-6 rounded-lg flex items-center justify-between shadow-lg">
                        <div>
                          <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block">Today's Revenue</span>
                          <p className="font-heading text-2xl font-bold text-[#D4AF37] mt-1">₹{billingStats.todayRevenue}</p>
                        </div>
                        <FiDollarSign className="text-3xl text-[#D4AF37]/25" />
                      </div>
                      <div className="bg-zinc-900 border border-white/5 p-6 rounded-lg flex items-center justify-between shadow-lg">
                        <div>
                          <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block">This Week Revenue</span>
                          <p className="font-heading text-2xl font-bold text-[#D4AF37] mt-1">₹{billingStats.thisWeekRevenue}</p>
                        </div>
                        <FiDollarSign className="text-3xl text-[#D4AF37]/25" />
                      </div>
                      <div className="bg-zinc-900 border border-white/5 p-6 rounded-lg flex items-center justify-between shadow-lg">
                        <div>
                          <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block">This Month Revenue</span>
                          <p className="font-heading text-2xl font-bold text-[#D4AF37] mt-1">₹{billingStats.thisMonthRevenue}</p>
                        </div>
                        <FiDollarSign className="text-3xl text-[#D4AF37]/25 animate-pulse" />
                      </div>
                      <div className="bg-zinc-900 border border-white/5 p-6 rounded-lg flex items-center justify-between shadow-lg">
                        <div>
                          <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block">Total POS Revenue</span>
                          <p className="font-heading text-2xl font-bold text-white mt-1">₹{billingStats.totalRevenue}</p>
                        </div>
                        <FiDollarSign className="text-3xl text-zinc-600" />
                      </div>
                      <div className="bg-zinc-900 border border-white/5 p-6 rounded-lg flex items-center justify-between shadow-lg">
                        <div>
                          <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block">Today's Bills Count</span>
                          <p className="font-heading text-2xl font-bold text-white mt-1">{billingStats.dailyBillsCount} Bills</p>
                        </div>
                        <FiLayers className="text-3xl text-zinc-600" />
                      </div>
                      <div className="bg-zinc-900 border border-white/5 p-6 rounded-lg flex items-center justify-between shadow-lg col-span-1 sm:col-span-1 lg:col-span-2">
                        <div>
                          <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block">Top Performing Stylist</span>
                          <p className="font-heading text-lg font-bold text-[#D4AF37] mt-1">{billingStats.topStaff.name} (₹{billingStats.topStaff.revenue})</p>
                        </div>
                        <FiAward className="text-3xl text-[#D4AF37]/20" />
                      </div>
                    </div>

                    {/* Staff Reports & Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                      {/* Stylists performance reports */}
                      <div className="lg:col-span-7 bg-zinc-900 border border-white/5 p-6 rounded-lg shadow-xl space-y-4">
                        <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-[#D4AF37] border-b border-white/5 pb-2">Stylist Performance Tracking</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="border-b border-white/5 text-zinc-400 font-bold uppercase tracking-wider">
                                <th className="py-2.5">Stylist</th>
                                <th className="py-2.5 text-center">Customers Served</th>
                                <th className="py-2.5 text-center">Services Completed</th>
                                <th className="py-2.5 text-right">Revenue Generated</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-zinc-350">
                              {Object.keys(billingStats.staffReport || {}).map(stylistName => {
                                const report = billingStats.staffReport[stylistName];
                                return (
                                  <tr key={stylistName} className="hover:bg-zinc-800/25">
                                    <td className="py-3 font-bold text-white">{stylistName}</td>
                                    <td className="py-3 text-center font-mono">{report.customersServed}</td>
                                    <td className="py-3 text-center font-mono">{report.servicesCompleted}</td>
                                    <td className="py-3 text-right font-bold text-[#D4AF37] font-mono">₹{report.revenueGenerated}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Top Services */}
                      <div className="lg:col-span-5 bg-zinc-900 border border-white/5 p-6 rounded-lg shadow-xl space-y-4">
                        <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-[#D4AF37] border-b border-white/5 pb-2">Most Booked Services</h4>
                        {(!billingStats.mostBookedServices || billingStats.mostBookedServices.length === 0) ? (
                          <p className="text-xs text-zinc-550 text-center py-6">No services logged yet.</p>
                        ) : (
                          <div className="space-y-3 font-mono text-xs">
                            {billingStats.mostBookedServices.map((srv, idx) => (
                              <div key={idx} className="flex justify-between items-center bg-zinc-950 p-3 rounded border border-white/5">
                                <span className="text-zinc-200 truncate max-w-[200px] font-body">{srv.name}</span>
                                <span className="text-[#D4AF37] font-bold">{srv.bookings} Sales</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Chart: Monthly Revenue */}
                    <div className="bg-zinc-900 border border-white/5 p-6 rounded-lg shadow-xl max-w-3xl">
                      <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-[#D4AF37] mb-6">Monthly Revenue Trend</h4>
                      {(!billingStats.monthlyRevenueChart || billingStats.monthlyRevenueChart.length === 0) ? (
                        <p className="text-xs text-zinc-550 text-center py-10">No revenue data logged yet.</p>
                      ) : (
                        <div className="flex flex-col items-center">
                          <svg className="w-full max-w-lg h-56" viewBox="0 0 400 220">
                            <line x1="40" y1="20" x2="380" y2="20" stroke="rgba(255,255,255,0.03)" />
                            <line x1="40" y1="95" x2="380" y2="95" stroke="rgba(255,255,255,0.03)" />
                            <line x1="40" y1="170" x2="380" y2="170" stroke="rgba(255,255,255,0.08)" />

                            {(() => {
                              const maxVal = Math.max(...billingStats.monthlyRevenueChart.map(m => m.revenue), 1000);
                              const width = 340;
                              const barGap = 15;
                              const totalBars = billingStats.monthlyRevenueChart.length;
                              const barWidth = Math.max(10, (width - (barGap * (totalBars - 1))) / totalBars);

                              return billingStats.monthlyRevenueChart.map((m, idx) => {
                                const x = 40 + idx * (barWidth + barGap);
                                const h = (m.revenue / maxVal) * 150;
                                const y = 170 - h;

                                return (
                                  <g key={m.month}>
                                    <rect 
                                      x={x} 
                                      y={y} 
                                      width={barWidth} 
                                      height={h} 
                                      fill="url(#posGoldGradient)"
                                      rx={2}
                                    />
                                    <text x={x + barWidth / 2} y={y - 6} textAnchor="middle" fill="#D4AF37" className="text-[8px] font-mono font-bold">
                                      ₹{m.revenue}
                                    </text>
                                    <text x={x + barWidth / 2} y={185} textAnchor="middle" fill="#8F9194" className="text-[8px] font-mono">
                                      {m.month.split('-')[1]}/{m.month.split('-')[0].substring(2)}
                                    </text>
                                  </g>
                                );
                              });
                            })()}

                            <defs>
                              <linearGradient id="posGoldGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#F5C65D" />
                                <stop offset="100%" stopColor="#AA7C11" />
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* DAILY BILLS HISTORICAL LOG */}
                {billingSubTab === 'history' && (
                  <div className="bg-zinc-900 border border-white/5 p-6 rounded-lg shadow-xl overflow-x-auto">
                    <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-[#D4AF37] border-b border-white/5 pb-2 mb-6">Historical Billed Transactions</h4>
                    
                    {billsHistory.length === 0 ? (
                      <p className="text-xs text-zinc-550 py-6 text-center">No billed invoices logged yet.</p>
                    ) : (
                      <table className="w-full text-left text-xs whitespace-nowrap">
                        <thead>
                          <tr className="border-b border-white/5 text-[#D4AF37] font-bold uppercase tracking-wider font-heading">
                            <th className="p-3">Bill ID</th>
                            <th className="p-3">Customer Details</th>
                            <th className="p-3">Stylist</th>
                            <th className="p-3 text-center">Services</th>
                            <th className="p-3 text-right">Total Amount</th>
                            <th className="p-3">Date & Time</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-zinc-300">
                          {billsHistory.map(bill => (
                            <tr key={bill._id} className="hover:bg-zinc-800/25">
                              <td className="p-3 font-mono font-bold text-white">{bill.billId}</td>
                              <td className="p-3">
                                <span className="block font-bold text-white">{bill.customerName || 'Guest'}</span>
                                <span className="block text-[10px] text-zinc-500">{bill.mobileNumber || 'N/A'}</span>
                              </td>
                              <td className="p-3 text-zinc-400">{bill.staffMember}</td>
                              <td className="p-3 text-center font-mono">{bill.totalServices} Services</td>
                              <td className="p-3 text-right font-bold text-white font-mono">₹{bill.grandTotal}</td>
                              <td className="p-3 text-zinc-400">{bill.date} &bull; {bill.time}</td>
                              <td className="p-3 text-right">
                                <button 
                                  onClick={() => setGeneratedInvoice(bill)}
                                  className="border border-[#D4AF37]/30 hover:border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all"
                                >
                                  View Receipt
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

                {/* MODAL: INVOICE RECEIPT PREVIEW */}
                {generatedInvoice && (
                  <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-zinc-900 border border-[#D4AF37] p-8 rounded-xl max-w-lg w-full space-y-6 shadow-2xl relative select-none animate-scale-up">
                      <button 
                        type="button"
                        onClick={() => setGeneratedInvoice(null)}
                        className="absolute right-4 top-4 text-zinc-500 hover:text-white"
                      >
                        <FiX className="text-xl" />
                      </button>

                      {/* Logo Receipt Header */}
                      <div className="text-center space-y-1.5 border-b border-[#D4AF37]/30 pb-4">
                        <div className="text-[#D4AF37] font-heading text-3xl font-black tracking-widest">VIVA</div>
                        <span className="text-[10px] text-zinc-550 uppercase tracking-widest font-semibold">Premium Luxury Unisex Salon</span>
                      </div>

                      {/* Receipt Meta Details */}
                      <div className="grid grid-cols-2 gap-4 text-xs text-zinc-400 font-mono">
                        <div>
                          <span className="block"><strong>Invoice ID:</strong> {generatedInvoice.billId}</span>
                          <span className="block mt-0.5"><strong>Date:</strong> {generatedInvoice.date}</span>
                          <span className="block mt-0.5"><strong>Time:</strong> {generatedInvoice.time}</span>
                        </div>
                        <div className="text-right">
                          <span className="block"><strong>Stylist:</strong> {generatedInvoice.staffMember}</span>
                          <span className="block mt-0.5"><strong>Client:</strong> {generatedInvoice.customerName || 'Guest'}</span>
                          <span className="block mt-0.5"><strong>Mobile:</strong> {generatedInvoice.mobileNumber || 'N/A'}</span>
                        </div>
                      </div>

                      {/* Invoice Services list */}
                      <div className="space-y-3 font-mono text-xs">
                        <div className="flex justify-between font-bold text-zinc-400 border-b border-white/10 pb-1">
                          <span>Service Description</span>
                          <span>Price</span>
                        </div>
                        <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                          {generatedInvoice.services.map((s, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span className="text-zinc-200 font-body">{s.name}</span>
                              <span className="text-white">₹{s.price}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Totals Receipt box */}
                      <div className="bg-zinc-950 p-4 rounded-lg border border-white/5 space-y-2.5 font-mono text-xs text-zinc-400">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>₹{generatedInvoice.subtotal}</span>
                        </div>
                        {generatedInvoice.discount > 0 && (
                          <div className="flex justify-between text-[#D4AF37] font-semibold">
                            <span>Membership Discount ({generatedInvoice.membershipType}):</span>
                            <span>-₹{generatedInvoice.discount}</span>
                          </div>
                        )}
                        {generatedInvoice.gst > 0 && (
                          <div className="flex justify-between">
                            <span>GST (18%):</span>
                            <span>₹{generatedInvoice.gst}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-white font-bold text-sm border-t border-dashed border-[#D4AF37]/30 pt-2.5 font-body">
                          <span>Grand Total:</span>
                          <span className="text-[#D4AF37] font-mono text-base font-extrabold">₹{generatedInvoice.grandTotal}</span>
                        </div>
                      </div>

                      {/* Receipt Action Buttons */}
                      <div className="flex gap-3 pt-2">
                        <button
                          type="button"
                          onClick={handlePrintInvoice}
                          className="flex-1 py-3 bg-[#D4AF37] text-zinc-950 hover:bg-[#D4AF37]/90 font-body font-bold text-xs uppercase tracking-widest rounded transition-colors"
                        >
                          Print Invoice
                        </button>
                        <button
                          type="button"
                          onClick={handleDownloadInvoicePDF}
                          className="flex-1 py-3 bg-zinc-950 hover:bg-zinc-900 border border-white/10 hover:border-[#D4AF37] text-white hover:text-[#D4AF37] font-body font-bold text-xs uppercase tracking-widest rounded transition-colors"
                        >
                          Download HTML
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SUB-VIEW 1: OVERVIEW DASHBOARD */}
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-fade-in">
                {/* Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-viva-charcoal p-6 rounded-lg border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-viva-gray uppercase tracking-widest">Total Appointments</span>
                      <p className="font-heading text-2xl font-bold text-viva-white mt-1">{stats.totalAppointments}</p>
                    </div>
                    <FiCalendar className="text-3xl text-viva-gold/30" />
                  </div>
                  <div className="bg-viva-charcoal p-6 rounded-lg border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-viva-gray uppercase tracking-widest">Today's Appointments</span>
                      <p className="font-heading text-2xl font-bold text-viva-gold mt-1">{stats.todayAppointments}</p>
                    </div>
                    <FiActivity className="text-3xl text-viva-gold/30" />
                  </div>
                  <div className="bg-viva-charcoal p-6 rounded-lg border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-viva-gray uppercase tracking-widest">Upcoming Appointments</span>
                      <p className="font-heading text-2xl font-bold text-viva-white mt-1">{stats.upcomingAppointments}</p>
                    </div>
                    <FiClock className="text-3xl text-viva-gold/30" />
                  </div>
                  <div className="bg-viva-charcoal p-6 rounded-lg border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-viva-gray uppercase tracking-widest">Total Customers</span>
                      <p className="font-heading text-2xl font-bold text-viva-white mt-1">{stats.totalCustomers}</p>
                    </div>
                    <FiUsers className="text-3xl text-viva-gold/30" />
                  </div>
                  <div className="bg-viva-charcoal p-6 rounded-lg border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-viva-gray uppercase tracking-widest">Active Memberships</span>
                      <p className="font-heading text-2xl font-bold text-viva-white mt-1">{stats.activeMemberships}</p>
                    </div>
                    <FiAward className="text-3xl text-viva-gold/30" />
                  </div>
                  <div className="bg-viva-charcoal p-6 rounded-lg border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-viva-gray uppercase tracking-widest">Daily Revenue</span>
                      <p className="font-heading text-2xl font-bold text-viva-gold mt-1">₹{stats.todayRevenue}</p>
                    </div>
                    <FiDollarSign className="text-3xl text-viva-gold/30" />
                  </div>
                  <div className="bg-viva-charcoal p-6 rounded-lg border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-viva-gray uppercase tracking-widest">Monthly Revenue</span>
                      <p className="font-heading text-2xl font-bold text-viva-gold mt-1">₹{stats.monthlyRevenue}</p>
                    </div>
                    <FiDollarSign className="text-3xl text-viva-gold/30 animate-pulse" />
                  </div>
                  <div className="bg-viva-charcoal p-6 rounded-lg border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-viva-gray uppercase tracking-widest">Yearly Revenue</span>
                      <p className="font-heading text-2xl font-bold text-viva-gold mt-1">₹{stats.yearlyRevenue}</p>
                    </div>
                    <FiTrendingUp className="text-3xl text-viva-gold/30" />
                  </div>
                </div>



                {/* Team Workloads chart panel */}
                <div className="bg-viva-charcoal border border-white/5 p-6 rounded-lg max-w-3xl">
                  <h3 className="font-heading text-base font-bold text-viva-gold uppercase tracking-wider mb-6">Staff Workload Distribution</h3>
                  {stats.stylistsChart.length === 0 ? (
                    <p className="text-xs text-viva-gray">No workload stats recorded.</p>
                  ) : (
                    <div className="space-y-4">
                      {stats.stylistsChart.map((st, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-viva-white font-medium">{st.name}</span>
                            <span className="text-viva-gold font-bold">{st.value} Bookings</span>
                          </div>
                          <div className="h-2 w-full bg-viva-black rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gold-gradient rounded-full" 
                              style={{ width: `${Math.min(100, (st.value / (stats.totalAppointments || 1)) * 100)}%` }} 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SUB-VIEW 2: REVENUE ANALYTICS */}
            {activeTab === 'revenue' && (
              <div className="space-y-8 animate-fade-in">
                {/* Revenue Highlights cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-viva-charcoal p-6 rounded-lg border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-viva-gray uppercase tracking-widest">Total Earnings</span>
                      <p className="font-heading text-xl font-bold text-viva-gold mt-1">₹{stats.totalRevenue}</p>
                    </div>
                    <FiDollarSign className="text-2xl text-viva-gold/30" />
                  </div>
                  <div className="bg-viva-charcoal p-6 rounded-lg border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-viva-gray uppercase tracking-widest">Today's Revenue</span>
                      <p className="font-heading text-xl font-bold text-viva-gold mt-1">₹{stats.todayRevenue}</p>
                    </div>
                    <FiDollarSign className="text-2xl text-viva-gold/30" />
                  </div>
                  <div className="bg-viva-charcoal p-6 rounded-lg border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-viva-gray uppercase tracking-widest">This Month</span>
                      <p className="font-heading text-xl font-bold text-viva-gold mt-1">₹{stats.thisMonthRevenue}</p>
                    </div>
                    <FiDollarSign className="text-2xl text-viva-gold/30 animate-pulse" />
                  </div>
                  <div className="bg-viva-charcoal p-6 rounded-lg border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-viva-gray uppercase tracking-widest">Last Month</span>
                      <p className="font-heading text-xl font-bold text-viva-white mt-1">₹{stats.lastMonthRevenue}</p>
                    </div>
                    <FiDollarSign className="text-2xl text-viva-gold/30" />
                  </div>
                </div>

                {/* Growth/Comparison Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Card 1: Appointments growth */}
                  <div className="bg-viva-charcoal border border-white/5 p-6 rounded-lg flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-viva-gray block mb-1">Monthly Appointments Comparison</span>
                      <h4 className="font-heading text-sm font-bold text-white uppercase tracking-wider">Bookings Volume</h4>
                    </div>
                    <div className="mt-4 flex items-baseline justify-between">
                      <div>
                        <p className="text-xs text-viva-gray">This Month: <span className="text-white font-bold font-mono">{stats.comparison.appointments.thisMonth}</span></p>
                        <p className="text-xs text-viva-gray mt-0.5">Last Month: <span className="text-zinc-500 font-mono">{stats.comparison.appointments.lastMonth}</span></p>
                      </div>
                      <span className={`text-xs font-bold font-mono px-2 py-1 rounded border flex items-center gap-1 ${
                        stats.comparison.appointments.growth 
                          ? 'bg-green-950/20 text-green-400 border-green-900/40' 
                          : 'bg-red-950/20 text-red-400 border-red-900/40'
                      }`}>
                        {stats.comparison.appointments.growth ? '↑' : '↓'} {Math.abs(stats.comparison.appointments.percentChange)}%
                      </span>
                    </div>
                  </div>

                  {/* Card 2: Revenue growth */}
                  <div className="bg-viva-charcoal border border-white/5 p-6 rounded-lg flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-viva-gray block mb-1">Monthly Financial Comparison</span>
                      <h4 className="font-heading text-sm font-bold text-white uppercase tracking-wider">Revenue Growth</h4>
                    </div>
                    <div className="mt-4 flex items-baseline justify-between">
                      <div>
                        <p className="text-xs text-viva-gray">This Month: <span className="text-viva-gold font-bold font-mono">₹{stats.comparison.revenue.thisMonth}</span></p>
                        <p className="text-xs text-viva-gray mt-0.5">Last Month: <span className="text-zinc-500 font-mono">₹{stats.comparison.revenue.lastMonth}</span></p>
                      </div>
                      <span className={`text-xs font-bold font-mono px-2 py-1 rounded border flex items-center gap-1 ${
                        stats.comparison.revenue.growth 
                          ? 'bg-green-950/20 text-green-400 border-green-900/40' 
                          : 'bg-red-950/20 text-red-400 border-red-900/40'
                      }`}>
                        {stats.comparison.revenue.growth ? '↑' : '↓'} {Math.abs(stats.comparison.revenue.percentChange)}%
                      </span>
                    </div>
                  </div>

                  {/* Card 3: Customers segments */}
                  <div className="bg-viva-charcoal border border-white/5 p-6 rounded-lg flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-viva-gray block mb-1">Customer Demographics</span>
                      <h4 className="font-heading text-sm font-bold text-white uppercase tracking-wider">Customer Loyalty</h4>
                    </div>
                    <div className="mt-4 flex justify-between">
                      <div>
                        <p className="text-xs text-viva-gray">New Customers: <span className="text-viva-gold font-bold font-mono">{stats.comparison.customers.newCustomers}</span></p>
                        <p className="text-xs text-zinc-550 mt-0.5">Returning: <span className="text-white font-bold font-mono">{stats.comparison.customers.returningCustomers}</span></p>
                      </div>
                      <div className="h-10 w-10 border border-viva-gold/25 rounded-full flex items-center justify-center text-[10px] text-viva-gold font-bold font-heading">
                        VIP
                      </div>
                    </div>
                  </div>
                </div>

                {/* SVG Visualizer Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Chart 1: Monthly sales */}
                  <div className="bg-viva-charcoal border border-white/5 p-6 rounded-lg">
                    <h3 className="font-heading text-xs uppercase tracking-widest text-viva-gold mb-6">Monthly Revenue Bar Chart</h3>
                    {stats.monthlyRevenueChart.length === 0 ? (
                      <p className="text-xs text-viva-gray text-center py-10">No monthly data parsed yet.</p>
                    ) : (
                      <div className="flex flex-col items-center">
                        <svg className="w-full max-w-lg h-56" viewBox="0 0 400 220">
                          {/* Grid lines */}
                          <line x1="40" y1="20" x2="380" y2="20" stroke="rgba(255,255,255,0.03)" />
                          <line x1="40" y1="95" x2="380" y2="95" stroke="rgba(255,255,255,0.03)" />
                          <line x1="40" y1="170" x2="380" y2="170" stroke="rgba(255,255,255,0.08)" />
                          
                          {(() => {
                            const maxVal = Math.max(...stats.monthlyRevenueChart.map(m => m.revenue), 1000);
                            const width = 340;
                            const barGap = 15;
                            const totalBars = stats.monthlyRevenueChart.length;
                            const barWidth = Math.max(10, (width - (barGap * (totalBars - 1))) / totalBars);

                            return stats.monthlyRevenueChart.map((m, idx) => {
                              const x = 40 + idx * (barWidth + barGap);
                              const h = (m.revenue / maxVal) * 150;
                              const y = 170 - h;

                              return (
                                <g key={m.month}>
                                  {/* Bar */}
                                  <rect 
                                    x={x} 
                                    y={y} 
                                    width={barWidth} 
                                    height={h} 
                                    fill="url(#goldGradient)"
                                    rx={2}
                                    className="transition-all hover:opacity-85 cursor-pointer"
                                  />
                                  {/* Tooltip text */}
                                  <text x={x + barWidth / 2} y={y - 6} textAnchor="middle" fill="#D4AF37" className="text-[8px] font-mono font-bold">
                                    ₹{m.revenue}
                                  </text>
                                  {/* Label */}
                                  <text x={x + barWidth / 2} y={185} textAnchor="middle" fill="#8F9194" className="text-[8px] font-mono">
                                    {m.month.split('-')[1]}/{m.month.split('-')[0].substring(2)}
                                  </text>
                                </g>
                              );
                            });
                          })()}

                          {/* Gradient definition */}
                          <defs>
                            <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#F5C65D" />
                              <stop offset="100%" stopColor="#AA7C11" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Chart 2: Daily trend */}
                  <div className="bg-viva-charcoal border border-white/5 p-6 rounded-lg">
                    <h3 className="font-heading text-xs uppercase tracking-widest text-viva-gold mb-6">30-Day Revenue Trend Graph</h3>
                    {stats.revenueTrendGraph.length === 0 ? (
                      <p className="text-xs text-viva-gray text-center py-10">No trend data recorded.</p>
                    ) : (
                      <div className="flex flex-col items-center">
                        <svg className="w-full max-w-lg h-56" viewBox="0 0 400 220">
                          <line x1="30" y1="20" x2="380" y2="20" stroke="rgba(255,255,255,0.03)" />
                          <line x1="30" y1="95" x2="380" y2="95" stroke="rgba(255,255,255,0.03)" />
                          <line x1="30" y1="170" x2="380" y2="170" stroke="rgba(255,255,255,0.08)" />

                          {(() => {
                            const maxVal = Math.max(...stats.revenueTrendGraph.map(d => d.revenue), 100);
                            const totalPoints = stats.revenueTrendGraph.length;
                            const spacing = 350 / (totalPoints - 1);
                            
                            // Map coordinates
                            const points = stats.revenueTrendGraph.map((d, i) => {
                              const x = 30 + i * spacing;
                              const y = 170 - (d.revenue / maxVal) * 150;
                              return { x, y, val: d.revenue, date: d.date };
                            });

                            const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');
                            
                            // Bottom bounding coordinates for filled gradient shape
                            const areaPoints = `${points[0].x},170 ${polylinePoints} ${points[points.length - 1].x},170`;

                            return (
                              <g>
                                {/* Filled Area */}
                                <polygon points={areaPoints} fill="url(#areaGoldGrad)" opacity={0.15} />

                                {/* Trend line */}
                                <polyline 
                                  fill="none" 
                                  stroke="#D4AF37" 
                                  strokeWidth={1.8} 
                                  points={polylinePoints} 
                                />

                                {/* Hotspots */}
                                {points.filter((_, idx) => idx % 5 === 0 || idx === totalPoints - 1).map((p, idx) => (
                                  <g key={idx}>
                                    <circle cx={p.x} cy={p.y} r={3} fill="#080809" stroke="#D4AF37" strokeWidth={1} />
                                    <text x={p.x} y={p.y - 6} textAnchor="middle" fill="#F5C65D" className="text-[7px] font-mono">
                                      ₹{p.val}
                                    </text>
                                    <text x={p.x} y={185} textAnchor="middle" fill="#8F9194" className="text-[6.5px] font-mono">
                                      {p.date.split('-')[2]}
                                    </text>
                                  </g>
                                ))}
                              </g>
                            );
                          })()}

                          <defs>
                            <linearGradient id="areaGoldGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#D4A437" stopOpacity="0.8" />
                              <stop offset="100%" stopColor="#D4A437" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                {/* Category Revenue Distribution chart */}
                <div className="bg-viva-charcoal border border-white/5 p-6 rounded-lg max-w-3xl">
                  <h3 className="font-heading text-xs uppercase tracking-widest text-viva-gold mb-6">Revenue Share by Service Category</h3>
                  {stats.revenueByCategory.length === 0 ? (
                    <p className="text-xs text-viva-gray">No categorised revenue stats computed.</p>
                  ) : (
                    <div className="space-y-4">
                      {stats.revenueByCategory.map((srv, idx) => {
                        const total = stats.totalRevenue || 1;
                        const percentage = ((srv.value / total) * 100).toFixed(1);
                        return (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-viva-white font-medium">{srv.name.replace(' Services', '')}</span>
                              <span className="text-viva-gold font-bold">₹{srv.value} ({percentage}%)</span>
                            </div>
                            <div className="h-2.5 w-full bg-viva-black rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gold-gradient rounded-full" 
                                style={{ width: `${percentage}%` }} 
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SUB-VIEW 3: APPOINTMENTS & ORDERS */}
            {activeTab === 'bookings' && (
              <div className="bg-viva-charcoal border border-white/5 p-6 rounded-lg overflow-x-auto animate-fade-in">
                <h3 className="font-heading text-xl font-bold uppercase tracking-wider text-viva-gold mb-6">Bookings Calendar & Orders</h3>
                
                {bookings.length === 0 ? (
                  <p className="text-xs text-viva-gray py-4 text-center">No customer bookings logged yet.</p>
                ) : (
                  <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
                    <thead>
                      <tr className="bg-viva-black border-b border-white/5 text-viva-gold font-heading tracking-widest uppercase">
                        <th className="p-3">Client Details</th>
                        <th className="p-3">Grooming Ritual</th>
                        <th className="p-3">Assigned Staff</th>
                        <th className="p-3">Scheduled Date/Time</th>
                        <th className="p-3">Total Amount</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {bookings.map(app => (
                        <tr key={app._id} className="hover:bg-viva-black/25">
                          <td className="p-3">
                            <span className="block text-viva-white font-bold">{app.customerName}</span>
                            <span className="block text-[10px] text-viva-gray">{app.email}</span>
                            <span className="block text-[10px] text-viva-gray">{app.phone}</span>
                          </td>
                          <td className="p-3">
                            <div className="flex flex-col gap-0.5 max-w-xs truncate">
                              {(app.selectedServices || []).map((s, i) => (
                                <span key={i} className="text-[10px] text-viva-white font-semibold">&bull; {s.serviceName}</span>
                              ))}
                            </div>
                          </td>
                          <td className="p-3 text-viva-gold font-semibold uppercase tracking-wider">
                            {app.preferredStaffMember || 'Unassigned'}
                          </td>
                          <td className="p-3">
                            <span className="block text-viva-white font-bold">{app.appointmentDate}</span>
                            <span className="block text-[10px] text-viva-gold font-mono">{app.appointmentTime}</span>
                          </td>
                          <td className="p-3 text-viva-gold font-bold text-sm">₹{app.totalAmount}</td>
                          <td className="p-3">
                            <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border ${
                              app.status === 'Confirmed' 
                                ? 'bg-green-950/30 text-green-300 border-green-900/40' 
                                : app.status === 'Cancelled' 
                                  ? 'bg-red-950/30 text-red-300 border-red-900/40' 
                                  : app.status === 'Completed'
                                    ? 'bg-blue-950/30 text-blue-300 border-blue-900/40'
                                    : 'bg-yellow-950/30 text-yellow-300 border-yellow-900/40'
                            }`}>
                              {app.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex justify-end gap-1.5">
                              {app.status === 'Pending' && (
                                <>
                                  <button 
                                    onClick={() => handleUpdateStatus(app._id, 'Confirmed')}
                                    className="w-7 h-7 bg-green-900/20 hover:bg-green-900/50 border border-green-800 text-green-300 rounded flex items-center justify-center transition-colors"
                                    title="Approve"
                                  >
                                    <FiCheck />
                                  </button>
                                  <button 
                                    onClick={() => handleUpdateStatus(app._id, 'Cancelled')}
                                    className="w-7 h-7 bg-red-900/20 hover:bg-red-950/50 border border-red-800 text-red-300 rounded flex items-center justify-center transition-colors"
                                    title="Reject"
                                  >
                                    <FiX />
                                  </button>
                                </>
                              )}
                              
                              {app.status === 'Confirmed' && (
                                <button 
                                  onClick={() => handleUpdateStatus(app._id, 'Completed')}
                                  className="bg-blue-900/30 hover:bg-blue-900/60 border border-blue-800 text-blue-300 px-3 py-1 rounded text-[10px] uppercase font-bold tracking-wider transition-colors"
                                >
                                  Mark Completed
                                </button>
                              )}

                              {app.status !== 'Completed' && app.status !== 'Cancelled' && (
                                <button 
                                  onClick={() => {
                                    setReschedulingApp(app);
                                    setRescheduleDate(app.appointmentDate);
                                    setShowRescheduleModal(true);
                                  }}
                                  className="bg-zinc-800 hover:bg-zinc-700 border border-white/5 text-viva-gold px-2.5 py-1 rounded text-[10px] uppercase font-bold tracking-wider transition-colors"
                                >
                                  Reschedule
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* SUB-VIEW 4: CATALOG SERVICES */}
            {activeTab === 'services' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center bg-viva-charcoal border border-white/5 p-4 rounded-lg">
                  <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-viva-gold">Catalog Services</h3>
                  <button 
                    onClick={() => setShowServiceForm(true)}
                    className="flex items-center gap-1.5 bg-viva-gold text-viva-black font-body font-bold text-xs uppercase tracking-widest px-4 py-2 rounded shadow-gold-glow hover:scale-105 transition-transform"
                  >
                    <FiPlus /> Add Service
                  </button>
                </div>

                {/* Add Service Modal */}
                {showServiceForm && (
                  <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
                    <form onSubmit={handleAddService} className="bg-viva-charcoal border border-viva-gold/30 p-6 rounded-lg space-y-4 max-w-2xl w-full">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <h4 className="font-heading text-base font-bold text-viva-gold uppercase tracking-wider">New Salon Treatment</h4>
                        <button type="button" onClick={() => setShowServiceForm(false)} className="text-zinc-500 hover:text-white"><FiX /></button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex flex-col">
                          <label className="text-[9px] uppercase tracking-widest text-viva-gray mb-1.5">Service Name</label>
                          <input 
                            type="text" 
                            value={newService.name} 
                            onChange={(e) => setNewService({ ...newService, name: e.target.value })} 
                            className="viva-input" 
                            required 
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-[9px] uppercase tracking-widest text-viva-gray mb-1.5">Category</label>
                          <select 
                            value={newService.category} 
                            onChange={(e) => {
                              const cat = e.target.value;
                              const sub = subcategoriesByCategory[cat][0];
                              setNewService({ ...newService, category: cat, subcategory: sub });
                            }} 
                            className="viva-input cursor-pointer"
                          >
                            <option value="Women's Services">Women's Services</option>
                            <option value="Men's Services">Men's Services</option>
                          </select>
                        </div>
                        <div className="flex flex-col">
                          <label className="text-[9px] uppercase tracking-widest text-viva-gray mb-1.5">Subcategory</label>
                          <select 
                            value={newService.subcategory || ''} 
                            onChange={(e) => setNewService({ ...newService, subcategory: e.target.value })} 
                            className="viva-input cursor-pointer"
                          >
                            {(subcategoriesByCategory[newService.category] || []).map(sub => (
                              <option key={sub} value={sub}>{sub}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex flex-col">
                          <label className="text-[9px] uppercase tracking-widest text-viva-gray mb-1.5">Price (₹)</label>
                          <input 
                            type="number" 
                            value={newService.price} 
                            onChange={(e) => setNewService({ ...newService, price: e.target.value })} 
                            className="viva-input" 
                            required 
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-[9px] uppercase tracking-widest text-viva-gray mb-1.5">Duration (Mins)</label>
                          <input 
                            type="number" 
                            value={newService.duration} 
                            onChange={(e) => setNewService({ ...newService, duration: e.target.value })} 
                            className="viva-input" 
                            required 
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-[9px] uppercase tracking-widest text-viva-gray mb-1.5">Popular Tag</label>
                          <div className="flex items-center mt-3 gap-2">
                            <input 
                              type="checkbox" 
                              checked={newService.isPopular} 
                              onChange={(e) => setNewService({ ...newService, isPopular: e.target.checked })} 
                              className="w-4 h-4 accent-viva-gold rounded cursor-pointer" 
                            />
                            <span className="text-xs text-viva-gray">Enable popular star</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <label className="text-[9px] uppercase tracking-widest text-viva-gray mb-1.5">Treatment Image URL</label>
                        <input 
                          type="url" 
                          value={newService.imageUrl} 
                          onChange={(e) => setNewService({ ...newService, imageUrl: e.target.value })} 
                          className="viva-input" 
                          placeholder="https://images.unsplash.com/..."
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-[9px] uppercase tracking-widest text-viva-gray mb-1.5">Description</label>
                        <textarea 
                          value={newService.description} 
                          onChange={(e) => setNewService({ ...newService, description: e.target.value })} 
                          rows={3} 
                          className="viva-input" 
                          required 
                        />
                      </div>
                      <div className="flex justify-end gap-3 pt-2">
                        <button 
                          type="button" 
                          onClick={() => setShowServiceForm(false)} 
                          className="text-xs text-viva-gray border border-white/5 px-4 py-2 rounded"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="bg-viva-gold text-viva-black font-body font-bold text-xs uppercase tracking-widest px-5 py-2 rounded shadow-gold-glow"
                        >
                          Create Service
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Edit Service Modal */}
                {showEditServiceForm && (
                  <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
                    <form onSubmit={handleEditService} className="bg-viva-charcoal border border-viva-gold/30 p-6 rounded-lg space-y-4 max-w-2xl w-full">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <h4 className="font-heading text-base font-bold text-viva-gold uppercase tracking-wider">Edit Salon Treatment</h4>
                        <button type="button" onClick={() => setShowEditServiceForm(false)} className="text-zinc-500 hover:text-white"><FiX /></button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex flex-col">
                          <label className="text-[9px] uppercase tracking-widest text-viva-gray mb-1.5">Service Name</label>
                          <input 
                            type="text" 
                            value={editingService.name} 
                            onChange={(e) => setEditingService({ ...editingService, name: e.target.value })} 
                            className="viva-input" 
                            required 
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-[9px] uppercase tracking-widest text-viva-gray mb-1.5">Category</label>
                          <select 
                            value={editingService.category} 
                            onChange={(e) => {
                              const cat = e.target.value;
                              const sub = subcategoriesByCategory[cat][0];
                              setEditingService({ ...editingService, category: cat, subcategory: sub });
                            }} 
                            className="viva-input cursor-pointer"
                          >
                            <option value="Women's Services">Women's Services</option>
                            <option value="Men's Services">Men's Services</option>
                          </select>
                        </div>
                        <div className="flex flex-col">
                          <label className="text-[9px] uppercase tracking-widest text-viva-gray mb-1.5">Subcategory</label>
                          <select 
                            value={editingService.subcategory || ''} 
                            onChange={(e) => setEditingService({ ...editingService, subcategory: e.target.value })} 
                            className="viva-input cursor-pointer"
                          >
                            {(subcategoriesByCategory[editingService.category] || []).map(sub => (
                              <option key={sub} value={sub}>{sub}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex flex-col">
                          <label className="text-[9px] uppercase tracking-widest text-viva-gray mb-1.5">Price (₹)</label>
                          <input 
                            type="number" 
                            value={editingService.price} 
                            onChange={(e) => setEditingService({ ...editingService, price: Number(e.target.value) })} 
                            className="viva-input" 
                            required 
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-[9px] uppercase tracking-widest text-viva-gray mb-1.5">Duration (Mins)</label>
                          <input 
                            type="number" 
                            value={editingService.duration} 
                            onChange={(e) => setEditingService({ ...editingService, duration: Number(e.target.value) })} 
                            className="viva-input" 
                            required 
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-[9px] uppercase tracking-widest text-viva-gray mb-1.5">Popular Tag</label>
                          <div className="flex items-center mt-3 gap-2">
                            <input 
                              type="checkbox" 
                              checked={editingService.isPopular} 
                              onChange={(e) => setEditingService({ ...editingService, isPopular: e.target.checked })} 
                              className="w-4 h-4 accent-viva-gold rounded cursor-pointer" 
                            />
                            <span className="text-xs text-viva-gray">Enable popular star</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <label className="text-[9px] uppercase tracking-widest text-viva-gray mb-1.5">Treatment Image URL</label>
                        <input 
                          type="url" 
                          value={editingService.imageUrl} 
                          onChange={(e) => setEditingService({ ...editingService, imageUrl: e.target.value })} 
                          className="viva-input" 
                          required
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-[9px] uppercase tracking-widest text-viva-gray mb-1.5">Description</label>
                        <textarea 
                          value={editingService.description} 
                          onChange={(e) => setEditingService({ ...editingService, description: e.target.value })} 
                          rows={3} 
                          className="viva-input" 
                          required 
                        />
                      </div>
                      <div className="flex justify-end gap-3 pt-2">
                        <button 
                          type="button" 
                          onClick={() => setShowEditServiceForm(false)} 
                          className="text-xs text-viva-gray border border-white/5 px-4 py-2 rounded"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="bg-viva-gold text-viva-black font-body font-bold text-xs uppercase tracking-widest px-5 py-2 rounded shadow-gold-glow"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Services list */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map(srv => (
                    <div key={srv._id} className="bg-viva-charcoal border border-white/5 p-4 rounded-lg flex items-center justify-between gap-4">
                      <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0 border border-white/5">
                        <img src={srv.imageUrl} alt={srv.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <h4 className="font-heading font-bold text-sm text-viva-white uppercase truncate">{srv.name}</h4>
                        <span className="text-[9px] text-viva-gold uppercase tracking-widest block mt-0.5">{srv.category.replace(' Services', '')} &bull; {srv.subcategory}</span>
                        <span className="text-[10px] text-viva-gray block font-mono mt-1">₹{srv.price} &bull; {srv.duration} Mins</span>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setEditingService(srv);
                            setShowEditServiceForm(true);
                          }}
                          className="p-2 border border-viva-gold/30 text-viva-gold hover:bg-viva-gold/10 rounded transition-colors"
                          title="Edit Service"
                        >
                          <FiEdit />
                        </button>
                        <button 
                          onClick={() => handleDeleteService(srv._id)}
                          className="p-2 border border-red-900/30 text-red-400 hover:bg-red-950/20 rounded transition-colors"
                          title="Delete Service"
                        >
                          <FiTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUB-VIEW 5: STAFF MANAGEMENT */}
            {activeTab === 'staff' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center bg-viva-charcoal border border-white/5 p-4 rounded-lg">
                  <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-viva-gold">Styling Team & Staff</h3>
                  <button 
                    onClick={() => setShowStaffForm(true)}
                    className="flex items-center gap-1.5 bg-viva-gold text-viva-black font-body font-bold text-xs uppercase tracking-widest px-4 py-2 rounded shadow-gold-glow hover:scale-105 transition-transform"
                  >
                    <FiUserPlus /> Add Staff
                  </button>
                </div>

                {/* Add Staff Modal */}
                {showStaffForm && (
                  <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
                    <form onSubmit={handleAddStaff} className="bg-viva-charcoal border border-viva-gold/30 p-6 rounded-lg space-y-4 max-w-xl w-full">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <h4 className="font-heading text-base font-bold text-viva-gold uppercase tracking-wider">New Staff Member</h4>
                        <button type="button" onClick={() => setShowStaffForm(false)} className="text-zinc-500 hover:text-white"><FiX /></button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col">
                          <label className="text-[9px] uppercase tracking-widest text-viva-gray mb-1.5">Staff Name</label>
                          <input 
                            type="text" 
                            value={newStaff.name} 
                            onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })} 
                            className="viva-input" 
                            required 
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-[9px] uppercase tracking-widest text-viva-gray mb-1.5">Specialization</label>
                          <input 
                            type="text" 
                            value={newStaff.specialty} 
                            onChange={(e) => setNewStaff({ ...newStaff, specialty: e.target.value })} 
                            className="viva-input" 
                            placeholder="e.g. Master Barber, Skin Care"
                            required 
                          />
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <label className="text-[9px] uppercase tracking-widest text-viva-gray mb-1.5">Profile Image URL</label>
                        <input 
                          type="url" 
                          value={newStaff.imageUrl} 
                          onChange={(e) => setNewStaff({ ...newStaff, imageUrl: e.target.value })} 
                          className="viva-input" 
                          placeholder="Unsplash image URL"
                          required 
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-[9px] uppercase tracking-widest text-viva-gray mb-1.5">Skills (Comma separated)</label>
                        <input 
                          type="text" 
                          value={newStaff.skills} 
                          onChange={(e) => setNewStaff({ ...newStaff, skills: e.target.value })} 
                          className="viva-input" 
                          placeholder="e.g. Haircut, Color, Pedicure"
                          required 
                        />
                      </div>
                      <div className="flex justify-end gap-3 pt-2">
                        <button 
                          type="button" 
                          onClick={() => setShowStaffForm(false)} 
                          className="text-xs text-viva-gray border border-white/5 px-4 py-2 rounded"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="bg-viva-gold text-viva-black font-body font-bold text-xs uppercase tracking-widest px-5 py-2 rounded shadow-gold-glow"
                        >
                          Create Member
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Edit Staff Modal */}
                {showEditStaffForm && (
                  <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
                    <form onSubmit={handleEditStaff} className="bg-viva-charcoal border border-viva-gold/30 p-6 rounded-lg space-y-4 max-w-xl w-full">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <h4 className="font-heading text-base font-bold text-viva-gold uppercase tracking-wider">Edit Staff Member</h4>
                        <button type="button" onClick={() => setShowEditStaffForm(false)} className="text-zinc-500 hover:text-white"><FiX /></button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col">
                          <label className="text-[9px] uppercase tracking-widest text-viva-gray mb-1.5">Staff Name</label>
                          <input 
                            type="text" 
                            value={editingStaff.name} 
                            onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })} 
                            className="viva-input" 
                            required 
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-[9px] uppercase tracking-widest text-viva-gray mb-1.5">Specialization</label>
                          <input 
                            type="text" 
                            value={editingStaff.specialty} 
                            onChange={(e) => setEditingStaff({ ...editingStaff, specialty: e.target.value })} 
                            className="viva-input" 
                            required 
                          />
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <label className="text-[9px] uppercase tracking-widest text-viva-gray mb-1.5">Profile Image URL</label>
                        <input 
                          type="url" 
                          value={editingStaff.imageUrl} 
                          onChange={(e) => setEditingStaff({ ...editingStaff, imageUrl: e.target.value })} 
                          className="viva-input" 
                          required 
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-[9px] uppercase tracking-widest text-viva-gray mb-1.5">Skills (Comma separated)</label>
                        <input 
                          type="text" 
                          value={Array.isArray(editingStaff.skills) ? editingStaff.skills.join(', ') : editingStaff.skills} 
                          onChange={(e) => setEditingStaff({ ...editingStaff, skills: e.target.value })} 
                          className="viva-input" 
                          required 
                        />
                      </div>
                      <div className="flex justify-end gap-3 pt-2">
                        <button 
                          type="button" 
                          onClick={() => setShowEditStaffForm(false)} 
                          className="text-xs text-viva-gray border border-white/5 px-4 py-2 rounded"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="bg-viva-gold text-viva-black font-body font-bold text-xs uppercase tracking-widest px-5 py-2 rounded shadow-gold-glow"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Staff members table list */}
                <div className="bg-viva-charcoal border border-white/5 p-6 rounded-lg overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
                    <thead>
                      <tr className="bg-viva-black border-b border-white/5 text-viva-gold font-heading tracking-widest uppercase">
                        <th className="p-3">Profile</th>
                        <th className="p-3">Staff Name</th>
                        <th className="p-3">Specialization</th>
                        <th className="p-3">Workload (Assigned)</th>
                        <th className="p-3">Revenue Generated</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {staff.map(st => (
                        <tr key={st._id} className="hover:bg-viva-black/25">
                          <td className="p-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10">
                              <img src={st.imageUrl} alt={st.name} className="w-full h-full object-cover" />
                            </div>
                          </td>
                          <td className="p-3 text-white font-bold">{st.name}</td>
                          <td className="p-3 text-zinc-400">{st.specialty}</td>
                          <td className="p-3 text-white font-semibold font-mono">{st.assignedAppointments || 0} Bookings</td>
                          <td className="p-3 text-viva-gold font-bold font-mono">₹{st.revenueGenerated || 0}</td>
                          <td className="p-3">
                            <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border ${
                              st.status !== 'Inactive' 
                                ? 'bg-green-950/30 text-green-300 border-green-900/40' 
                                : 'bg-zinc-900/40 text-zinc-550 border-white/5'
                            }`}>
                              {st.status || 'Active'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => handleToggleStaffStatus(st)}
                                className={`w-7 h-7 border rounded flex items-center justify-center transition-colors ${
                                  st.status !== 'Inactive'
                                    ? 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-green-300'
                                    : 'bg-green-950/20 border-green-900/40 hover:bg-green-950/50 text-zinc-400'
                                }`}
                                title={st.status === 'Inactive' ? 'Activate member' : 'Deactivate member'}
                              >
                                <FiPower />
                              </button>
                              <button 
                                onClick={() => {
                                  setEditingStaff(st);
                                  setShowEditStaffForm(true);
                                }}
                                className="w-7 h-7 bg-zinc-800 hover:bg-zinc-700 border border-white/5 text-viva-gold rounded flex items-center justify-center transition-colors"
                                title="Edit Stylist details"
                              >
                                <FiEdit />
                              </button>
                              <button 
                                onClick={() => handleDeleteStaff(st._id)}
                                className="w-7 h-7 bg-red-950/20 hover:bg-red-950/40 border border-red-900 text-red-400 rounded flex items-center justify-center transition-colors"
                                title="Remove Staff member"
                              >
                                <FiTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SUB-VIEW 6: MEMBERSHIP MANAGEMENT */}
            {activeTab === 'memberships' && (
              <div className="space-y-8 animate-fade-in">
                
                {/* Section 1: Pending Student ID Requests */}
                <div className="bg-viva-charcoal border border-white/5 p-6 rounded-lg overflow-x-auto">
                  <h3 className="font-heading text-xl font-bold uppercase tracking-wider text-viva-gold mb-6">
                    Pending Student Verification Requests
                  </h3>
                  
                  {memberships.filter(m => m.membership?.type === 'Student' && m.membership?.status === 'Pending Approval').length === 0 ? (
                    <p className="text-xs text-viva-gray py-4 text-center">No pending student verification requests found.</p>
                  ) : (
                    <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
                      <thead>
                        <tr className="bg-viva-black border-b border-white/5 text-viva-gold font-heading tracking-widest uppercase">
                          <th className="p-3">Client Details</th>
                          <th className="p-3">Institution Name</th>
                          <th className="p-3">Student ID Number</th>
                          <th className="p-3">Student ID Document</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {memberships
                          .filter(m => m.membership?.type === 'Student' && m.membership?.status === 'Pending Approval')
                          .map(m => (
                            <tr key={m._id} className="hover:bg-viva-black/25">
                              <td className="p-3">
                                <span className="block text-viva-white font-bold">{m.name}</span>
                                <span className="block text-[10px] text-viva-gray">{m.email}</span>
                              </td>
                              <td className="p-3 text-zinc-300 font-medium">
                                {m.membership.institutionName}
                              </td>
                              <td className="p-3 text-viva-gold font-mono font-bold">
                                {m.membership.studentIdNumber}
                              </td>
                              <td className="p-3">
                                <a 
                                  href={m.membership.studentIdUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-viva-gold hover:underline font-semibold flex items-center gap-1"
                                >
                                  View Uploaded ID Card &rarr;
                                </a>
                              </td>
                              <td className="p-3 text-right">
                                <div className="flex justify-end gap-2">
                                  <button 
                                    onClick={() => handleApproveStudent(m._id)}
                                    className="bg-green-900/20 hover:bg-green-900/50 border border-green-800 text-green-300 px-3 py-1.5 rounded text-[10px] uppercase font-bold tracking-wider transition-colors"
                                  >
                                    Approve
                                  </button>
                                  <button 
                                    onClick={() => handleRejectStudent(m._id)}
                                    className="bg-red-900/20 hover:bg-red-950/50 border border-red-800 text-red-300 px-3 py-1.5 rounded text-[10px] uppercase font-bold tracking-wider transition-colors"
                                  >
                                    Reject
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Section 2: Club Memberships & Overrides */}
                <div className="bg-viva-charcoal border border-white/5 p-6 rounded-lg overflow-x-auto">
                  <h3 className="font-heading text-xl font-bold uppercase tracking-wider text-viva-gold mb-6">
                    Active Club Memberships & Overrides
                  </h3>
                  
                  {memberships.length === 0 ? (
                    <p className="text-xs text-viva-gray py-4 text-center">No active club memberships logged.</p>
                  ) : (
                    <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
                      <thead>
                        <tr className="bg-viva-black border-b border-white/5 text-viva-gold font-heading tracking-widest uppercase">
                          <th className="p-3">Client Details</th>
                          <th className="p-3">Membership Tier</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Purchase Date</th>
                          <th className="p-3">Expiry Date</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {memberships.map(m => (
                          <tr key={m._id} className="hover:bg-viva-black/25">
                            <td className="p-3">
                              <span className="block text-viva-white font-bold">{m.name}</span>
                              <span className="block text-[10px] text-viva-gray">{m.email}</span>
                            </td>
                            <td className="p-3">
                              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                                m.membership?.type === 'Platinum'
                                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                                  : m.membership?.type === 'Silver'
                                    ? 'bg-zinc-400/10 text-zinc-300 border-zinc-400/30'
                                    : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                              }`}>
                                {m.membership?.type} Club
                              </span>
                            </td>
                            <td className="p-3">
                              <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border ${
                                m.membership?.status === 'Active' 
                                  ? 'bg-green-950/30 text-green-300 border-green-900/40' 
                                  : m.membership?.status === 'Pending Approval'
                                    ? 'bg-yellow-950/30 text-yellow-300 border-yellow-900/40'
                                    : m.membership?.status === 'Rejected'
                                      ? 'bg-red-950/30 text-red-300 border-red-900/40'
                                      : 'bg-zinc-900/40 text-zinc-400 border-white/5'
                              }`}>
                                {m.membership?.status}
                              </span>
                            </td>
                            <td className="p-3 text-zinc-300 font-mono font-medium">
                              {m.membership?.purchaseDate ? new Date(m.membership.purchaseDate).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="p-3 text-viva-gold font-mono font-bold">
                              {m.membership?.expiryDate ? new Date(m.membership.expiryDate).toLocaleDateString() : 'Lifetime / Continuous'}
                            </td>
                            <td className="p-3 text-right">
                              <button 
                                onClick={() => {
                                  setOverridingUser(m);
                                  setOverrideType(m.membership?.type || 'None');
                                  setOverrideStatus(m.membership?.status || 'None');
                                  setOverrideExpiryDate(m.membership?.expiryDate ? new Date(m.membership.expiryDate).toISOString().split('T')[0] : '');
                                  setShowOverrideModal(true);
                                }}
                                className="bg-zinc-800 hover:bg-zinc-700 border border-white/5 text-viva-gold px-3 py-1.5 rounded text-[10px] uppercase font-bold tracking-wider transition-colors"
                              >
                                Modify
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Manual Override Modal */}
                {showOverrideModal && overridingUser && (
                  <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
                    <form onSubmit={handleManualOverride} className="bg-viva-charcoal border border-viva-gold/30 p-6 rounded-lg space-y-4 max-w-md w-full">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <h4 className="font-heading text-sm font-bold text-viva-gold uppercase tracking-wider">Manual Membership Override</h4>
                        <button 
                          type="button" 
                          onClick={() => {
                            setShowOverrideModal(false);
                            setOverridingUser(null);
                          }} 
                          className="text-zinc-500 hover:text-white"
                        >
                          <FiX />
                        </button>
                      </div>
                      
                      <div className="text-xs space-y-1 py-1">
                        <p className="text-zinc-400">Client: <span className="text-white font-bold">{overridingUser.name}</span></p>
                        <p className="text-zinc-400">Email: <span className="text-zinc-300">{overridingUser.email}</span></p>
                      </div>

                      <div className="flex flex-col space-y-1.5">
                        <label className="text-[9px] uppercase tracking-widest text-viva-gray">Membership Tier</label>
                        <select
                          value={overrideType}
                          onChange={(e) => setOverrideType(e.target.value)}
                          className="viva-input cursor-pointer"
                          required
                        >
                          <option value="None">None</option>
                          <option value="Student">Student</option>
                          <option value="Silver">Silver</option>
                          <option value="Platinum">Platinum</option>
                        </select>
                      </div>

                      <div className="flex flex-col space-y-1.5">
                        <label className="text-[9px] uppercase tracking-widest text-viva-gray">Membership Status</label>
                        <select
                          value={overrideStatus}
                          onChange={(e) => setOverrideStatus(e.target.value)}
                          className="viva-input cursor-pointer"
                          required
                        >
                          <option value="None">None</option>
                          <option value="Pending Approval">Pending Approval</option>
                          <option value="Active">Active</option>
                          <option value="Expired">Expired</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>

                      <div className="flex flex-col space-y-1.5">
                        <label className="text-[9px] uppercase tracking-widest text-viva-gray">Expiry Date</label>
                        <input 
                          type="date"
                          value={overrideExpiryDate}
                          onChange={(e) => setOverrideExpiryDate(e.target.value)}
                          className="viva-input cursor-pointer"
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-2">
                        <button 
                          type="button" 
                          onClick={() => {
                            setShowOverrideModal(false);
                            setOverridingUser(null);
                          }} 
                          className="text-xs text-viva-gray border border-white/5 px-4 py-2 rounded"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="bg-viva-gold text-viva-black font-body font-bold text-xs uppercase tracking-widest px-5 py-2 rounded shadow-gold-glow"
                        >
                          Apply Overrides
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Section 3: Membership Tiers Configurations */}
                {settings && settings.memberships && (
                  <div className="bg-viva-charcoal border border-white/5 p-6 rounded-lg space-y-6 mt-8">
                    <h3 className="font-heading text-xl font-bold uppercase tracking-wider text-viva-gold">
                      Membership Tiers Configurations
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {['student', 'silver', 'platinum'].map(tier => {
                        const config = settings.memberships[tier] || { price: 0, discount: 0, benefits: [] };
                        return (
                          <div key={tier} className="bg-viva-black p-5 rounded-lg border border-white/5 flex flex-col justify-between space-y-4">
                            <div>
                              <h4 className="font-heading text-sm font-bold uppercase tracking-widest text-[#D4AF37] mb-3">
                                {tier} Tier
                              </h4>
                              
                              <div className="space-y-3">
                                <div className="flex flex-col space-y-1">
                                  <label className="text-[9px] uppercase tracking-widest text-viva-gray">Price (₹)</label>
                                  <input
                                    type="number"
                                    value={config.price}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      const updated = { ...config, price: val };
                                      setSettingsData(prev => ({
                                        ...prev,
                                        memberships: { ...prev.memberships, [tier]: updated }
                                      }));
                                    }}
                                    className="viva-input"
                                    min="0"
                                  />
                                </div>

                                <div className="flex flex-col space-y-1">
                                  <label className="text-[9px] uppercase tracking-widest text-viva-gray">Discount (%)</label>
                                  <input
                                    type="number"
                                    value={config.discount}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      const updated = { ...config, discount: val };
                                      setSettingsData(prev => ({
                                        ...prev,
                                        memberships: { ...prev.memberships, [tier]: updated }
                                      }));
                                    }}
                                    className="viva-input"
                                    min="0"
                                    max="100"
                                  />
                                </div>

                                <div className="flex flex-col space-y-1">
                                  <label className="text-[9px] uppercase tracking-widest text-viva-gray">Benefits</label>
                                  <ul className="space-y-1 max-h-32 overflow-y-auto pr-1">
                                    {(config.benefits || []).map((benefit, bIdx) => (
                                      <li key={bIdx} className="flex justify-between items-center text-[10px] text-zinc-300 bg-zinc-900 px-2 py-1 rounded">
                                        <span className="truncate max-w-[150px]">{benefit}</span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const updatedBenefits = (config.benefits || []).filter((_, i) => i !== bIdx);
                                            const updated = { ...config, benefits: updatedBenefits };
                                            setSettingsData(prev => ({
                                              ...prev,
                                              memberships: { ...prev.memberships, [tier]: updated }
                                            }));
                                          }}
                                          className="text-red-400 hover:text-red-350 p-0.5 ml-1"
                                        >
                                          <FiTrash className="text-xs" />
                                        </button>
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                <div className="flex gap-1.5 pt-1">
                                  <input
                                    type="text"
                                    placeholder="Add benefit..."
                                    value={newBenefits[tier] || ''}
                                    onChange={(e) => setNewBenefits(prev => ({ ...prev, [tier]: e.target.value }))}
                                    className="bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-[10px] text-white outline-none focus:border-viva-gold flex-grow"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const bVal = (newBenefits[tier] || '').trim();
                                      if (!bVal) return;
                                      const updatedBenefits = [...(config.benefits || []), bVal];
                                      const updated = { ...config, benefits: updatedBenefits };
                                      setSettingsData(prev => ({
                                        ...prev,
                                        memberships: { ...prev.memberships, [tier]: updated }
                                      }));
                                      setNewBenefits(prev => ({ ...prev, [tier]: '' }));
                                    }}
                                    className="bg-viva-gold hover:bg-viva-gold/90 text-zinc-950 px-2 py-1 rounded font-bold text-[10px]"
                                  >
                                    Add
                                  </button>
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleSaveMembershipConfig(tier, config)}
                              className="w-full mt-3 border border-viva-gold hover:bg-viva-gold hover:text-zinc-950 text-viva-gold font-body font-bold text-[10px] uppercase tracking-widest py-2 rounded transition-colors"
                            >
                              Save {tier} Config
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* SUB-VIEW: CUSTOMERS */}
            {activeTab === 'customers' && (
              <div className="bg-viva-charcoal border border-white/5 p-6 rounded-lg animate-fade-in">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h3 className="font-heading text-xl font-bold uppercase tracking-wider text-viva-gold">
                    Salon Customers
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="Search name or phone..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-xs text-white outline-none focus:border-viva-gold placeholder-zinc-600"
                    />
                    <select
                      value={customerFilter}
                      onChange={(e) => setCustomerFilter(e.target.value)}
                      className="bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-xs text-white outline-none focus:border-viva-gold cursor-pointer"
                    >
                      <option value="All">All Membership Tiers</option>
                      <option value="Platinum">Platinum Club</option>
                      <option value="Silver">Silver Club</option>
                      <option value="Student">Student Club</option>
                      <option value="None">No Membership</option>
                    </select>
                  </div>
                </div>

                {filteredCustomers.length === 0 ? (
                  <p className="text-xs text-viva-gray py-4 text-center">No customers match your criteria.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
                      <thead>
                        <tr className="bg-viva-black border-b border-white/5 text-viva-gold font-heading tracking-widest uppercase">
                          <th className="p-3">Full Name</th>
                          <th className="p-3">Mobile Number</th>
                          <th className="p-3">Membership Club</th>
                          <th className="p-3 text-center">Completed Visits</th>
                          <th className="p-3 text-center">Last Appointment</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredCustomers.map(cust => (
                          <React.Fragment key={cust.id || cust._id}>
                            <tr className="hover:bg-viva-black/25">
                              <td className="p-3 font-bold text-white">{cust.fullName}</td>
                              <td className="p-3 font-mono text-zinc-300">{cust.mobileNumber}</td>
                              <td className="p-3">
                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                                  cust.membershipTier === 'Platinum'
                                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                                    : cust.membershipTier === 'Silver'
                                      ? 'bg-zinc-400/10 text-zinc-300 border-zinc-400/30'
                                      : cust.membershipTier === 'Student'
                                        ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                                        : 'bg-zinc-900/40 text-zinc-400 border-white/5'
                                }`}>
                                  {cust.membershipTier || 'None'}
                                </span>
                              </td>
                              <td className="p-3 text-center font-bold text-viva-gold font-mono">{cust.totalCompletedVisits || 0}</td>
                              <td className="p-3 text-center text-zinc-400 font-mono">
                                {cust.lastAppointmentDate 
                                  ? `${new Date(cust.lastAppointmentDate).toLocaleDateString()} ${cust.lastAppointmentTime || ''}` 
                                  : 'Never'}
                              </td>
                              <td className="p-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => setExpandedCustomerPhone(expandedCustomerPhone === cust.mobileNumber ? null : cust.mobileNumber)}
                                  className="border border-[#D4AF37]/30 hover:border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all"
                                >
                                  {expandedCustomerPhone === cust.mobileNumber ? 'Hide History' : 'View History'}
                                </button>
                              </td>
                            </tr>
                            {expandedCustomerPhone === cust.mobileNumber && (
                              <tr className="bg-zinc-950/60">
                                <td colSpan={6} className="p-4 border-t border-white/5">
                                  <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                      <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                                        Appointment History for {cust.fullName}
                                      </h4>
                                      <span className="text-[10px] text-zinc-500 font-mono font-bold">
                                        Total Bookings: {cust.appointments?.length || 0}
                                      </span>
                                    </div>
                                    {!cust.appointments || cust.appointments.length === 0 ? (
                                      <p className="text-xs text-zinc-500 font-body py-2">No appointments recorded for this customer.</p>
                                    ) : (
                                      <div className="overflow-x-auto border border-white/5 rounded-lg max-h-[300px] overflow-y-auto">
                                        <table className="w-full text-left text-xs whitespace-nowrap">
                                          <thead>
                                            <tr className="bg-zinc-900 border-b border-white/5 text-zinc-400 font-bold uppercase font-heading tracking-wider">
                                              <th className="p-2.5">Date & Time</th>
                                              <th className="p-2.5">Service</th>
                                              <th className="p-2.5">Stylist</th>
                                              <th className="p-2.5">Notes</th>
                                              <th className="p-2.5">Price</th>
                                              <th className="p-2.5 text-right">Status</th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-white/5 text-zinc-300">
                                            {cust.appointments.map((app, appIdx) => (
                                              <tr key={app._id || appIdx} className="hover:bg-zinc-900/40">
                                                <td className="p-2.5 font-mono">{app.appointmentDate} at {app.appointmentTime}</td>
                                                <td className="p-2.5 font-bold text-white">{app.service}</td>
                                                <td className="p-2.5 text-zinc-450">{app.staffMember}</td>
                                                <td className="p-2.5 italic text-zinc-500 truncate max-w-[200px]" title={app.notes}>{app.notes || 'None'}</td>
                                                <td className="p-2.5 font-mono text-[#D4AF37]">₹{app.totalAmount || 0}</td>
                                                <td className="p-2.5 text-right">
                                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                                    app.status === 'Completed'
                                                      ? 'bg-green-500/10 text-green-400'
                                                      : app.status === 'Confirmed'
                                                        ? 'bg-blue-500/10 text-blue-400'
                                                        : app.status === 'Cancelled'
                                                          ? 'bg-red-500/10 text-red-400'
                                                          : 'bg-amber-500/10 text-amber-400'
                                                  }`}>
                                                    {app.status || app.bookingStatus}
                                                  </span>
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* SUB-VIEW 7: GALLERY MANAGEMENT */}
            {activeTab === 'gallery' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center bg-zinc-900 border border-zinc-800/80 p-4 rounded-xl">
                  <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-[#D4AF37]">Gallery Manager</h3>
                  <button 
                    onClick={() => setShowGalleryForm(true)}
                    className="flex items-center gap-1.5 bg-[#D4AF37] text-zinc-950 font-body font-bold text-xs uppercase tracking-widest px-4 py-2 rounded shadow-gold-glow hover:scale-105 transition-transform"
                  >
                    <FiPlus /> Add Gallery Item
                  </button>
                </div>

                {/* Add Gallery Item Modal */}
                {showGalleryForm && (
                  <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
                    <form onSubmit={handleAddGalleryItem} className="bg-zinc-900 border border-[#D4AF37]/30 p-6 rounded-xl space-y-4 max-w-2xl w-full">
                      <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                        <h4 className="font-heading text-base font-bold text-[#D4AF37] uppercase tracking-wider">New Gallery Photo</h4>
                        <button type="button" onClick={() => setShowGalleryForm(false)} className="text-zinc-500 hover:text-white"><FiX /></button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col">
                          <label className="text-[9px] uppercase tracking-widest text-zinc-400 mb-1.5">Photo Title</label>
                          <input 
                            type="text" 
                            value={newGalleryItem.title} 
                            onChange={(e) => setNewGalleryItem({ ...newGalleryItem, title: e.target.value })} 
                            className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-2.5 text-sm focus:border-[#D4AF37] outline-none text-white transition-colors" 
                            required 
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-[9px] uppercase tracking-widest text-zinc-400 mb-1.5">Category</label>
                          <select 
                            value={newGalleryItem.category} 
                            onChange={(e) => setNewGalleryItem({ ...newGalleryItem, category: e.target.value })} 
                            className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-2.5 text-sm focus:border-[#D4AF37] outline-none text-white cursor-pointer"
                          >
                            {['Haircut', 'Hair Color', 'Bridal', 'Nail Art', 'Spa', 'Makeover', 'Hairstyling', 'Nails'].map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-1.5">
                        <label className="text-[9px] uppercase tracking-widest text-zinc-400">Before / After Setup</label>
                        <div className="flex items-center gap-2 mt-1">
                          <input 
                            type="checkbox" 
                            id="isBeforeAfter"
                            checked={newGalleryItem.isBeforeAfter} 
                            onChange={(e) => setNewGalleryItem({ ...newGalleryItem, isBeforeAfter: e.target.checked })} 
                            className="w-4 h-4 accent-[#D4AF37] rounded cursor-pointer" 
                          />
                          <label htmlFor="isBeforeAfter" className="text-xs text-zinc-300 cursor-pointer select-none">
                            This is a Before & After transition comparison
                          </label>
                        </div>
                      </div>

                      {newGalleryItem.isBeforeAfter ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex flex-col">
                            <label className="text-[9px] uppercase tracking-widest text-zinc-400 mb-1.5">Before Image URL</label>
                            <input 
                              type="url" 
                              value={newGalleryItem.beforeImageUrl} 
                              onChange={(e) => setNewGalleryItem({ ...newGalleryItem, beforeImageUrl: e.target.value })} 
                              className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-2.5 text-sm focus:border-[#D4AF37] outline-none text-white transition-colors" 
                              placeholder="https://images.unsplash.com/before-image"
                              required 
                            />
                          </div>
                          <div className="flex flex-col">
                            <label className="text-[9px] uppercase tracking-widest text-zinc-400 mb-1.5">After Image URL</label>
                            <input 
                              type="url" 
                              value={newGalleryItem.afterImageUrl} 
                              onChange={(e) => setNewGalleryItem({ ...newGalleryItem, afterImageUrl: e.target.value })} 
                              className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-2.5 text-sm focus:border-[#D4AF37] outline-none text-white transition-colors" 
                              placeholder="https://images.unsplash.com/after-image"
                              required 
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          <label className="text-[9px] uppercase tracking-widest text-zinc-400 mb-1.5">Image URL</label>
                          <input 
                            type="url" 
                            value={newGalleryItem.imageUrl} 
                            onChange={(e) => setNewGalleryItem({ ...newGalleryItem, imageUrl: e.target.value })} 
                            className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-2.5 text-sm focus:border-[#D4AF37] outline-none text-white transition-colors" 
                            placeholder="https://images.unsplash.com/photo-1562322140-8baeececf3df"
                            required 
                          />
                        </div>
                      )}

                      <div className="flex justify-end gap-3 pt-2">
                        <button 
                          type="button" 
                          onClick={() => setShowGalleryForm(false)} 
                          className="text-xs text-zinc-400 border border-zinc-800 px-4 py-2 rounded"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="bg-[#D4AF37] text-zinc-950 font-body font-bold text-xs uppercase tracking-widest px-5 py-2 rounded shadow-gold-glow"
                        >
                          Upload Photo
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Gallery grid list */}
                {gallery.length === 0 ? (
                  <p className="text-xs text-zinc-500 py-10 text-center italic">No gallery creations published yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {gallery.map(item => (
                      <div key={item._id} className="bg-zinc-900 border border-zinc-800/80 rounded-xl overflow-hidden flex flex-col group relative">
                        {item.isBeforeAfter ? (
                          <div className="grid grid-cols-2 aspect-video border-b border-zinc-800 bg-black">
                            <div className="relative">
                              <img src={item.beforeImageUrl} alt="Before" className="w-full h-full object-cover" />
                              <span className="absolute bottom-1.5 left-1.5 bg-black/70 text-[8px] font-bold text-white uppercase tracking-widest px-1.5 py-0.5 rounded">Before</span>
                            </div>
                            <div className="relative">
                              <img src={item.afterImageUrl} alt="After" className="w-full h-full object-cover" />
                              <span className="absolute bottom-1.5 left-1.5 bg-[#D4AF37]/90 text-zinc-950 text-[8px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded shadow-sm">After</span>
                            </div>
                          </div>
                        ) : (
                          <div className="aspect-video overflow-hidden border-b border-zinc-800 bg-black">
                            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          </div>
                        )}
                        <div className="p-4 flex flex-col justify-between flex-grow gap-3">
                          <div>
                            <span className="text-[9px] bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                              {item.category}
                            </span>
                            <h4 className="font-heading font-bold text-sm text-white uppercase mt-2">{item.title}</h4>
                          </div>
                          <div className="flex justify-end pt-2 border-t border-zinc-800/40">
                            <button 
                              onClick={() => handleDeleteGalleryItem(item._id)}
                              className="text-zinc-500 hover:text-red-400 p-1.5 rounded bg-zinc-950 border border-zinc-855 hover:border-red-900/40 transition-colors flex items-center gap-1 text-[10px] uppercase font-bold"
                              title="Delete Photo"
                            >
                              <FiTrash /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SUB-VIEW 8: SYSTEM NOTIFICATION LOGS */}
            {activeTab === 'notifications' && (
              <div className="bg-zinc-900 border border-zinc-800/80 p-6 rounded-xl overflow-x-auto animate-fade-in">
                <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-[#D4AF37] mb-6">Dispatch System logs</h3>
                
                {notifications.length === 0 ? (
                  <p className="text-xs text-zinc-500 py-4 text-center italic">No automated system logs compiled yet.</p>
                ) : (
                  <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
                    <thead>
                      <tr className="bg-zinc-950 border-b border-zinc-800 text-[#D4AF37] font-heading tracking-widest uppercase">
                        <th className="p-3">Channel & Recipient</th>
                        <th className="p-3">Subject & Content</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Time Dispatched</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                      {notifications.map(n => (
                        <tr key={n._id} className="hover:bg-zinc-950/25">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                                n.type === 'whatsapp' 
                                  ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/40' 
                                  : 'bg-sky-950/30 text-sky-400 border-sky-900/40'
                              }`}>
                                {n.type}
                              </span>
                              <span className="font-mono text-zinc-300">{n.recipient}</span>
                            </div>
                          </td>
                          <td className="p-3 max-w-md">
                            {n.subject && <span className="block text-white font-bold mb-0.5 truncate">{n.subject}</span>}
                            <span className="block text-zinc-400 whitespace-pre-wrap max-w-sm truncate" title={n.message}>
                              {n.message}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border ${
                              n.status === 'Sent' 
                                ? 'bg-green-950/20 text-green-400 border-green-900/30' 
                                : 'bg-red-950/20 text-red-400 border-red-900/30'
                            }`}>
                              {n.status}
                            </span>
                          </td>
                          <td className="p-3 text-zinc-500 font-mono">
                            {new Date(n.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* SUB-VIEW 9: SALON SETTINGS */}
            {activeTab === 'settings' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-viva-charcoal border border-white/5 p-6 rounded-lg">
                  <h3 className="font-heading text-xl font-bold uppercase tracking-wider text-viva-gold mb-6">
                    Salon Configurations & Contact Settings
                  </h3>
                  
                  {settings ? (
                    <form onSubmit={handleSaveGeneralSettings} className="space-y-4 max-w-2xl">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col">
                          <label className="text-[9px] uppercase tracking-widest text-viva-gray mb-1.5">Owner Name</label>
                          <input 
                            type="text" 
                            value={settingsForm.ownerName} 
                            onChange={(e) => setSettingsForm({ ...settingsForm, ownerName: e.target.value })} 
                            className="bg-zinc-950 border border-zinc-850 rounded px-3 py-1.5 text-xs text-white outline-none focus:border-viva-gold" 
                            required 
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-[9px] uppercase tracking-widest text-viva-gray mb-1.5">Salon Phone Number</label>
                          <input 
                            type="text" 
                            value={settingsForm.salonPhone} 
                            onChange={(e) => setSettingsForm({ ...settingsForm, salonPhone: e.target.value })} 
                            className="bg-zinc-950 border border-zinc-850 rounded px-3 py-1.5 text-xs text-white outline-none focus:border-viva-gold" 
                            required 
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col">
                          <label className="text-[9px] uppercase tracking-widest text-viva-gray mb-1.5">Owner WhatsApp Number</label>
                          <input 
                            type="text" 
                            value={settingsForm.ownerWhatsapp} 
                            onChange={(e) => setSettingsForm({ ...settingsForm, ownerWhatsapp: e.target.value })} 
                            className="bg-zinc-950 border border-zinc-850 rounded px-3 py-1.5 text-xs text-white outline-none focus:border-viva-gold" 
                            required 
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-[9px] uppercase tracking-widest text-viva-gray mb-1.5">Owner Email Address</label>
                          <input 
                            type="email" 
                            value={settingsForm.ownerEmail} 
                            onChange={(e) => setSettingsForm({ ...settingsForm, ownerEmail: e.target.value })} 
                            className="bg-zinc-950 border border-zinc-850 rounded px-3 py-1.5 text-xs text-white outline-none focus:border-viva-gold" 
                            required 
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col">
                          <label className="text-[9px] uppercase tracking-widest text-viva-gray mb-1.5">Working Hours Start</label>
                          <input 
                            type="text" 
                            value={settingsForm.workingHoursStart} 
                            onChange={(e) => setSettingsForm({ ...settingsForm, workingHoursStart: e.target.value })} 
                            className="bg-zinc-950 border border-zinc-850 rounded px-3 py-1.5 text-xs text-white outline-none focus:border-viva-gold" 
                            placeholder="e.g. 10:00 AM"
                            required 
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-[9px] uppercase tracking-widest text-viva-gray mb-1.5">Working Hours End</label>
                          <input 
                            type="text" 
                            value={settingsForm.workingHoursEnd} 
                            onChange={(e) => setSettingsForm({ ...settingsForm, workingHoursEnd: e.target.value })} 
                            className="bg-zinc-950 border border-zinc-850 rounded px-3 py-1.5 text-xs text-white outline-none focus:border-viva-gold" 
                            placeholder="e.g. 08:00 PM"
                            required 
                          />
                        </div>
                      </div>

                      <div className="pt-4">
                        <button 
                          type="submit" 
                          className="bg-viva-gold text-viva-black font-body font-bold text-xs uppercase tracking-widest px-5 py-2.5 rounded shadow-gold-glow hover:scale-105 transition-transform"
                        >
                          Save Salon Settings
                        </button>
                      </div>
                    </form>
                  ) : (
                    <p className="text-xs text-viva-gray">Loading salon settings configuration...</p>
                  )}
                </div>
              </div>
            )}

            {/* RESCHEDULE DIALOG MODAL */}
            {showRescheduleModal && reschedulingApp && (
              <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
                <form onSubmit={submitReschedule} className="bg-viva-charcoal border border-viva-gold/30 p-6 rounded-lg space-y-4 max-w-md w-full">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <h4 className="font-heading text-sm font-bold text-viva-gold uppercase tracking-wider">Reschedule Booking</h4>
                    <button type="button" onClick={() => setShowRescheduleModal(false)} className="text-zinc-500 hover:text-white"><FiX /></button>
                  </div>
                  
                  <div className="text-xs space-y-1 py-1">
                    <p className="text-zinc-400">Client: <span className="text-white font-bold">{reschedulingApp.customerName}</span></p>
                    <p className="text-zinc-400">Services: <span className="text-zinc-300">{(reschedulingApp.selectedServices || []).map(s => s.serviceName).join(', ')}</span></p>
                    <p className="text-zinc-400">Current Slot: <span className="text-viva-gold font-mono">{reschedulingApp.appointmentDate} &bull; {reschedulingApp.appointmentTime}</span></p>
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[9px] uppercase tracking-widest text-viva-gray">New Date</label>
                    <input 
                      type="date"
                      value={rescheduleDate}
                      min={getTomorrowString()}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                      className="viva-input cursor-pointer"
                      required
                    />
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[9px] uppercase tracking-widest text-viva-gray">New Timeslot</label>
                    {rescheduleSlotsLoading ? (
                      <span className="text-[10px] text-zinc-500">Retrieving slots...</span>
                    ) : (
                      <select
                        value={rescheduleTimeSlot}
                        onChange={(e) => setRescheduleTimeSlot(e.target.value)}
                        className="viva-input cursor-pointer"
                        required
                      >
                        <option value="">Select Timeslot</option>
                        {rescheduleSlots.map(({ slot, isAvailable }) => (
                          <option key={slot} value={slot} disabled={!isAvailable}>
                            {slot} {!isAvailable && '(Booked)'}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button 
                      type="button" 
                      onClick={() => setShowRescheduleModal(false)} 
                      className="text-xs text-viva-gray border border-white/5 px-4 py-2 rounded"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="bg-viva-gold text-viva-black font-body font-bold text-xs uppercase tracking-widest px-5 py-2 rounded shadow-gold-glow"
                    >
                      Reschedule Now
                    </button>
                  </div>
                </form>
              </div>
            )}
            
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
