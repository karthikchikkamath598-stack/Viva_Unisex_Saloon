const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { defaultServices, defaultStylists } = require('../config/mockDb');

const prisma = new PrismaClient();

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

const defaultGallery = [
  {
    id: "gallery_1",
    imageUrl: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600",
    category: "Hair Color",
    title: "Signature Gold Highlights",
    isBeforeAfter: true,
    beforeImageUrl: "https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?auto=format&fit=crop&q=80&w=600",
    afterImageUrl: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "gallery_2",
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
    id: "offer_1",
    title: "First Makeover Ritual",
    description: "Avail 20% off on your very first booking with us.",
    discountCode: "WELCOME20",
    discountPercentage: 20,
    expiryDate: "2027-12-31",
    bannerImageUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800"
  }
];

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Seed Admin
  const adminCount = await prisma.admin.count();
  if (adminCount === 0) {
    console.log('Seeding default administrator...');
    const hashedPassword = await bcrypt.hash("Vivasaloon@1234", 10);
    await prisma.admin.create({
      data: {
        id: "admin_owner",
        fullName: "VIVA Owner",
        mobileNumber: "7799399955",
        password: hashedPassword,
        role: "owner"
      }
    });
  }

  // 2. Seed Settings
  const settingsCount = await prisma.settings.count();
  if (settingsCount === 0) {
    console.log('Seeding default settings...');
    await prisma.settings.create({
      data: defaultSettings
    });
  }

  // 3. Seed Stylists
  const stylistCount = await prisma.stylist.count();
  if (stylistCount === 0) {
    console.log('Seeding default stylists...');
    for (const stylist of defaultStylists) {
      await prisma.stylist.create({
        data: {
          id: stylist._id,
          name: stylist.name,
          specialty: stylist.specialty,
          rating: stylist.rating,
          imageUrl: stylist.imageUrl,
          skills: stylist.skills,
          availableDays: stylist.availability.days,
          availableSlots: stylist.availability.slots,
          status: "Active"
        }
      });
    }
  }

  // 4. Seed Services
  const serviceCount = await prisma.service.count();
  if (serviceCount === 0) {
    console.log(`Seeding ${defaultServices.length} services...`);
    // Seed in chunks to avoid single large query failures
    const chunkSize = 50;
    for (let i = 0; i < defaultServices.length; i += chunkSize) {
      const chunk = defaultServices.slice(i, i + chunkSize);
      await prisma.service.createMany({
        data: chunk.map(s => ({
          id: s._id,
          name: s.name,
          category: s.category,
          subcategory: s.subcategory,
          description: s.description,
          price: Number(s.price),
          duration: Number(s.duration),
          imageUrl: s.imageUrl,
          rating: Number(s.rating),
          reviewsCount: Number(s.reviewsCount),
          isPopular: !!s.isPopular
        })),
        skipDuplicates: true
      });
    }
  }

  // 5. Seed Gallery
  const galleryCount = await prisma.gallery.count();
  if (galleryCount === 0) {
    console.log('Seeding default gallery items...');
    for (const item of defaultGallery) {
      await prisma.gallery.create({
        data: item
      });
    }
  }

  // 6. Seed Offers
  const offerCount = await prisma.offer.count();
  if (offerCount === 0) {
    console.log('Seeding default offers...');
    for (const offer of defaultOffers) {
      await prisma.offer.create({
        data: offer
      });
    }
  }

  // 7. Seed default reviews & customers
  const customerCount = await prisma.customer.count();
  if (customerCount === 0) {
    console.log('Seeding default customer & review...');
    // Create customer first
    const customer = await prisma.customer.create({
      data: {
        id: "cust_9876543210",
        fullName: "Diana Prince",
        mobileNumber: "9876543210",
        email: "diana@justiceleague.com"
      }
    });

    // Create silver membership
    await prisma.membership.create({
      data: {
        id: "member_1",
        customerId: customer.id,
        customerName: customer.fullName,
        email: customer.email,
        phone: customer.mobileNumber,
        membershipType: "Silver",
        price: 2999,
        startDate: new Date(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        discount: 10,
        status: "Active"
      }
    });

    // Seed default review linked to customer and service_1
    const defaultReview = {
      id: "review_1",
      userName: "Olivia Sterling",
      userAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150",
      rating: 5,
      comment: "The Gold Hydra Facial is pure magic. My skin has never glowed like this before. The matte black & gold interior smells like pure royalty!",
      serviceId: "service_1" // linked to first service
    };

    const hasService1 = await prisma.service.findUnique({ where: { id: "service_1" } });
    if (hasService1) {
      await prisma.review.create({
        data: {
          ...defaultReview,
          customerId: customer.id
        }
      });
    }
  }

  console.log('✅ Database seeding complete.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
