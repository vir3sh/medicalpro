const express = require('express');
const Doctor = require('../models/Doctor'); // Adjust the path as per your folder structure

const router = express.Router();

// Route to get all doctors
router.get('/', async (req, res) => {
  try {
    const doctors = await Doctor.find(); // Fetch all doctors from the database
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching doctors', error });
  }
});

module.exports = router;
