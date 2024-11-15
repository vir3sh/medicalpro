const mongoose = require('mongoose');

// Define the schema for the message
const messageSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  illnessHistory: String,
  recentSurgery: String,
  isDiabetic: String,
  allergies: String,
  others: String,
  sentAt: {
    type: Date,
    default: Date.now,
  },
  // Adding the replies field to store the prescription replies
  replies: [
    {
      careToBeTaken: {
        type: String,
        required: true, // Make this field required for the reply
      },
      medicines: {
        type: String,
        required: true, // Make this field required for the reply
      },
      replyDate: {
        type: Date,
        default: Date.now, // Date when the reply was sent
      },
      doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true, // Reference to the doctor who replied
      },
      doctorName: {
        type: String,
        required: true, // Store the doctor's name
      },
      patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true, // Reference to the patient for whom the reply was sent
      },
    },
  ],
});

module.exports = mongoose.model('Message', messageSchema);
