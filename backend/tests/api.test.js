const request = require('supertest');
const app = require('../server');
const { prisma } = require('../config/db');

let adminToken = '';
let testAppointmentId = '';
let testMembershipId = '';

jest.setTimeout(30000);

describe('VIVA Unisex Salon REST APIs Integration Tests', () => {
  
  beforeAll(async () => {
    // Connect to database and ensure test admin is seeded
    await prisma.$connect();
    
    // Cleanup any existing test artifacts to ensure clean test runs
    await prisma.appointment.deleteMany({ where: { customerName: 'Test Suite Customer' } });
    await prisma.bill.deleteMany({ where: { customerName: 'Test Suite Customer' } });
    await prisma.membership.deleteMany({ where: { customerName: 'Test Suite Customer' } });
    await prisma.customer.deleteMany({ where: { mobileNumber: '9900990099' } });
  });

  afterAll(async () => {
    // Clean up test records
    await prisma.appointment.deleteMany({ where: { customerName: 'Test Suite Customer' } });
    await prisma.bill.deleteMany({ where: { customerName: 'Test Suite Customer' } });
    await prisma.membership.deleteMany({ where: { customerName: 'Test Suite Customer' } });
    await prisma.customer.deleteMany({ where: { mobileNumber: '9900990099' } });
    await prisma.$disconnect();
  });

  describe('Authentication Endpoints', () => {
    it('should fail admin login with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/admin-login')
        .send({
          mobileNumber: '7799399955',
          password: 'wrongpassword'
        });
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should login successfully as owner admin', async () => {
      const res = await request(app)
        .post('/api/auth/admin-login')
        .send({
          mobileNumber: '7799399955',
          password: 'Vivasaloon@1234'
        });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('token');
      adminToken = res.body.token;
    });

    it('should fetch admin profile when authenticated', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.mobileNumber).toBe('7799399955');
    });
  });

  describe('Appointment System Endpoints', () => {
    it('should check slot availability', async () => {
      const res = await request(app)
        .get('/api/appointments/slots')
        .query({ date: '2026-12-02' });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.slots.length).toBeGreaterThan(0);
    });

    it('should successfully book a new appointment', async () => {
      const res = await request(app)
        .post('/api/appointments')
        .send({
          customerName: 'Test Suite Customer',
          mobileNumber: '9900990099',
          service: 'Advance Gold Facial',
          staffMember: 'Fardeen',
          appointmentDate: '2026-12-02',
          appointmentTime: '11:00 AM',
          notes: 'Test note'
        });
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.appointment).toHaveProperty('_id');
      testAppointmentId = res.body.appointment._id;
    });

    it('should reject a duplicate appointment for the same timeslot', async () => {
      const res = await request(app)
        .post('/api/appointments')
        .send({
          customerName: 'Test Suite Customer',
          mobileNumber: '9900990099',
          service: 'Advance Gold Facial',
          staffMember: 'Hussain',
          appointmentDate: '2026-12-02',
          appointmentTime: '11:00 AM'
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should list all appointments for admin', async () => {
      const res = await request(app)
        .get('/api/appointments/admin-bookings')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.appointments.length).toBeGreaterThan(0);
    });
  });

  describe('Billing and Invoice System', () => {
    it('should verify customer membership returns None if not registered', async () => {
      const res = await request(app)
        .get('/api/billing/verify/9900990099')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.hasMembership).toBe(false);
    });

    it('should create a POS bill checkout successfully', async () => {
      const res = await request(app)
        .post('/api/billing')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerName: 'Test Suite Customer',
          mobileNumber: '9900990099',
          staffMember: 'Fardeen',
          services: [
            { name: 'Advance Gold Facial', price: 2500 }
          ],
          addGst: true,
          manualDiscountType: 'percent',
          manualDiscountValue: 10
        });
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.bill.grandTotal).toBe(2655); // (2500 - 250) * 1.18 = 2250 * 1.18 = 2655
    });
  });

  describe('Memberships System', () => {
    it('should register a new membership successfully', async () => {
      const res = await request(app)
        .post('/api/memberships/purchase')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerName: 'Test Suite Customer',
          phone: '9900990099',
          membershipType: 'Platinum',
          email: 'testsuite@viva.com'
        });
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.membership.membershipType).toBe('Platinum');
      testMembershipId = res.body.membership._id;
    });

    it('should retrieve all memberships', async () => {
      const res = await request(app)
        .get('/api/memberships/admin/all')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.memberships.length).toBeGreaterThan(0);
    });
  });

  describe('Analytics Dashboard', () => {
    it('should get admin dashboard analytics data', async () => {
      const res = await request(app)
        .get('/api/analytics')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.stats).toHaveProperty('totalRevenue');
      expect(res.body.stats).toHaveProperty('totalCustomers');
    });
  });
});
