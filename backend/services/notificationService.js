const nodemailer = require('nodemailer');

// Helper to get SMTP transporter
const getTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.mailtrap.io';
  const port = process.env.SMTP_PORT || 2525;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      auth: { user, pass }
    });
  }
  // Console logging transport fallback
  return {
    sendMail: async (mailOptions) => {
      console.log('\n--- [MOCK EMAIL DISPATCH] ---');
      console.log(`To: ${mailOptions.to}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log(`Body:\n${mailOptions.text}`);
      console.log('-----------------------------\n');
      return { messageId: 'mock_msg_' + Date.now() };
    }
  };
};

// Helper to send WhatsApp
const sendWhatsApp = async (to, message) => {
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER || 'whatsapp:+14155238886'; // Twilio sandbox number

  if (twilioSid && twilioAuthToken) {
    try {
      const twilio = require('twilio');
      const client = twilio(twilioSid, twilioAuthToken);
      const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
      const res = await client.messages.create({
        from: twilioFrom,
        to: formattedTo,
        body: message
      });
      console.log(`[Twilio WhatsApp Success] SID: ${res.sid}`);
      return res;
    } catch (err) {
      console.error('[Twilio WhatsApp Error] Failed to send:', err.message);
    }
  }

  // Fallback console logger
  console.log('\n--- [MOCK WHATSAPP DISPATCH] ---');
  console.log(`To: ${to}`);
  console.log(`Message:\n${message}`);
  console.log('--------------------------------\n');
  return { sid: 'mock_wa_' + Date.now() };
};

// Dispatch booking creation alerts
exports.sendBookingCreated = async (appointment, ownerSettings) => {
  const servicesList = appointment.selectedServices.map(s => s.serviceName).join(', ');
  
  // 1. Customer Email
  const customerEmailText = `Hello ${appointment.customerName},

Your appointment request has been received.

Services:
${servicesList}

Date:
${appointment.appointmentDate}

Time:
${appointment.appointmentTime}

Thank you for choosing VIVA Unisex Salon.`;

  const transporter = getTransporter();
  await transporter.sendMail({
    from: '"VIVA Unisex Salon" <bookings@vivasalon.com>',
    to: appointment.email,
    subject: 'Appointment Request Received',
    text: customerEmailText
  });

  // 2. Customer WhatsApp
  const customerWhatsAppText = `✨ VIVA Unisex Salon

Your booking request has been received.

Service:
${servicesList}

Date:
${appointment.appointmentDate}

Time:
${appointment.appointmentTime}`;

  await sendWhatsApp(appointment.phone, customerWhatsAppText);

  // 3. Owner Email & WhatsApp Alert
  if (ownerSettings && ownerSettings.ownerEmail) {
    const ownerEmailText = `Hello Admin/Owner,

A new appointment has been requested by ${appointment.customerName}.

Details:
Services: ${servicesList}
Date: ${appointment.appointmentDate}
Time: ${appointment.appointmentTime}
Phone: ${appointment.phone}
Email: ${appointment.email}
Notes: ${appointment.notes || 'None'}`;

    await transporter.sendMail({
      from: '"VIVA Bookings Engine" <engine@vivasalon.com>',
      to: ownerSettings.ownerEmail,
      subject: `New Booking Alert - ${appointment.customerName}`,
      text: ownerEmailText
    });

    if (ownerSettings.ownerWhatsapp) {
      const ownerWhatsAppText = `✨ VIVA Booking Alert

New appointment requested by: ${appointment.customerName}
Service: ${servicesList}
Date: ${appointment.appointmentDate}
Time: ${appointment.appointmentTime}`;
      await sendWhatsApp(ownerSettings.ownerWhatsapp, ownerWhatsAppText);
    }
  }
};

// Dispatch booking confirmation alerts
exports.sendBookingConfirmed = async (appointment, ownerSettings) => {
  const servicesList = appointment.selectedServices.map(s => s.serviceName).join(', ');

  // 1. Customer Email
  const customerEmailText = `Hello ${appointment.customerName},

Your appointment has been confirmed.

Services:
${servicesList}

Date:
${appointment.appointmentDate}

Time:
${appointment.appointmentTime}

We look forward to seeing you.`;

  const transporter = getTransporter();
  await transporter.sendMail({
    from: '"VIVA Unisex Salon" <bookings@vivasalon.com>',
    to: appointment.email,
    subject: 'Appointment Confirmed',
    text: customerEmailText
  });

  // 2. Customer WhatsApp
  const customerWhatsAppText = `✨ VIVA Unisex Salon

Your appointment has been confirmed.

Service:
${servicesList}

Date:
${appointment.appointmentDate}

Time:
${appointment.appointmentTime}`;

  await sendWhatsApp(appointment.phone, customerWhatsAppText);
};

// Dispatch booking cancellation alerts
exports.sendBookingCancelled = async (appointment, ownerSettings) => {
  const servicesList = appointment.selectedServices.map(s => s.serviceName).join(', ');

  // 1. Customer Email
  const customerEmailText = `Hello ${appointment.customerName},

Your appointment has been cancelled.

Services:
${servicesList}

Date:
${appointment.appointmentDate}

Time:
${appointment.appointmentTime}

If you have any questions, please contact us.`;

  const transporter = getTransporter();
  await transporter.sendMail({
    from: '"VIVA Unisex Salon" <bookings@vivasalon.com>',
    to: appointment.email,
    subject: 'Appointment Cancelled',
    text: customerEmailText
  });

  // 2. Customer WhatsApp
  const customerWhatsAppText = `✨ VIVA Unisex Salon

Your appointment has been cancelled.

Service:
${servicesList}

Date:
${appointment.appointmentDate}

Time:
${appointment.appointmentTime}`;

  await sendWhatsApp(appointment.phone, customerWhatsAppText);

  // 3. Owner Alert
  if (ownerSettings && ownerSettings.ownerEmail) {
    const ownerEmailText = `Hello Admin/Owner,

The appointment for ${appointment.customerName} has been cancelled.

Details:
Services: ${servicesList}
Date: ${appointment.appointmentDate}
Time: ${appointment.appointmentTime}`;

    await transporter.sendMail({
      from: '"VIVA Bookings Engine" <engine@vivasalon.com>',
      to: ownerSettings.ownerEmail,
      subject: `Booking Cancelled Alert - ${appointment.customerName}`,
      text: ownerEmailText
    });

    if (ownerSettings.ownerWhatsapp) {
      const ownerWhatsAppText = `✨ VIVA Cancellation Alert

Appointment cancelled by: ${appointment.customerName}
Service: ${servicesList}
Date: ${appointment.appointmentDate}
Time: ${appointment.appointmentTime}`;
      await sendWhatsApp(ownerSettings.ownerWhatsapp, ownerWhatsAppText);
    }
  }
};

// Dispatch 30-minute reminder alerts
exports.sendBookingReminder = async (appointment) => {
  // 1. Customer Email
  const customerEmailText = `Hello ${appointment.customerName},

Your appointment starts in 30 minutes.

Date:
${appointment.appointmentDate}

Time:
${appointment.appointmentTime}

Please arrive on time.`;

  const transporter = getTransporter();
  await transporter.sendMail({
    from: '"VIVA Unisex Salon" <bookings@vivasalon.com>',
    to: appointment.email,
    subject: 'Appointment Reminder',
    text: customerEmailText
  });

  // 2. Customer WhatsApp
  const customerWhatsAppText = `✨ Reminder

Your VIVA Salon appointment begins in 30 minutes.

See you soon.`;

  await sendWhatsApp(appointment.phone, customerWhatsAppText);
};
