import express from 'express';
import nexhealthService from '../services/nextHealthService.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// Get all patients
router.get('/patients', authenticateUser, async (req, res) => {
  try {
    const { page = 1, perPage = 10 } = req.query;
    const patients = await nexhealthService.getPatients(page, perPage);
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});
// Check if patient exists by email
router.get('/patients/check', authenticateUser, async (req, res) => {
    try {
      const { email } = req.query;
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }
  
      const patients = await nexhealthService.searchPatients(email);
      console.log(patients.data);
      const existingPatient = !(patients.data.patients.length==0);
  
      if (existingPatient) {
        console.log('Patient exists:', existingPatient);
        res.json({ exists: true, patientId: patients.data.patients[0].id });
      } else {
        res.json({ exists: false });
      }
    } catch (error) {
      console.error('Error checking patient:', error);
      res.status(500).json({ error: 'Failed to check patient' });
    }
  });
  
  // Create new patient
  router.post('/patients', authenticateUser, async (req, res) => {
    try {
      const {providerid} = req.query;
      console.log(providerid);
      const patient = await nexhealthService.createPatient(req.body,providerid);
      res.json(patient);
    } catch (error) {
      if (error.response?.status === 400 && error.response.data?.message?.includes('already exists')) {
        res.status(400).json({ message: error.response.data.message });
      } else {
        console.error('Error creating patient:', error);
        res.status(500).json({ error: 'Failed to create patient' });
        console.log(error.response.data.error);

        
      }
    }
  });
  

// Get all providers
router.get('/providers', authenticateUser, async (req, res) => {
  try {
    const providers = await nexhealthService.getProviders();
    res.json(providers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch providers' });

    
  }
});

// Get available appointment slots
router.get('/slots', authenticateUser, async (req, res) => {
  try {
    const { startDate, days,providerId } = req.query;
    const slots = await nexhealthService.getAppointmentSlots(startDate, days,providerId);
    res.json(slots);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch appointment slots' });
  }
});

// Get all appointments
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { email } = req.query;
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }
  
      const patients = await nexhealthService.searchPatients(email);
      console.log(patients.data);
      const existingPatient = !(patients.data.patients.length==0);
      if(existingPatient){
        const { page = 1, perPage = 10, status } = req.query;
        
        const appointments = await nexhealthService.getAppointments(page, perPage, status,patients.data.patients[0].id);
        res.json(appointments);

      }
      else{
        res.json([])
      }
      
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Get single appointment
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const appointment = await nexhealthService.getAppointment(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch appointment' });
  }
});

// Create a new appointment
router.post('/book', authenticateUser, async (req, res) => {
  try {
    const appointment = await nexhealthService.createAppointment(req.body);
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create appointment' });
    console.log(error.response.data.error);
  }
});

// Update an appointment
router.patch('/:id', authenticateUser, async (req, res) => {
  try {
    const appointment = await nexhealthService.updateAppointment(req.params.id, req.body);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

// Cancel an appointment
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const result = await nexhealthService.cancelAppointment(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
});

export default router;