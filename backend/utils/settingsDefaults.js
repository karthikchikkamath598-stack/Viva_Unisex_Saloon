const defaultSettings = {
  id: "viva-settings",
  ownerName: 'David Salon Owner',
  salonPhone: '+919999999999',
  ownerWhatsapp: '+917799399955',
  ownerEmail: 'owner@vivasalon.com',
  workingHoursStart: '10:00 AM',
  workingHoursEnd: '08:00 PM',
  slots: [
    "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM",
    "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"
  ],
  disabledSlots: [],
  blockedHolidays: [],
  memberships: {
    student: {
      price: 999,
      discount: 5,
      benefits: ['5% Discount on all services', 'Priority booking support', 'Valid student ID card verification required']
    },
    silver: {
      price: 2999,
      discount: 10,
      benefits: ['10% Discount on all services', '1 free grooming session per quarter', '1 Year validity period']
    },
    platinum: {
      price: 4999,
      discount: 20,
      benefits: ['20% Discount on all services', 'Unlimited free beverage bar', 'Access to exclusive member lounge', 'Priority booking priority queue slot']
    }
  }
};

module.exports = { defaultSettings };
