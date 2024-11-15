const express = require('express');
const router = express.Router();
const Consultation = require('../models/Consultation');
const Prescription = require('../models/Prescription'); // Import the Prescription model

// Get all consultations for a logged-in doctor
router.get('/api/consultations', async (req, res) => {
  try {
    // Assuming user is authenticated and the doctor's ID is in the session or JWT
    const doctorId = req.user.id; // Replace with actual doctor ID from authentication
    const consultations = await Consultation.find({ doctor: doctorId })
      .populate('doctor')
      .populate('patient');
    res.json(consultations);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get consultations' });
  }
});

// Create a prescription for a specific consultation
router.post('/api/consultations/:consultationId/prescription', async (req, res) => {
  const { consultationId } = req.params;
  const { care, medicines } = req.body; // Get care and medicines from request body

  try {
    // Ensure that the consultation exists
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    // Create a new prescription
    const newPrescription = new Prescription({
      consultationId,
      care,
      medicines,
    });

    // Save the prescription to the database
    await newPrescription.save();

    // Optionally, update the consultation to link it with the prescription (if needed)
    consultation.prescription = newPrescription._id;
    await consultation.save();

    res.status(201).json({ message: 'Prescription created successfully', prescription: newPrescription });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create prescription', error });
  }
});

module.exports = router;
