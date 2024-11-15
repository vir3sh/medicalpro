// middleware/auth.js
const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');

const authenticate = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const doctor = await Doctor.findById(decoded.id);
    if (!doctor) {
      return res.status(401).json({ message: 'Doctor not found' });
    }
    req.user = doctor;  // Attach doctor data to the request
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = { authenticate };
