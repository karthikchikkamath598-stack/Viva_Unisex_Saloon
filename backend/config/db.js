const mongoose = require('mongoose');

let isMock = false;

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://localhost:27017/viva-salon';
    console.log(`Connecting to MongoDB: ${connStr}...`);
    
    // Set a fast connection timeout of 3 seconds to fail over to Mock DB quickly if MongoDB isn't running
    await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 3000
    });
    
    console.log('MongoDB connected successfully.');
    isMock = false;
  } catch (error) {
    console.warn('\n================================================================');
    console.warn('WARNING: MongoDB connection failed!');
    console.warn('Error:', error.message);
    console.warn('FALLING BACK TO LOCAL MOCK DB (mock_db.json)');
    console.warn('The application will still be fully operational.');
    console.warn('================================================================\n');
    isMock = true;
  }
};

const getIsMock = () => isMock;

module.exports = { connectDB, getIsMock };
