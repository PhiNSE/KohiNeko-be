const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const sendEmail = async (options) => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || '465',
    // secure: false,
    auth: {
      user: process.env.EMAIL_USERNAME || 'thekohineko001@gmail.com',
      pass: process.env.EMAIL_PASSWORD || 'bsbnntdqjkmnkpvh',
    },

    // gmailPassword: process.env.GMAIL_PASSWORD || 'drmk skal ukbj ipip',
  });
  const mailOptions = {
    from: 'Kohi-Neko <kohineko@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  await transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error(err);
    } else {
      console.log(info);
    }
  });
};

exports.sendEmail = sendEmail;
