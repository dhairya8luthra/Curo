import express from 'express';
import nexhealthService from '../services/nextHealthService.js';
import { authenticateUser } from '../middleware/auth.js';
import supabase from '../supabase.js';

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
        
        const appointments = await nexhealthService.getAppointments(page, perPage, status,patients.data.patients[0].id

        );
        res.json(appointments);

      }
      else{
        res.json([])
      }
      
  } catch (error) {
    console.log(error.response.data.error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});



// Create a new appointment
router.post('/book', authenticateUser, async (req, res) => {
  try {
    const { email } = req.query;
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

    const appointment = await nexhealthService.createAppointment(req.body);
    

    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
      if (userError) {
        console.error('Failed to fetch user from Supabase:', userError);
        return res.status(500).json({ error: 'Supabase user fetch failed' });
      }
      if (!userRecord) {
        // If user does not exist in Supabase, either create them or return error:
        return res.status(404).json({ error: 'User not found in Supabase' });
      }
      const { data: supabaseAppointment, error: apptError } = await supabase
      .from('appointments')
      .insert({
        user_id: userRecord.id,              // link to the user
        provider_id: req.body.provider_id,   // or whatever your "doctor" ID is
        start_time: req.body.start_time,     // must be a date/time format
        notes: req.body.notes ?? null,
      })
      .single();

    if (apptError) {
      console.error('Failed to insert appointment into Supabase:', apptError);
      return res.status(500).json({ error: 'Supabase appointment insert failed' });
    }

    // 5) Return combined result or whatever you prefer
    return res.json({
      message: 'Appointment created successfully',
      nexhealthAppointment,
      supabaseAppointment,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create appointment' });
   
  }
});
router.get('/recent', authenticateUser, async (req, res) => {
  try {
    // Query Supabase for the 3 most recently created appointments
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false })  // Sort by created_at descending
      .limit(3);                                  // Limit to 3

    if (error) {
      console.error('Error fetching recent appointments:', error);
      return res.status(500).json({ error: 'Failed to fetch recent appointments' });
    }

    return res.json({
      message: 'Fetched 3 most recent appointments',
      data: data, // the 3 appointments
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
});

export default router;