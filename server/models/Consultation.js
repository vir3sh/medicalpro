const mongoose = require('mongoose');

// Schema for family history in the consultation form
const familyHistorySchema = new mongoose.Schema({
  diabetes: { type: String, enum: ['Diabetic', 'Non-Diabetic'] },
  allergies: { type: String, required: true },
  others: { type: String },
});

// Consultation Schema
const consultationSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true }, // Reference to the Doctor model
  patientName: { type: String, required: true }, // You can also use the patient ID here if available
  appointmentDate: { type: Date, required: true },
  symptoms: { type: String, required: true },
  illnessHistory: { type: String, required: true },
  recentSurgery: { type: String, required: true },
  familyHistory: familyHistorySchema, // Embedded family history schema
}, { timestamps: true });

const Consultation = mongoose.model('Consultation', consultationSchema);
module.exports = Consultation;
