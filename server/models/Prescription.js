// Prescription.js
const prescriptionSchema = new mongoose.Schema({
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
    message: String,
    medication: String
});
