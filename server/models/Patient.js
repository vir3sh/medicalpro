// Patient.js
const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    profilePicture: String,
    name: { type: String, required: true },
    age: { type: Number, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true, unique: true },
    historyOfSurgery: String,
    historyOfIllness: [String]
});

module.exports = mongoose.model('Patient', patientSchema);
