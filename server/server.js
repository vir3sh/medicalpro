const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs'); 
const Patient = require('./models/Patient');  // Correct the import from Doctor to Patient
const Doctor = require('./models/Doctor');  // Import Doctor model
const jwt = require('jsonwebtoken');

const app = express();
const router = express.Router();  // Create a router instance

dotenv.config();

// Middleware setup
app.use(cors());
app.use(express.json());

// Set up Multer for handling file uploads (e.g., profile pictures)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Assign a unique name for the file
  }
});
const upload = multer({ storage: storage });

// MongoDB connection setup
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log('Error connecting to MongoDB:', err));

// Patient Registration Route
router.post('/register', upload.single('profilePicture'), async (req, res) => {
  const { name, age, email, phone, historyOfSurgery, historyOfIllness, password } = req.body;

  // Validate required fields
  if (!name || !email || !phone || !password || !historyOfSurgery || !historyOfIllness) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if the patient already exists by email or phone
    const existingPatient = await Patient.findOne({ $or: [{ email }, { phone }] });
    if (existingPatient) {
      return res.status(400).json({ message: 'Patient with this email or phone already exists' });
    }

    // Create new patient object
    const patient = new Patient({
      profilePicture: req.file ? req.file.path : null,
      name,
      age,
      email,
      phone,
      historyOfSurgery,
      historyOfIllness,
      password, // Password will be hashed in the model
    });

    // Save the patient to the database
    await patient.save();
    res.status(201).json({ message: 'Patient registered successfully' });
  } catch (error) {
    console.error('Error during patient registration:', error); // Log the error for debugging
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// Patient Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Find patient by email
    const patient = await Patient.findOne({ email });
    if (!patient) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare the password with the hashed password in the database
    const isMatch = await patient.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token with an expiration time
    const token = jwt.sign({ id: patient._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Send success response with token and patient details
    res.status(200).json({
      message: 'Login successful',
      token,
      patient: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        profilePicture: patient.profilePicture || null, // Include profile picture if available
      },
    });
  } catch (error) {
    console.error('Error during login:', error); // Log error for debugging
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Register and Login routes for Doctor
// Doctor Registration
router.post('/doctors/register', upload.single('profilePicture'), async (req, res) => {
  const { name, specialty, email, phone, yearsOfExperience, password } = req.body;

  try {
    const existingDoctor = await Doctor.findOne({ $or: [{ email }, { phone }] });
    if (existingDoctor) {
      return res.status(400).json({ message: 'Doctor already exists' });
    }

    const doctor = new Doctor({
      profilePicture: req.file ? req.file.path : null,
      name,
      specialty,
      email,
      phone,
      yearsOfExperience,
      password,
    });

    await doctor.save();
    res.status(201).json({ message: 'Doctor added successfully', doctor });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Doctor Login
router.post('/doctors/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the doctor by email
    const doctor = await Doctor.findOne({ email });

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Compare passwords (using bcrypt if you hashed the password)
    const isMatch = await bcrypt.compare(password, doctor.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Create and send a JWT token
    const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
      message: 'Login successful',
      token, // Include the JWT token in the response
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        profilePicture: doctor.profilePicture, // If you have a profile picture
      },
    });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Use the routes
app.use('/api', router); // Apply the routes to /api path

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
