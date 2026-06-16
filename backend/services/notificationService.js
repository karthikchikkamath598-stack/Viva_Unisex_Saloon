const nodemailer = require('nodemailer');
const https = require('https');
const { prisma } = require('../config/db');

// ─── HARDCODED OWNER CONTACT ────────────────────────────────────────────────
// Owner's WhatsApp number (with India country code)
const OWNER_WHATSAPP = '+917799399955';
const OWNER_EMAIL = process.env.OWNER_EMAIL || 'owner@vivasalon.com';
// ────────────────────────────────────────────────────────────────────────────

// Log every notification to the DB for audit/admin view
const logNotification = async (recipient, type, subject, message, status = 'Sent') => {
  try {
    let customerId = null;
    let cleanMobile = recipient.replace(/\D/g, '');
    if (cleanMobile.startsWith('91') && cleanMobile.length === 12) {
      cleanMobile = cleanMobile.slice(2);
    }
    
    if (cleanMobile.length === 10) {
      const customer = await prisma.customer.findUnique({
        where: { mobileNumber: cleanMobile }
      });
      if (customer) {
        customerId = customer.id;
      }
    }

    await prisma.notification.create({
      data: {
        recipient,
        type,
        subject,
        message,
        status,
        customerId
      }
    });
  } catch (err) {
    console.error('Failed to log notification:', err.message);
  }
};

// ─── EMAIL TRANSPORTER ───────────────────────────────────────────────────────
const getTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.mailtrap.io';
  const port = process.env.SMTP_PORT || 2525;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (user && pass) {
    return nodemailer.createTransport({ host, port, auth: { user, pass } });
  }

  // Console-logging fallback when SMTP is not configured
  return {
    sendMail: async (opts) => {
      console.log('\n─────────────────────────────────────────');
      console.log('[📧 MOCK EMAIL]');
      console.log(`To      : ${opts.to}`);
      console.log(`Subject : ${opts.subject}`);
      console.log(`Body    :\n${opts.text}`);
      console.log('─────────────────────────────────────────\n');
      return { messageId: 'mock_email_' + Date.now() };
    }
  };
};

// ─── WHATSAPP SENDER ─────────────────────────────────────────────────────────
const sendWhatsApp = async (to, message) => {
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER || 'whatsapp:+14155238886';

  if (twilioSid && twilioAuthToken) {
    try {
      const basicAuth = Buffer.from(`${twilioSid}:${twilioAuthToken}`).toString('base64');
      const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
      const formattedFrom = twilioFrom.startsWith('whatsapp:') ? twilioFrom : `whatsapp:${twilioFrom}`;

      const params = new URLSearchParams();
      params.append('To', formattedTo);
      params.append('From', formattedFrom);
      params.append('Body', message);

      const postData = params.toString();

      const options = {
        hostname: 'api.twilio.com',
        path: `/2010-04-01/Accounts/${twilioSid}/Messages.json`,
        method: 'POST',
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      await new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
          let body = '';
          res.on('data', c => body += c);
          res.on('end', () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              console.log(`[✅ Twilio WhatsApp Sent] Success → ${to}`);
              resolve(true);
            } else {
              console.error('[❌ Twilio WhatsApp Error]', body);
              reject(new Error(`Twilio HTTP ${res.statusCode}`));
            }
          });
        });

        req.on('error', (err) => {
          console.error('[❌ Twilio WhatsApp Network Error]', err);
          reject(err);
        });

        req.write(postData);
        req.end();
      });
      return { sid: 'twilio_wa_' + Date.now() };
    } catch (err) {
      console.error(`[❌ Twilio WhatsApp Error] ${to} : ${err.message}`);
    }
  }

  // Console-logging fallback when Twilio is not configured
  console.log('\n─────────────────────────────────────────');
  console.log('[📱 MOCK WHATSAPP]');
  console.log(`To      : ${to}`);
  console.log(`Message :\n${message}`);
  console.log('─────────────────────────────────────────\n');
  return { sid: 'mock_wa_' + Date.now() };
};

// ─── HELPER: Format appointment date for display ──────────────────────────────
const formatDate = (dateStr) => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 1. BOOKING CREATED — Sent immediately when customer books
// ═══════════════════════════════════════════════════════════════════════════════
exports.sendBookingCreated = async (appointment, ownerSettings) => {
  const servicesList = appointment.selectedServices.map(s => `  • ${s.serviceName} — ₹${s.price}`).join('\n');
  const formattedDate = formatDate(appointment.appointmentDate);
  const staffName = appointment.preferredStaffMember || 'Any Available';
  const totalAmount = appointment.totalAmount || 0;

  // ── Customer WhatsApp ────────────────────────────────────────────────────
  const customerWA = `✨ *VIVA Unisex Salon*
━━━━━━━━━━━━━━━━━━━━━━━━
🎉 *Booking Confirmed!*

Hello ${appointment.customerName}, your appointment has been successfully received.

📅 *Date:* ${formattedDate}
⏰ *Time:* ${appointment.appointmentTime}
💇 *Stylist:* ${staffName}

🛎️ *Services Booked:*
${servicesList}

💰 *Total Amount:* ₹${totalAmount}

📍 *Salon Address:*
VIVA Unisex Salon, Bhongir, Telangana

📞 For any changes, call us at +91 7799399955

Thank you for choosing *VIVA* — Your luxury is our craft! 💛
━━━━━━━━━━━━━━━━━━━━━━━━`;

  await sendWhatsApp(appointment.phone, customerWA);
  await logNotification(appointment.phone, 'whatsapp', 'Booking Confirmed', customerWA);

  // ── Customer Email ────────────────────────────────────────────────────────
  const customerEmail = `Hello ${appointment.customerName},

Your appointment at VIVA Unisex Salon has been received!

───────────────────────────
BOOKING DETAILS
───────────────────────────
Date        : ${formattedDate}
Time        : ${appointment.appointmentTime}
Stylist     : ${staffName}

Services Booked:
${servicesList}

Total Amount: ₹${totalAmount}

───────────────────────────
SALON ADDRESS
───────────────────────────
VIVA Unisex Salon
Bhongir, Telangana

Contact: +91 7799399955
───────────────────────────

You will receive a reminder 1 hour before your appointment.

Thank you for choosing VIVA Unisex Salon!
With love, Team VIVA 💛`;

  const transporter = getTransporter();
  if (appointment.email) {
    try {
      await transporter.sendMail({
        from: '"VIVA Unisex Salon" <bookings@vivasalon.com>',
        to: appointment.email,
        subject: `✅ Booking Confirmed — ${appointment.appointmentDate} at ${appointment.appointmentTime}`,
        text: customerEmail
      });
      await logNotification(appointment.email, 'email', 'Booking Confirmed', customerEmail);
    } catch (err) {
      console.error('[Email Dispatch Error]', err.message);
    }
  }

  // ── Owner WhatsApp Alert ──────────────────────────────────────────────────
  const ownerWA = `🔔 *VIVA — New Booking Alert!*
  ━━━━━━━━━━━━━━━━━━━━━━━━
  👤 *Customer:* ${appointment.customerName}
  📞 *Phone:* ${appointment.phone}
  📧 *Email:* ${appointment.email}
  
  📅 *Date:* ${formattedDate}
  ⏰ *Time:* ${appointment.appointmentTime}
  💇 *Preferred Stylist:* ${staffName}
  
  🛎️ *Services:*
  ${servicesList}
  
  💰 *Total:* ₹${totalAmount}
  📝 *Notes:* ${appointment.notes || 'None'}
  ━━━━━━━━━━━━━━━━━━━━━━━━`;

  await sendWhatsApp(OWNER_WHATSAPP, ownerWA);
  await logNotification(OWNER_WHATSAPP, 'whatsapp', 'New Booking Alert', ownerWA);

  // ── Owner Email Alert ─────────────────────────────────────────────────────
  const ownerEmail = `New Appointment Booking — VIVA Unisex Salon

  ───────────────────────────
  CUSTOMER DETAILS
  ───────────────────────────
  Name    : ${appointment.customerName}
  Phone   : ${appointment.phone}
  Email   : ${appointment.email}
  
  ───────────────────────────
  BOOKING DETAILS
  ───────────────────────────
  Date    : ${formattedDate}
  Time    : ${appointment.appointmentTime}
  Stylist : ${staffName}
  
  Services Booked:
  ${servicesList}
  
  Total Amount : ₹${totalAmount}
  Notes        : ${appointment.notes || 'None'}
  ───────────────────────────`;

  const ownerEmailAddr = (ownerSettings && ownerSettings.ownerEmail) || OWNER_EMAIL;
  try {
    await transporter.sendMail({
      from: '"VIVA Bookings Engine" <engine@vivasalon.com>',
      to: ownerEmailAddr,
      subject: `🔔 New Booking — ${appointment.customerName} on ${appointment.appointmentDate}`,
      text: ownerEmail
    });
    await logNotification(ownerEmailAddr, 'email', `New Booking Alert — ${appointment.customerName}`, ownerEmail);
  } catch (err) {
    console.error('[Owner Email Alert Dispatch Error]', err.message);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 2. BOOKING CONFIRMED (Admin approves) — Sent when status changes to Confirmed
// ═══════════════════════════════════════════════════════════════════════════════
exports.sendBookingConfirmed = async (appointment, ownerSettings) => {
  const servicesList = appointment.selectedServices.map(s => `  • ${s.serviceName}`).join('\n');
  const formattedDate = formatDate(appointment.appointmentDate);
  const staffName = appointment.preferredStaffMember || 'Any Available';

  // ── Customer WhatsApp ────────────────────────────────────────────────────
  const customerWA = `✨ *VIVA Unisex Salon*
━━━━━━━━━━━━━━━━━━━━━━━━
✅ *Appointment Confirmed!*

Hello ${appointment.customerName}, your appointment has been officially confirmed by our team.

📅 *Date:* ${formattedDate}
⏰ *Time:* ${appointment.appointmentTime}
💇 *Stylist:* ${staffName}

🛎️ *Services:*
${servicesList}

📍 VIVA Unisex Salon, Bhongir, Telangana
📞 +91 7799399955

⏰ Please arrive 5–10 minutes early.
We look forward to seeing you! 💛
━━━━━━━━━━━━━━━━━━━━━━━━`;

  await sendWhatsApp(appointment.phone, customerWA);
  await logNotification(appointment.phone, 'whatsapp', 'Appointment Confirmed', customerWA);

  // ── Customer Email ────────────────────────────────────────────────────────
  const customerEmailText = `Hello ${appointment.customerName},

Great news — your appointment at VIVA Unisex Salon has been confirmed!

Date    : ${formattedDate}
Time    : ${appointment.appointmentTime}
Stylist : ${staffName}

Services:
${servicesList}

Please arrive 5–10 minutes before your scheduled time.

We look forward to welcoming you!
Team VIVA 💛`;

  if (appointment.email) {
    const transporter = getTransporter();
    try {
      await transporter.sendMail({
        from: '"VIVA Unisex Salon" <bookings@vivasalon.com>',
        to: appointment.email,
        subject: `✅ Appointment Confirmed — ${appointment.appointmentDate} at ${appointment.appointmentTime}`,
        text: customerEmailText
      });
      await logNotification(appointment.email, 'email', 'Appointment Confirmed', customerEmailText);
    } catch (err) {
      console.error('[Email Dispatch Error]', err.message);
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 3. BOOKING CANCELLED — Sent when appointment is cancelled
// ═══════════════════════════════════════════════════════════════════════════════
exports.sendBookingCancelled = async (appointment, ownerSettings) => {
  const servicesList = appointment.selectedServices.map(s => `  • ${s.serviceName}`).join('\n');
  const formattedDate = formatDate(appointment.appointmentDate);

  // ── Customer WhatsApp ────────────────────────────────────────────────────
  const customerWA = `✨ *VIVA Unisex Salon*
━━━━━━━━━━━━━━━━━━━━━━━━
❌ *Appointment Cancelled*

Hello ${appointment.customerName},
Your appointment has been cancelled.

📅 *Date:* ${formattedDate}
⏰ *Time:* ${appointment.appointmentTime}

🛎️ *Services:*
${servicesList}

To reschedule, please contact us:
📞 +91 7799399955
━━━━━━━━━━━━━━━━━━━━━━━━`;

  await sendWhatsApp(appointment.phone, customerWA);
  await logNotification(appointment.phone, 'whatsapp', 'Appointment Cancelled', customerWA);

  // ── Customer Email ────────────────────────────────────────────────────────
  const customerEmailText = `Hello ${appointment.customerName},

Your appointment at VIVA Unisex Salon has been cancelled.

Date    : ${formattedDate}
Time    : ${appointment.appointmentTime}

Services:
${servicesList}

To reschedule, please contact us at +91 7799399955 or visit our website.

We hope to serve you soon.
Team VIVA`;

  const transporter = getTransporter();
  if (appointment.email) {
    try {
      await transporter.sendMail({
        from: '"VIVA Unisex Salon" <bookings@vivasalon.com>',
        to: appointment.email,
        subject: `❌ Appointment Cancelled — ${appointment.appointmentDate}`,
        text: customerEmailText
      });
      await logNotification(appointment.email, 'email', 'Appointment Cancelled', customerEmailText);
    } catch (err) {
      console.error('[Email Dispatch Error]', err.message);
    }
  }

  // ── Owner WhatsApp Alert ──────────────────────────────────────────────────
  const ownerWA = `⚠️ *VIVA — Booking Cancelled*
━━━━━━━━━━━━━━━━━━━━━━━━
👤 *Customer:* ${appointment.customerName}
📞 *Phone:* ${appointment.phone}
📅 *Date:* ${formattedDate}
⏰ *Time:* ${appointment.appointmentTime}

🛎️ *Services:*
${servicesList}
━━━━━━━━━━━━━━━━━━━━━━━━`;

  await sendWhatsApp(OWNER_WHATSAPP, ownerWA);
  await logNotification(OWNER_WHATSAPP, 'whatsapp', 'Booking Cancelled Alert', ownerWA);

  // ── Owner Email ───────────────────────────────────────────────────────────
  const ownerEmailText = `Appointment Cancellation Alert — VIVA Unisex Salon

Customer : ${appointment.customerName}
Phone    : ${appointment.phone}
Email    : ${appointment.email}
Date     : ${formattedDate}
Time     : ${appointment.appointmentTime}

Services:
${servicesList}`;

  const ownerEmailAddr = (ownerSettings && ownerSettings.ownerEmail) || OWNER_EMAIL;
  try {
    await transporter.sendMail({
      from: '"VIVA Bookings Engine" <engine@vivasalon.com>',
      to: ownerEmailAddr,
      subject: `⚠️ Booking Cancelled — ${appointment.customerName} on ${appointment.appointmentDate}`,
      text: ownerEmailText
    });
    await logNotification(ownerEmailAddr, 'email', `Booking Cancelled — ${appointment.customerName}`, ownerEmailText);
  } catch (err) {
    console.error('[Owner Cancellation Email Dispatch Error]', err.message);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 4. 1-HOUR REMINDER — Sent automatically by the cron scheduler
// ═══════════════════════════════════════════════════════════════════════════════
exports.sendBookingReminder = async (appointment) => {
  const formattedDate = formatDate(appointment.appointmentDate);
  const staffName = appointment.preferredStaffMember || 'Your stylist';
  const servicesList = appointment.selectedServices
    ? appointment.selectedServices.map(s => `  • ${s.serviceName}`).join('\n')
    : '';

  // ── Customer WhatsApp Reminder ────────────────────────────────────────────
  const customerWA = `⏰ *VIVA Unisex Salon — 1 Hour Reminder!*
━━━━━━━━━━━━━━━━━━━━━━━━
Hello ${appointment.customerName}! 👋

Your appointment at VIVA Unisex Salon is *starting in 1 hour!*

📅 *Date:* ${formattedDate}
⏰ *Time:* ${appointment.appointmentTime}
💇 *Stylist:* ${staffName}
${servicesList ? `\n🛎️ *Services:*\n${servicesList}` : ''}

📍 *Salon:* VIVA Unisex Salon, Bhongir, Telangana
📞 *Contact:* +91 7799399955

Please arrive 5–10 minutes early. We're excited to see you! ✨
━━━━━━━━━━━━━━━━━━━━━━━━`;

  await sendWhatsApp(appointment.phone, customerWA);
  await logNotification(appointment.phone, 'whatsapp', '1-Hour Appointment Reminder', customerWA);

  // ── Customer Email Reminder ───────────────────────────────────────────────
  const customerEmailText = `Hello ${appointment.customerName},

This is your 1-hour reminder for your upcoming appointment at VIVA Unisex Salon!

Date    : ${formattedDate}
Time    : ${appointment.appointmentTime}
Stylist : ${staffName}
${servicesList ? `\nServices:\n${servicesList}` : ''}

Address : VIVA Unisex Salon, Bhongir, Telangana
Contact : +91 7799399955

Please plan to arrive 5–10 minutes before your appointment.

See you soon! 💛
Team VIVA`;

  if (appointment.email) {
    const transporter = getTransporter();
    try {
      await transporter.sendMail({
        from: '"VIVA Unisex Salon" <bookings@vivasalon.com>',
        to: appointment.email,
        subject: `⏰ 1-Hour Reminder — Your VIVA Appointment at ${appointment.appointmentTime}`,
        text: customerEmailText
      });
      await logNotification(appointment.email, 'email', '1-Hour Appointment Reminder', customerEmailText);
    } catch (err) {
      console.error('[Email Dispatch Error]', err.message);
    }
  }

  // ── Owner WhatsApp Reminder Alert ─────────────────────────────────────────
  const ownerWA = `⏰ *VIVA — Upcoming Appointment in 1 Hour*
━━━━━━━━━━━━━━━━━━━━━━━━
👤 *Customer:* ${appointment.customerName}
📞 *Phone:* ${appointment.phone}
📅 *Date:* ${formattedDate}
⏰ *Time:* ${appointment.appointmentTime}
💇 *Stylist:* ${staffName}
${servicesList ? `\n🛎️ *Services:*\n${servicesList}` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━`;

  await sendWhatsApp(OWNER_WHATSAPP, ownerWA);
  await logNotification(OWNER_WHATSAPP, 'whatsapp', '1-Hour Upcoming Appointment Alert', ownerWA);
};

// Export sendWhatsApp so it can be used by other services (e.g. otpService)
exports.sendWhatsApp = sendWhatsApp;
