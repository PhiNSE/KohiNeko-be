const mongoose = require('mongoose');
// Extract necessary environment variables
const DATABASE_URI =
  'mongodb+srv://nguyenphigv23:<PASSWORD>@cluster0.qkgf4op.mongodb.net/test';
const DATABASE_PASSWORD = 'nguyenphimb091123';
// Replace the placeholder in the DATABASE_URI with the DATABASE_PASSWORD
const DB = DATABASE_URI.replace('<PASSWORD>', DATABASE_PASSWORD);
// Connect to the MongoDB database
mongoose
  .connect(DB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('DB connection successful!'))
  .catch((err) => console.error('DB connection error:', err));
