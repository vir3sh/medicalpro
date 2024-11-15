exports.bookAppointment = async (req, res) => {
    const { patientId, doctorId, date, reason } = req.body;
    const appointment = new Appointment({ patientId, doctorId, date, reason });
    await appointment.save();
    res.status(201).send({ message: 'Appointment booked', appointment });
};
