const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '..', 'mock_db.json');

const defaultStylists = [
  {
    _id: "stylist_fardeen",
    name: "Fardeen",
    specialty: "Master Barber & Hair Artisan",
    rating: 4.9,
    imageUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=600",
    skills: ["Precision Fades", "Classic Shaves", "Hair Styling", "Beard Grooming"],
    availability: {
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      slots: ["10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"]
    }
  },
  {
    _id: "stylist_hussain",
    name: "Hussain",
    specialty: "Hair Colorist & Stylist",
    rating: 4.8,
    imageUrl: "https://images.unsplash.com/photo-1595894155162-e0709be9b595?auto=format&fit=crop&q=80&w=600",
    skills: ["Balayage", "Highlighting", "Modern Hair Coloring", "Hair Cut"],
    availability: {
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      slots: ["10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"]
    }
  },
  {
    _id: "stylist_sandhya",
    name: "Sandhya",
    specialty: "Skin Care Expert & Hair Stylist",
    rating: 5.0,
    imageUrl: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&q=80&w=600",
    skills: ["Advanced Facials", "Skin Treatment", "Bridal Styling", "Nail Polish"],
    availability: {
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      slots: ["10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"]
    }
  }
];

// Helper to generate services dynamically
const rawServices = [
  // --- WOMEN'S SERVICES ---
  
  // Premium Facial (Image 3)
  { name: "Advance Gold Facial", cat: "Women's Services", sub: "Premium Facial", price: 2500, dur: 60, img: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&q=80&w=600", pop: true },
  { name: "Acne Facial", cat: "Women's Services", sub: "Premium Facial", price: 2200, dur: 60, img: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&q=80&w=600" },
  { name: "Insta Fair Facial", cat: "Women's Services", sub: "Premium Facial", price: 2400, dur: 60, img: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&q=80&w=600" },
  { name: "Layer Advance Radiance", cat: "Women's Services", sub: "Premium Facial", price: 2600, dur: 75, img: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&q=80&w=600" },
  { name: "Layer Advance Whitening Facial", cat: "Women's Services", sub: "Premium Facial", price: 2800, dur: 75, img: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&q=80&w=600" },
  { name: "Advance Kiwi Fruit Marmalade", cat: "Women's Services", sub: "Premium Facial", price: 3000, dur: 75, img: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&q=80&w=600" },
  { name: "Advance Pineapple Fruit Marmalade", cat: "Women's Services", sub: "Premium Facial", price: 2800, dur: 75, img: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&q=80&w=600" },

  // Face Clean Up (Image 3)
  { name: "Oily Skin", cat: "Women's Services", sub: "Face Clean Up", price: 750, dur: 40, img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600" },
  { name: "Dry Skin", cat: "Women's Services", sub: "Face Clean Up", price: 500, dur: 40, img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600" },

  // Signature Facial (Image 3)
  { name: "Whitening Facial", cat: "Women's Services", sub: "Signature Facial", price: 3000, dur: 60, img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600" },
  { name: "Shine & Glow Facial", cat: "Women's Services", sub: "Signature Facial", price: 3500, dur: 60, img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600", pop: true },
  { name: "Anti Aging Facial", cat: "Women's Services", sub: "Signature Facial", price: 4000, dur: 75, img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600" },
  { name: 'Brightening & Whitening Facial "Bridal Special"', cat: "Women's Services", sub: "Signature Facial", price: 4500, dur: 75, img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600" },

  // Hair Spa (Image 3)
  ...["Repairing Hair Spa", "Smoothening Hair Spa", "Vitalising Hair Spa", "Nourishing Hair Spa", "Colour Brilliance Hair Spa", "Volume Boost Hair Spa"].flatMap(spaType => [
    { name: `${spaType} (Short)`, cat: "Women's Services", sub: "Hair Spa", price: 1200, dur: 45, img: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600" },
    { name: `${spaType} (Medium)`, cat: "Women's Services", sub: "Hair Spa", price: 1400, dur: 50, img: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600" },
    { name: `${spaType} (Long)`, cat: "Women's Services", sub: "Hair Spa", price: 1600, dur: 55, img: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600" },
    { name: `${spaType} (Extra Long)`, cat: "Women's Services", sub: "Hair Spa", price: 1800, dur: 60, img: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600" }
  ]),

  // Hair Treatment (Image 2)
  ...[
    { name: "Balancing Treatment" },
    { name: "Anti Dandruff" },
    { name: "Anti Hair Fall Treatment" },
    { name: "Plex Treatment" }
  ].flatMap(treat => [
    { name: `${treat.name} (Short)`, cat: "Women's Services", sub: "Hair Treatment", price: 1600, dur: 45, img: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600" },
    { name: `${treat.name} (Medium)`, cat: "Women's Services", sub: "Hair Treatment", price: 1900, dur: 50, img: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600" },
    { name: `${treat.name} (Long)`, cat: "Women's Services", sub: "Hair Treatment", price: 2200, dur: 55, img: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600" },
    { name: `${treat.name} (Extra Long)`, cat: "Women's Services", sub: "Hair Treatment", price: 2500, dur: 60, img: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600" }
  ]),

  // Rebonding (Image 2)
  { name: "Rebonding (Short)", cat: "Women's Services", sub: "Rebonding", price: 5000, dur: 120, img: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600" },
  { name: "Rebonding (Medium)", cat: "Women's Services", sub: "Rebonding", price: 7000, dur: 150, img: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600" },
  { name: "Rebonding (Long)", cat: "Women's Services", sub: "Rebonding", price: 9500, dur: 180, img: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600" },
  { name: "Rebonding (Extra Long)", cat: "Women's Services", sub: "Rebonding", price: 12000, dur: 210, img: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600" },

  // Keratin (Image 2)
  { name: "Keratin (Short)", cat: "Women's Services", sub: "Keratin", price: 6500, dur: 120, img: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600" },
  { name: "Keratin (Medium)", cat: "Women's Services", sub: "Keratin", price: 8500, dur: 150, img: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600", pop: true },
  { name: "Keratin (Long)", cat: "Women's Services", sub: "Keratin", price: 11500, dur: 180, img: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600" },
  { name: "Keratin (Extra Long)", cat: "Women's Services", sub: "Keratin", price: 13500, dur: 210, img: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600" },

  // Temporary Straightening (Image 2)
  { name: "Temporary Straightening (Short)", cat: "Women's Services", sub: "Temporary Straightening", price: 700, dur: 25, img: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600" },
  { name: "Temporary Straightening (Medium)", cat: "Women's Services", sub: "Temporary Straightening", price: 1000, dur: 30, img: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600" },
  { name: "Temporary Straightening (Long)", cat: "Women's Services", sub: "Temporary Straightening", price: 1200, dur: 35, img: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600" },
  { name: "Temporary Straightening (Extra Long)", cat: "Women's Services", sub: "Temporary Straightening", price: 1500, dur: 45, img: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600" },

  // Colours (Image 2)
  { name: "Basic Colours", cat: "Women's Services", sub: "Colours", price: 600, dur: 60, img: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600" },
  { name: "Matrix Hair Colour", cat: "Women's Services", sub: "Colours", price: 1200, dur: 60, img: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600" },
  { name: "Loreal Hair Colour (Ammonia Free)", cat: "Women's Services", sub: "Colours", price: 1200, dur: 60, img: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600" },
  { name: "Innova Hair Colour (Ammonia Free)", cat: "Women's Services", sub: "Colours", price: 1200, dur: 60, img: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600" },
  { name: "Hair Colour Highlights Golden", cat: "Women's Services", sub: "Colours", price: 1800, dur: 75, img: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600" },

  // Makeup (Image 2)
  { name: "Eye Makeup", cat: "Women's Services", sub: "Makeup", price: 1300, dur: 30, img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600" },
  { name: "Light Makeup", cat: "Women's Services", sub: "Makeup", price: 2800, dur: 45, img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600" },
  { name: "Party Makeup", cat: "Women's Services", sub: "Makeup", price: 3000, dur: 60, img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600" },
  { name: "Makeup For Photo Shoot", cat: "Women's Services", sub: "Makeup", price: 17000, dur: 120, img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600" },

  // Bridal Makeup (Image 2)
  { name: "Engagement", cat: "Women's Services", sub: "Bridal Makeup", price: 8000, dur: 120, img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600" },
  { name: "Haldi & Mehendi Makeup", cat: "Women's Services", sub: "Bridal Makeup", price: 7000, dur: 120, img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600" },
  { name: "Marriage", cat: "Women's Services", sub: "Bridal Makeup", price: 18000, dur: 180, img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600", pop: true },
  { name: "Reception", cat: "Women's Services", sub: "Bridal Makeup", price: 16000, dur: 150, img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600" },
  { name: "Saree Drapping", cat: "Women's Services", sub: "Bridal Makeup", price: 1800, dur: 45, img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600" },

  // Hair Cut (Image 3)
  { name: "Kids Hair Cut", cat: "Women's Services", sub: "Hair Cut", price: 300, dur: 20, img: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600" },
  { name: "Hair Wash", cat: "Women's Services", sub: "Hair Cut", price: 300, dur: 15, img: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600" },
  { name: "Basic Hair Cut", cat: "Women's Services", sub: "Hair Cut", price: 400, dur: 30, img: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600" },
  { name: "Advance Hair Cut (Shampoo + Conditioner + Setting)", cat: "Women's Services", sub: "Hair Cut", price: 1200, dur: 45, img: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600", pop: true },

  // Blow Dry (Image 3)
  { name: "Curl Short", cat: "Women's Services", sub: "Blow Dry", price: 300, dur: 25, img: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600" },
  { name: "Curl Medium", cat: "Women's Services", sub: "Blow Dry", price: 450, dur: 30, img: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600" },
  { name: "Curl Long", cat: "Women's Services", sub: "Blow Dry", price: 600, dur: 40, img: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600" },

  // Straightening / Smoothening (Image 3)
  { name: "Straightening/Smoothening (Short)", cat: "Women's Services", sub: "Straightening / Smoothening", price: 4500, dur: 120, img: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600" },
  { name: "Straightening/Smoothening (Medium)", cat: "Women's Services", sub: "Straightening / Smoothening", price: 5500, dur: 140, img: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600" },
  { name: "Straightening/Smoothening (Long)", cat: "Women's Services", sub: "Straightening / Smoothening", price: 7500, dur: 160, img: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600" },
  { name: "Straightening/Smoothening (Extra Long)", cat: "Women's Services", sub: "Straightening / Smoothening", price: 11000, dur: 180, img: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600" },

  // Threading (Image 4)
  { name: "Eye Brow Threading", cat: "Women's Services", sub: "Threading", price: 50, dur: 10, img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600" },
  { name: "Upper Lip & Lower Lip Threading", cat: "Women's Services", sub: "Threading", price: 40, dur: 10, img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600" },
  { name: "Chin Threading", cat: "Women's Services", sub: "Threading", price: 40, dur: 10, img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600" },
  { name: "Forehead Threading", cat: "Women's Services", sub: "Threading", price: 40, dur: 10, img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600" },
  { name: "Side locks Threading", cat: "Women's Services", sub: "Threading", price: 50, dur: 10, img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600" },
  { name: "Full Face Threading", cat: "Women's Services", sub: "Threading", price: 200, dur: 20, img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600" },

  // Threading Premium Waxing (Image 4)
  { name: "Eye Brow Premium Waxing", cat: "Women's Services", sub: "Waxing", price: 80, dur: 10, img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600" },
  { name: "Upper Lip & Lower Lip Premium Waxing", cat: "Women's Services", sub: "Waxing", price: 70, dur: 10, img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600" },
  { name: "Chin Premium Waxing", cat: "Women's Services", sub: "Waxing", price: 70, dur: 10, img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600" },
  { name: "Forehead Premium Waxing", cat: "Women's Services", sub: "Waxing", price: 70, dur: 10, img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600" },
  { name: "Side locks Premium Waxing", cat: "Women's Services", sub: "Waxing", price: 100, dur: 10, img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600" },

  // Waxing (Image 4)
  { name: "Full Face Waxing (Flavour)", cat: "Women's Services", sub: "Waxing", price: 300, dur: 25, img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600" },
  { name: "Full Face Waxing (Premium)", cat: "Women's Services", sub: "Waxing", price: 400, dur: 30, img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600" },
  { name: "Full Arms Waxing (Flavour)", cat: "Women's Services", sub: "Waxing", price: 300, dur: 30, img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600" },
  { name: "Full Arms Waxing (Premium)", cat: "Women's Services", sub: "Waxing", price: 500, dur: 35, img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600" },
  { name: "Half Arms Waxing (Flavour)", cat: "Women's Services", sub: "Waxing", price: 200, dur: 20, img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600" },
  { name: "Half Arms Waxing (Premium)", cat: "Women's Services", sub: "Waxing", price: 300, dur: 25, img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600" },
  { name: "Under Arms Waxing (Flavour)", cat: "Women's Services", sub: "Waxing", price: 100, dur: 10, img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600" },
  { name: "Under Arms Waxing (Premium)", cat: "Women's Services", sub: "Waxing", price: 200, dur: 15, img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600" },
  { name: "Half Legs Waxing (Flavour)", cat: "Women's Services", sub: "Waxing", price: 300, dur: 25, img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600" },
  { name: "Half Legs Waxing (Premium)", cat: "Women's Services", sub: "Waxing", price: 500, dur: 30, img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600" },
  { name: "Full Legs Waxing (Flavour)", cat: "Women's Services", sub: "Waxing", price: 400, dur: 35, img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600" },
  { name: "Full Legs Waxing (Premium)", cat: "Women's Services", sub: "Waxing", price: 700, dur: 40, img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600" },
  { name: "Stomach Waxing (Flavour)", cat: "Women's Services", sub: "Waxing", price: 300, dur: 25, img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600" },
  { name: "Stomach Waxing (Premium)", cat: "Women's Services", sub: "Waxing", price: 500, dur: 30, img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600" },
  { name: "Full Front Waxing (Flavour)", cat: "Women's Services", sub: "Waxing", price: 600, dur: 35, img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600" },
  { name: "Full Front Waxing (Premium)", cat: "Women's Services", sub: "Waxing", price: 900, dur: 40, img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600" },
  { name: "Full Back Waxing (Flavour)", cat: "Women's Services", sub: "Waxing", price: 600, dur: 35, img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600" },
  { name: "Full Back Waxing (Premium)", cat: "Women's Services", sub: "Waxing", price: 900, dur: 40, img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600" },
  { name: "Full Body Waxing (Flavour)", cat: "Women's Services", sub: "Waxing", price: 5200, dur: 90, img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600" },
  { name: "Full Body Waxing (Premium)", cat: "Women's Services", sub: "Waxing", price: 7000, dur: 100, img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600" },
  { name: "Bikini Waxing", cat: "Women's Services", sub: "Waxing", price: 2200, dur: 45, img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600" },

  // Manicure (Image 4)
  { name: "Herbal Manicure", cat: "Women's Services", sub: "Manicure", price: 300, dur: 30, img: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=600" },
  { name: "Spa Manicure", cat: "Women's Services", sub: "Manicure", price: 450, dur: 40, img: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=600" },
  { name: "Crystal Manicure", cat: "Women's Services", sub: "Manicure", price: 550, dur: 45, img: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=600" },
  { name: "D Tan Manicure", cat: "Women's Services", sub: "Manicure", price: 700, dur: 45, img: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=600" },

  // Pedicure (Image 4)
  { name: "Herbal Pedicure", cat: "Women's Services", sub: "Pedicure", price: 600, dur: 40, img: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=600" },
  { name: "Spa Pedicure", cat: "Women's Services", sub: "Pedicure", price: 550, dur: 45, img: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=600" },
  { name: "Crystal Pedicure", cat: "Women's Services", sub: "Pedicure", price: 650, dur: 50, img: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=600" },
  { name: "D Tan Manicure", cat: "Women's Services", sub: "Pedicure", price: 950, dur: 50, img: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=600" },

  // Nail Polish (Image 4)
  { name: "Nail Polish - Hands", cat: "Women's Services", sub: "Nail Polish", price: 80, dur: 15, img: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=600" },
  { name: "Nail Polish - Legs", cat: "Women's Services", sub: "Nail Polish", price: 130, dur: 15, img: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=600" },

  // Foot Massage (Image 4)
  { name: "Foot Massage (15 Mins)", cat: "Women's Services", sub: "Foot Massage", price: 250, dur: 15, img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600" },

  // Leg Massage (Image 4)
  { name: "Leg Massage (15 Mins)", cat: "Women's Services", sub: "Leg Massage", price: 500, dur: 15, img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600" },

  // De Tan Premium (Image 4)
  { name: "De Tan Premium - Half Arms", cat: "Women's Services", sub: "De Tan Premium", price: 950, dur: 30, img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600" },
  { name: "De Tan Premium - Full Arms", cat: "Women's Services", sub: "De Tan Premium", price: 1200, dur: 45, img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600" },
  { name: "De Tan Premium - Half Legs", cat: "Women's Services", sub: "De Tan Premium", price: 1150, dur: 40, img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600" },
  { name: "De Tan Premium - Full Legs", cat: "Women's Services", sub: "De Tan Premium", price: 1800, dur: 50, img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600" },
  { name: "De Tan Premium - Face", cat: "Women's Services", sub: "De Tan Premium", price: 800, dur: 30, img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600" },
  { name: "De Tan Premium - Front Neck", cat: "Women's Services", sub: "De Tan Premium", price: 600, dur: 20, img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600" },
  { name: "De Tan Premium - Back Neck", cat: "Women's Services", sub: "De Tan Premium", price: 600, dur: 20, img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600" },
  { name: "De Tan Premium - Full Body", cat: "Women's Services", sub: "De Tan Premium", price: 3000, dur: 90, img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600" },

  // Classic Facial (Image 4)
  { name: "Classic Facial - Fruit", cat: "Women's Services", sub: "Classic Facial", price: 1100, dur: 50, img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600" },
  { name: "Classic Facial - Papaya", cat: "Women's Services", sub: "Classic Facial", price: 1400, dur: 50, img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600" },
  { name: "Classic Facial - Herbal", cat: "Women's Services", sub: "Classic Facial", price: 1300, dur: 50, img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600" },
  { name: "Classic Facial - Silver", cat: "Women's Services", sub: "Classic Facial", price: 1600, dur: 60, img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600" },
  { name: "Classic Facial - Golden", cat: "Women's Services", sub: "Classic Facial", price: 1700, dur: 60, img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600" },
  { name: "Classic Facial - Diamond", cat: "Women's Services", sub: "Classic Facial", price: 2350, dur: 60, img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600" },
  { name: "Classic Facial - Platinum", cat: "Women's Services", sub: "Classic Facial", price: 2500, dur: 60, img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600" },


  // --- MEN'S SERVICES ---
  
  // Grooming (Image 1)
  { name: "Eye Brows", cat: "Men's Services", sub: "Grooming", price: 49, dur: 10, img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600" },
  { name: "Head Wash", cat: "Men's Services", sub: "Grooming", price: 49, dur: 15, img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600" },
  { name: "Shaving", cat: "Men's Services", sub: "Grooming", price: 79, dur: 20, img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600" },
  { name: "Trimming", cat: "Men's Services", sub: "Grooming", price: 79, dur: 20, img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600" },
  { name: "Stylish Beard", cat: "Men's Services", sub: "Grooming", price: 79, dur: 25, img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600" },
  { name: "Hair Cut", cat: "Men's Services", sub: "Grooming", price: 179, dur: 30, img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600" },
  { name: "Stylish Hair Cut", cat: "Men's Services", sub: "Grooming", price: 229, dur: 35, img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600", pop: true },
  { name: "Hair Straightening (Depends on Hair)", cat: "Men's Services", sub: "Grooming", price: 1999, dur: 90, img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600" },
  { name: "Keratin Hair Treatment", cat: "Men's Services", sub: "Grooming", price: 4999, dur: 120, img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600" },

  // Colours (Image 1)
  { name: "Beard Normal Colours", cat: "Men's Services", sub: "Colours", price: 79, dur: 20, img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600" },
  { name: "Basic Colours", cat: "Men's Services", sub: "Colours", price: 199, dur: 40, img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600" },
  { name: "Matrix Hair Colour", cat: "Men's Services", sub: "Colours", price: 349, dur: 45, img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600" },
  { name: "Loreal Hair Colour (Ammonia Free)", cat: "Men's Services", sub: "Colours", price: 449, dur: 45, img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600" },
  { name: "Innova Hair Colour (Ammonia Free)", cat: "Men's Services", sub: "Colours", price: 599, dur: 45, img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600" },
  { name: "Hair Colour Highlights Golden", cat: "Men's Services", sub: "Colours", price: 799, dur: 60, img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600" },

  // Special Groom Package (Image 1)
  { name: "Beard", cat: "Men's Services", sub: "Special Groom Package", price: 80, dur: 20, img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600" },
  { name: "Hair Cut", cat: "Men's Services", sub: "Special Groom Package", price: 179, dur: 30, img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600" },
  { name: "D-Tan", cat: "Men's Services", sub: "Special Groom Package", price: 499, dur: 30, img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600" },
  { name: "Hand D-Tan", cat: "Men's Services", sub: "Special Groom Package", price: 399, dur: 25, img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600" },
  { name: "Neck D-Tan", cat: "Men's Services", sub: "Special Groom Package", price: 199, dur: 20, img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600" },
  { name: "Goldern Facial", cat: "Men's Services", sub: "Special Groom Package", price: 1999, dur: 55, img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600" },
  { name: "Mani Cure", cat: "Men's Services", sub: "Special Groom Package", price: 249, dur: 30, img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600" },
  { name: "Normal Pedicure", cat: "Men's Services", sub: "Special Groom Package", price: 399, dur: 40, img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600" },
  { name: "Deluxe Pedicure", cat: "Men's Services", sub: "Special Groom Package", price: 699, dur: 45, img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600" },
  { name: "Hair Colour", cat: "Men's Services", sub: "Special Groom Package", price: 699, dur: 45, img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600" },
  { name: "Hair Spa", cat: "Men's Services", sub: "Special Groom Package", price: 999, dur: 45, img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600" },
  { name: "In Saloon", cat: "Men's Services", sub: "Special Groom Package", price: 5999, dur: 180, img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600", pop: true },
  { name: "Home Service", cat: "Men's Services", sub: "Special Groom Package", price: 6999, dur: 180, img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600" },

  // Beauty (Image 1)
  { name: "Face Scurb", cat: "Men's Services", sub: "Beauty", price: 199, dur: 15, img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600" },
  { name: "Face Scurb with Steam", cat: "Men's Services", sub: "Beauty", price: 269, dur: 20, img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600" },
  { name: "Face Tan Pak", cat: "Men's Services", sub: "Beauty", price: 499, dur: 25, img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600" },
  { name: "Neck D-Tan", cat: "Men's Services", sub: "Beauty", price: 199, dur: 20, img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600" },
  { name: "Clean Up Basic Facial", cat: "Men's Services", sub: "Beauty", price: 599, dur: 35, img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600" },
  { name: "Whitening Facial", cat: "Men's Services", sub: "Beauty", price: 999, dur: 45, img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600" },
  { name: "Fruit Facial", cat: "Men's Services", sub: "Beauty", price: 1099, dur: 45, img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600" },
  { name: "Diamond Facial", cat: "Men's Services", sub: "Beauty", price: 1999, dur: 55, img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600" },
  { name: "Gold Facial", cat: "Men's Services", sub: "Beauty", price: 1999, dur: 55, img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600" },
  { name: "Pearl Facial", cat: "Men's Services", sub: "Beauty", price: 1799, dur: 55, img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600" },
  { name: "Charcoal", cat: "Men's Services", sub: "Beauty", price: 1199, dur: 45, img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600" },

  // Spa (Image 1)
  { name: "Oil Head Massage", cat: "Men's Services", sub: "Spa", price: 99, dur: 15, img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600" },
  { name: "Oil Head Massage with Machine", cat: "Men's Services", sub: "Spa", price: 129, dur: 20, img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600" },
  { name: "Scalp Massage with Steam", cat: "Men's Services", sub: "Spa", price: 159, dur: 20, img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600" },
  { name: "Hair Spa", cat: "Men's Services", sub: "Spa", price: 899, dur: 40, img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600" },
  { name: "Hair Dandruff Treatment", cat: "Men's Services", sub: "Spa", price: 1099, dur: 45, img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600" },
  { name: "Full Body Massgae", cat: "Men's Services", sub: "Spa", price: 999, dur: 60, img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600" },
  { name: "Full Body Massgae (With Steam +300)", cat: "Men's Services", sub: "Spa", price: 1299, dur: 75, img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600" }
];

const defaultServices = rawServices.map((s, index) => ({
  _id: `service_${index + 1}`,
  name: s.name,
  category: s.cat,
  subcategory: s.sub,
  description: `Premium luxury styling for ${s.name} at VIVA Unisex Salon.`,
  price: s.price,
  duration: s.dur,
  imageUrl: s.img,
  rating: 4.8,
  reviewsCount: Math.floor(Math.random() * 100) + 15,
  isPopular: !!s.pop
}));

const defaultGallery = [
  {
    _id: "gallery_1",
    imageUrl: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600",
    category: "Hair Color",
    title: "Signature Gold Highlights",
    isBeforeAfter: true,
    beforeImageUrl: "https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?auto=format&fit=crop&q=80&w=600",
    afterImageUrl: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600"
  },
  {
    _id: "gallery_2",
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600",
    category: "Bridal",
    title: "Classic South Asian Bridal Look",
    isBeforeAfter: true,
    beforeImageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=600",
    afterImageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600"
  }
];

const defaultOffers = [
  {
    _id: "offer_1",
    title: "First Makeover Ritual",
    description: "Avail 20% off on your very first booking with us.",
    discountCode: "WELCOME20",
    discountPercentage: 20,
    expiryDate: "2027-12-31",
    bannerImageUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800"
  }
];

const defaultReviews = [
  {
    _id: "review_1",
    user: {
      name: "Olivia Sterling",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150"
    },
    rating: 5,
    comment: "The Gold Hydra Facial is pure magic. My skin has never glowed like this before. The matte black & gold interior smells like pure royalty!",
    serviceId: "service_1",
    createdAt: new Date().toISOString()
  }
];

const readMockDB = () => {
  if (!fs.existsSync(dbPath)) {
    const adminHash = bcrypt.hashSync("Vivasaloon@1234", 10);
    
    const initialData = {
      admins: [
        {
          _id: "admin_owner",
          fullName: "VIVA Owner",
          name: "VIVA Owner",
          email: "owner@vivasalon.com",
          password: adminHash,
          mobileNumber: "7799399955",
          phone: "7799399955",
          role: "owner",
          createdAt: new Date().toISOString()
        }
      ],
      services: defaultServices,
      appointments: [],
      stylists: defaultStylists,
      gallery: defaultGallery,
      offers: defaultOffers,
      reviews: defaultReviews,
      memberships: [
        {
          _id: "member_1",
          customerName: "Diana Prince",
          phone: "9876543210",
          membershipType: "Silver",
          price: 2999,
          startDate: new Date().toISOString(),
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          discount: 10,
          status: "Active",
          createdAt: new Date().toISOString()
        }
      ],
      bills: []
    };
    fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
  
  try {
    const raw = fs.readFileSync(dbPath, 'utf-8');
    const db = JSON.parse(raw);

    // Sync admin 7799399955 credentials in mock_db.json
    if (!db.admins) db.admins = [];
    const targetAdminIndex = db.admins.findIndex(a => a.mobileNumber === "7799399955" || a.phone === "7799399955");
    const adminHash = bcrypt.hashSync("Vivasaloon@1234", 10);
    const targetAdmin = {
      _id: "admin_owner",
      fullName: "VIVA Owner",
      name: "VIVA Owner",
      email: "owner@vivasalon.com",
      password: adminHash,
      mobileNumber: "7799399955",
      phone: "7799399955",
      role: "owner",
      createdAt: new Date().toISOString()
    };
    if (targetAdminIndex === -1) {
      console.log("Seeding admin 7799399955 in mock_db.json...");
      db.admins.push(targetAdmin);
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
    } else {
      const current = db.admins[targetAdminIndex];
      if (current.role !== "owner" || !bcrypt.compareSync("Vivasaloon@1234", current.password)) {
        console.log("Updating admin 7799399955 credentials in mock_db.json...");
        db.admins[targetAdminIndex] = { ...current, ...targetAdmin };
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
      }
    }
    
    // Safety check: if DB services array contains the old balancing treatments, or doesn't match current length/names, overwrite it completely
    const hasOldServices = !db.services || 
      db.services.length !== defaultServices.length ||
      db.services.some(s => s.name === "Golden Facial" || s.name === "Face Scrub" || s.name === "Full Body Massage");
    
    if (hasOldServices || !db.bills || !db.memberships) {
      console.log("Upgrading mock_db.json to the new VIVA Unisex Salon POS and services database schema...");
      db.services = defaultServices;
      db.stylists = defaultStylists;
      if (!db.memberships) {
        db.memberships = [
          {
            _id: "member_1",
            customerName: "Diana Prince",
            phone: "9876543210",
            membershipType: "Silver",
            price: 2999,
            startDate: new Date().toISOString(),
            expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            discount: 10,
            status: "Active",
            createdAt: new Date().toISOString()
          }
        ];
      }
      if (!db.bills) db.bills = [];
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
    }
    
    return db;
  } catch (err) {
    console.error("Error reading Mock DB, resetting...", err);
    return {};
  }
};


const writeMockDB = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
};

module.exports = {
  readMockDB,
  writeMockDB,
  defaultServices,
  defaultStylists
};
