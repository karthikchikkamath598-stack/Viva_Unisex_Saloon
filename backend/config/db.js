const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('PostgreSQL database connected successfully via Prisma.');
  } catch (error) {
    console.error('Failed to connect to PostgreSQL database:', error.message);
    process.exit(1);
  }
};

const getIsMock = () => false;

module.exports = { prisma, connectDB, getIsMock };
