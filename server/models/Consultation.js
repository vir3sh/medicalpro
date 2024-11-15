// models/Consultation.js
const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
  },
  currentIllness: {
    type: String,
    required: true,
  },
  recentSurgery: {
    type: String,
    required: true,
  },
  familyHistory: {
    diabetics: {
      type: Boolean,
      required: true,
    },
    allergies: {
      type: String,
      required: true,
    },
    others: {
      type: String,
      required: false,
    },
  },
  consultationDetails: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Consultation = mongoose.model('Consultation', consultationSchema);

module.exports = Consultation;
