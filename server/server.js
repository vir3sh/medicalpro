// Import statements at the top of server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const Doctor = require('./models/Doctor');  // Import the Doctor model

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Setup Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });
const doctorRoutes = require('./routes/doctorRoutes'); // Adjust the path if necessary

app.use('/api/doctors', doctorRoutes);

// MongoDB connection setup
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log('Error connecting to MongoDB:', err));

// Route to add a new doctor
// Backend route to add a new doctor
app.post('/api/doctors', upload.single('profilePicture'), async (req, res) => {
  try {
    const { name, specialty, email, phone, yearsOfExperience, password } = req.body;

    // Check if doctor already exists by email or phone
    const existingDoctor = await Doctor.findOne({ $or: [{ email }, { phone }] });
    if (existingDoctor) {
      return res.status(400).json({ message: 'Doctor already exists' });
    }

    // Save new doctor with hashed password
    const doctor = new Doctor({
      profilePicture: req.file ? req.file.path : null, // Profile picture path
      name,
      specialty,
      email,
      phone,
      yearsOfExperience,
      password, // Save the plain password
    });

    await doctor.save();
    res.status(201).json({ message: 'Doctor added successfully', doctor });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});


// Login route for doctors
app.post('/api/doctors/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the doctor by email
    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check if the password matches
    const isMatch = await doctor.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // If login is successful, send back a success response
    res.status(200).json({ message: 'Login successful', doctor });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});



// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
