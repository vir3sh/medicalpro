const express = require('express');
const Doctor = require('../models/Patirnt'); // Adjust the path as per your folder structure

const router = express.Router();

// Route to get all doctors
router.get('/', async (req, res) => {
  try {
    const doctors = await Patient.find(); // Fetch all doctors from the database
    res.status(200).json(patient);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching patient', error });
  }
});

module.exports = router;