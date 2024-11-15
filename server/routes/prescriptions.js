const express = require('express');
const router = express.Router();
const Prescription = require('../models/Prescription');
const Consultation = require('../models/Consultation');

// Create a prescription for a consultation
router.post('/api/prescriptions/:consultationId', async (req, res) => {
  const { care, medicines } = req.body;
  const { consultationId } = req.params;

  try {
    const prescription = new Prescription({
      consultationId,
      care,
      medicines,
    });

    await prescription.save();
    res.status(201).json({ message: 'Prescription created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create prescription' });
  }
});

module.exports = router;
