const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  consultationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Consultation', required: true }, // Reference to consultation
  care: { type: String, required: true }, // Care instructions
  medicines: { type: String, required: true }, // Medicines prescribed
}, { timestamps: true });

const Prescription = mongoose.model('Prescription', prescriptionSchema);
module.exports = Prescription;
