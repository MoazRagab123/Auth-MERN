// Import nodemailer for sending emails
import nodemailer from 'nodemailer';

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com', // SMTP server address
  port: 587, // SMTP server port
  auth: {
    user: process.env.SMTP_USER, // SMTP user from environment variables
    pass: process.env.SMTP_PASS, // SMTP password from environment variables
  },
  tls: {
    rejectUnauthorized: false // Accept self-signed certificates
  }
});

// Export the transporter object to be used in other parts of the application
export default transporter;