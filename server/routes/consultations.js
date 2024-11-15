const express = require('express');
const router = express.Router();
const Consultation = require('../models/Consultation');

// Create a new consultation
router.post('/api/consultations', async (req, res) => {
  const { doctorId, patientName, appointmentDate, symptoms, illnessHistory, recentSurgery, familyHistory } = req.body;

  try {
    // Create a new consultation document
    const consultation = new Consultation({
      doctorId,
      patientName,
      appointmentDate,
      symptoms,
      illnessHistory,
      recentSurgery,
      familyHistory,
    });

    // Save the consultation document to the database
    await consultation.save();

    res.status(201).json({ message: 'Consultation created successfully', consultation });
  } catch (error) {
    console.error('Error saving consultation:', error);
    res.status(500).json({ message: 'Failed to create consultation' });
  }
});

module.exports = router;
