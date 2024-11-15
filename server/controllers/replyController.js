const Patient = require('../models/Patient'); // Adjust path if necessary

// Function to add a reply to a patient's replies array
const addReplyToPatient = async (patientId, replyData) => {
  try {
    const patient = await Patient.findById(patientId);
    if (!patient) throw new Error('Patient not found');

    // Add the reply to the replies array
    if (!patient.replies) {
      patient.replies = []; // Initialize if undefined
    }
    patient.replies.push(replyData); 
    await patient.save(); // Save the updated patient document
    console.log('Reply added successfully');
    return { success: true, message: 'Reply added successfully' };
  } catch (error) {
    console.error('Error adding reply:', error);
    throw error; // Re-throw to handle in route
  }
};

module.exports = { addReplyToPatient };
