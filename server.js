const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const app = require('./app');
const { frontendURL } = require('./utils/appConstant');

app.use(cors({ origin: frontendURL }));
dotenv.config({ path: './config.env' });
const port = process.env.PORT || 8000;
// const DB = process.env.LOCAL_DATABASE_URI;
const DB = process.env.DATABASE_URI.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB)
  .then(() => console.log('DB connection successful!'))
  .catch((err) => console.log(err));

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
