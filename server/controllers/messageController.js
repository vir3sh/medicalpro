// controllers/messageController.js
const Message = require('../models/Message');  // Import your Message model
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

// Controller to fetch messages for a specific doctor
const getMessages = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    const messages = await Message.find({ doctorId }).populate('patientId', 'name');
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
};

// Controller to handle reply to a message with prescription details
const replyMessage = async (req, res) => {
  const { careToBeTaken, medicines } = req.body;
  const { messageId } = req.params;
  const doctorId = req.user.id; // Assuming the authenticated doctor ID comes from the JWT token

  try {
    // Find the original message by ID
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Create a reply (prescription) for the message
    const prescriptionReply = {
      careToBeTaken,
      medicines,
      replyDate: new Date(),
      doctorId,
      doctorName: req.user.name,  // Assuming the doctor's name is in the JWT token
      patientId: message.patientId,
    };

    // Store the prescription reply in the message
    message.replies.push(prescriptionReply);
    await message.save();

    res.status(200).json({ message: 'Reply sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error sending reply' });
  }
};

module.exports = { getMessages, replyMessage };
