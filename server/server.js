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
const messageRoutes = require('./routes/messageRoutes'); 
const Message = require('./models/Message');
const Consultation = require('./models/Consultation');

const app = express();
const router = express.Router();  // Create a router instance

dotenv.config();

// Middleware setup

app.use(cors({
  origin: 'http://localhost:3000', // Replace with your frontend's URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

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
// router.post('/consultations/:doctorId', async (req, res) => {
//   try {
//     const { doctorId } = req.params;
//     const { currentIllness, recentSurgery, familyHistory, consultationDetails } = req.body;

//     // Create the new consultation document
//     const newConsultation = new Consultation({
//       doctorId,
//       currentIllness,
//       recentSurgery,
//       familyHistory,
//       consultationDetails,
//     });

//     // Save the consultation to the database
//     const savedConsultation = await newConsultation.save();

//     // Find the doctor and send them a notification (e.g., email, SMS)
//     const doctor = await Doctor.findById(doctorId);
//     if (doctor) {
//       // Send notification to the doctor (via email or SMS)
//       // Example: sendEmailToDoctor(doctor.email, savedConsultation);
//     }

//     res.status(201).json({
//       message: 'Consultation submitted successfully!',
//       consultation: savedConsultation,
//     });
//   } catch (error) {
//     console.error('Error saving consultation:', error);
//     res.status(500).json({ message: 'Error saving consultation' });
//   }
// });

router.get('/doctors', async (req, res) => {
  try {
    const doctors = await Doctor.find(); // Fetch all doctors from the database
    res.status(200).json(doctors); // Send the list of doctors
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
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

    // Send the response containing the doctor details and token
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


router.get('/doctors/:doctorId', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.doctorId); // Replace with your DB lookup
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json(doctor); // Return doctor details
  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


app.post('/api/consultations', async (req, res) => {
  const {
    doctorId,
    patientName,
    appointmentDate,
    symptoms,
    illnessHistory,
    recentSurgery,
    diabetes,
    allergies,
    others,
  } = req.body;

  try {
    // Assuming you have a Consultation model to save data
    const consultation = new Consultation({
      doctorId,
      patientName,
      appointmentDate,
      symptoms,
      illnessHistory,
      recentSurgery,
      diabetes,
      allergies,
      others,
    });

    // Save the consultation data to the database
    await consultation.save();

    // Respond with a success message
    res.status(201).json({ message: 'Consultation created successfully', consultation });
  } catch (error) {
    console.error('Error saving consultation:', error);
    res.status(500).json({ message: 'Failed to create consultation' });
  }
});

router.post('/doctors/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Login request received:', { email, password }); // Log the request data
  try {
    const doctor = await Doctor.findOne({ email });

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
      message: 'Login successful',
      token,
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        profilePicture: doctor.profilePicture,
      },
    });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/messages/:doctorId', async (req, res) => {
  const { doctorId } = req.params; // Extract doctorId from the route
  const { patientId, illnessHistory, recentSurgery, isDiabetic, allergies, others } = req.body;

  try {
    const message = new Message({
      doctorId,
      patientId,
      illnessHistory,
      recentSurgery,
      isDiabetic,
      allergies,
      others,
      sentAt: new Date(),
    });

    await message.save();
    res.status(201).json({ message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ error: 'Failed to send the message.' });
  }
});

app.get('/api/messages/:doctorId', async (req, res) => {
  const { doctorId } = req.params;
  try {
    const messages = await Message.find({ doctorId: doctorId }).populate('patientId');
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).send('Server error');
  }
});


// In your Express backend
app.post('/api/consultations/:doctorId', async (req, res) => {
  const { doctorId } = req.params;
  const { illnessHistory, recentSurgery, isDiabetic, allergies, others } = req.body;

  try {
    // Save consultation data to database
    const consultation = await Consultation.create({
      doctor: doctorId,
      patient: req.user.id, // Assuming patient info is in req.user
      illnessHistory,
      recentSurgery,
      isDiabetic,
      allergies,
      others,
    });

    res.status(201).json(consultation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create consultation.' });
  }
});



// Use the routes
app.use('/api', router); // Apply the routes to /api path
// app.use('/api/messages', messageRoutes); 
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
