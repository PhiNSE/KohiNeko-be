const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });

async function connectDB(uri) {
  const mongoClient = mongoose
    .connect(uri)
    .then(() => {
      console.log('DB connection successful!');
      return mongoose;
    })
    .catch((err) => {
      console.error('DB connection failed!');
      throw err;
    });
  return mongoClient;
}

module.exports = connectDB;
