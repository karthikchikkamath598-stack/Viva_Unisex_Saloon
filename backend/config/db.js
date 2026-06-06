const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let isMock = false;
let mongoServer = null;

const seedDatabase = async () => {
  try {
    const { readMockDB } = require('./mockDb');
    const mockData = readMockDB();

    // Helper: strip _id fields that are not valid ObjectIds so MongoDB generates them
    const stripIds = (arr) => (arr || []).map(({ _id, ...rest }) => rest);

    // 1. Seed Services
    const Service = require('../models/Service');
    const serviceCount = await Service.countDocuments();
    if (serviceCount === 0 && mockData.services && mockData.services.length > 0) {
      console.log('Seeding default services in MongoDB...');
      await Service.insertMany(stripIds(mockData.services));
    }

    // 2. Seed Stylists
    const Stylist = require('../models/Stylist');
    const stylistCount = await Stylist.countDocuments();
    if (stylistCount === 0 && mockData.stylists && mockData.stylists.length > 0) {
      console.log('Seeding default stylists in MongoDB...');
      await Stylist.insertMany(stripIds(mockData.stylists));
    }

    // 3. Seed Gallery
    const Gallery = require('../models/Gallery');
    const galleryCount = await Gallery.countDocuments();
    if (galleryCount === 0 && mockData.gallery && mockData.gallery.length > 0) {
      console.log('Seeding default gallery items in MongoDB...');
      await Gallery.insertMany(stripIds(mockData.gallery));
    }

    // 4. Seed Offers
    const Offer = require('../models/Offer');
    const offerCount = await Offer.countDocuments();
    if (offerCount === 0 && mockData.offers && mockData.offers.length > 0) {
      console.log('Seeding default offers in MongoDB...');
      await Offer.insertMany(stripIds(mockData.offers));
    }

    // 5. Seed Reviews
    const Review = require('../models/Review');
    const reviewCount = await Review.countDocuments();
    if (reviewCount === 0 && mockData.reviews && mockData.reviews.length > 0) {
      console.log('Seeding default reviews in MongoDB...');
      await Review.insertMany(stripIds(mockData.reviews));
    }

    // 6. Seed Users (insertMany bypasses save hooks — mock users already have hashed passwords)
    const User = require('../models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0 && mockData.users && mockData.users.length > 0) {
      console.log('Seeding default users in MongoDB...');
      await User.insertMany(stripIds(mockData.users));
    }

    // 7. Seed Appointments (skip — existing mock appointments reference non-ObjectId service IDs)
    // Appointments are created fresh through the booking flow, so no seeding needed.

    console.log('Database seeding checked and completed.');
  } catch (err) {
    console.error('Failed to seed database:', err.message);
  }
};


const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://localhost:27017/viva-salon';
    console.log(`Connecting to MongoDB: ${connStr}...`);
    
    // Set a fast connection timeout of 3 seconds to fail over to Memory DB quickly if MongoDB isn't running
    await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 3000
    });
    
    console.log('MongoDB connected successfully.');
    isMock = false;

    // Seed the database
    await seedDatabase();
  } catch (error) {
    console.warn('\n================================================================');
    console.warn('WARNING: Local MongoDB connection failed!');
    console.warn('Error:', error.message);
    console.warn('Attempting to spin up in-memory MongoDB server...');
    
    try {
      mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      console.log(`In-memory MongoDB started. Connecting to: ${mongoUri}`);
      
      await mongoose.connect(mongoUri);
      console.log('MongoDB connected successfully (In-Memory).');
      isMock = false;

      // Seed the in-memory database
      await seedDatabase();
      console.warn('================================================================\n');
    } catch (memError) {
      console.warn('In-memory MongoDB startup failed:', memError.message);
      console.warn('FALLING BACK TO LOCAL MOCK DB (mock_db.json)');
      console.warn('The application will still be fully operational.');
      console.warn('================================================================\n');
      isMock = true;
    }
  }
};

const getIsMock = () => isMock;

module.exports = { connectDB, getIsMock };

