// models/Doctor.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const doctorSchema = new mongoose.Schema({
  profilePicture: { type: String },
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  yearsOfExperience: { type: Number, required: true },
  password: { type: String, required: true },
});

doctorSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

doctorSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

const Doctor = mongoose.model('Doctor', doctorSchema);
module.exports = Doctor;
