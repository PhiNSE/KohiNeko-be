const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const sendEmail = async (options) => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
    port: process.env.EMAIL_PORT || '2525',
    // secure: false,
    auth: {
      user: process.env.EMAIL_USERNAME || '3efe333c703240',
      pass: process.env.EMAIL_PASSWORD || 'a7375870c3355d',
    },
  });
  const mailOptions = {
    from: 'Kohi-Neko <kohineko@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
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
