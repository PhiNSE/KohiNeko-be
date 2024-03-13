const express = require('express');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  res.send('Welcome to the Coffee Shop API');
});

module.exports = router;
