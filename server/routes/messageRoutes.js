const express = require('express');
const router = express.Router();
const Message = require('../models/Message'); // Assuming Message schema exists

router.post('/api/messages/:doctorId', async (req, res) => {
  const { doctorId } = req.params;
  const { patientId, illnessHistory, recentSurgery, isDiabetic, allergies, others } = req.body;

  try {
    // Save message in database
    const message = new Message({
      doctorId,
      patientId,
      illnessHistory,
      recentSurgery,
      isDiabetic,
      allergies,
      others,
      sentAt: new Date(),
    });
    
    await message.save();

    res.status(201).json({ message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ message: 'Failed to send the message.' });
  }
});

module.exports = router;
