import axios from 'axios';
import dotenv from 'dotenv';
import { sub, add, formatISO } from 'date-fns';

dotenv.config();

const NEXHEALTH_BASE_URL = 'https://nexhealth.info';
const API_KEY = process.env.NEXHEALTH_API_KEY;
const SUBDOMAIN = process.env.NEXHEALTH_SUBDOMAIN;
const LOCATION_ID = process.env.NEXHEALTH_LOCATION_ID;

class NexHealthService {
  constructor() {
    this.token = null;
  }

  async authenticate() {
    try {
      const response = await axios.post(`${NEXHEALTH_BASE_URL}/authenticates`, null, {
        headers: {
          'Accept': 'application/vnd.Nexhealth+json;version=2',
          'Authorization': API_KEY
        }
      });
      this.token = response.data.data.token;
      return this.token;
    } catch (error) {
      console.error('Authentication failed:', error);
      throw error;
    }
  }

  async getAuthHeaders() {
    if (!this.token) {
      await this.authenticate();
    }
    return {
      'Accept': 'application/vnd.Nexhealth+json;version=2',
      'Authorization': `Bearer ${this.token}`
    };
  }

  async getPatients(page = 1, perPage = 100) {
    const headers = await this.getAuthHeaders();
    try {
      const response = await axios.get(`${NEXHEALTH_BASE_URL}/patients`, {
        params: {
          subdomain: SUBDOMAIN,
          location_id: LOCATION_ID,
          new_patient: false,
          page,
          per_page: perPage
        },
        headers
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch patients:', error);
      throw error;
    }
  }

  async getProviders() {
    const headers = await this.getAuthHeaders();
    try {
      const response = await axios.get(`${NEXHEALTH_BASE_URL}/providers`, {
        params: {
          subdomain: SUBDOMAIN,
          page: 1,
          per_page: 100
        },
        headers
      });
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch providers:', error);
      throw error;
    }
  }

  async getAppointmentSlots(startDate, days = 1,pid) {
    const headers = await this.getAuthHeaders();
    try {
      const response = await axios.get(`${NEXHEALTH_BASE_URL}/appointment_slots`, {
        params: {
          subdomain: SUBDOMAIN,
          start_date: startDate,
          days,
          lids: [LOCATION_ID],
          pids:[pid]
        },
        headers
      });
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch appointment slots:', error);
      throw error;
    }
  }

  async getAppointments(page = 2, perPage = 100, status = null,patientid) {
    const headers = await this.getAuthHeaders();
    try {
      const params = {
        subdomain: SUBDOMAIN,
        location_id:LOCATION_ID,
        start:sub(new Date(), { days: 1 }),
        end:add(new Date(), { months: 1 }),
        patient_id:patientid,
        page,
        per_page: 100,
        include: ['patient']
      };
      
      if (status) {
        params.status = status;
      }

      const response = await axios.get(`${NEXHEALTH_BASE_URL}/appointments`, {
        params,
        headers
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      throw error;
    }
  }

  async getAppointment(id) {
    const headers = await this.getAuthHeaders();
    try {
      const response = await axios.get(`${NEXHEALTH_BASE_URL}/appointments/${id}`, {
        params: {
          subdomain: SUBDOMAIN,
          include: ['patient']
        },
        headers
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch appointment:', error);
      throw error;
    }
  }

  async createAppointment(appointmentData) {
    const { provider_name, ...filteredData } = appointmentData; // Destructure to exclude provider_name
    const headers = await this.getAuthHeaders();
    try {
      const response = await axios.post(
        `${NEXHEALTH_BASE_URL}/appointments`,
        {
          appt: filteredData // Use the filtered data without provider_name
        },
        {
          params: {
            subdomain: SUBDOMAIN,
            location_id: LOCATION_ID,
            notify_patient: false
          },
          headers
        }
      );
      console.log(response.data);
      return response.data;
     
    } catch (error) {
      console.error('Failed to create appointment:', error);
      throw error;
    }
  }


  async updateAppointment(id, appointmentData) {
    const headers = await this.getAuthHeaders();
    try {
      const response = await axios.patch(
        `${NEXHEALTH_BASE_URL}/appointments/${id}`,
        {
          appt: appointmentData
        },
        {
          params: {
            subdomain: SUBDOMAIN,
            notify_patient: false
          },
          headers
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to update appointment:', error);
      throw error;
    }
  }

  async cancelAppointment(id) {
    const headers = await this.getAuthHeaders();
    try {
      const response = await axios.delete(
        `${NEXHEALTH_BASE_URL}/appointments/${id}`,
        {
          params: {
            subdomain: SUBDOMAIN,
            notify_patient: false
          },
          headers
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      throw error;
    }
  }
  async searchPatients(email) {
    const headers = await this.getAuthHeaders();
    try {
      const response = await axios.get(`${NEXHEALTH_BASE_URL}/patients`, {
        params: {
          subdomain: SUBDOMAIN,
          location_id: LOCATION_ID,
          email: email,
          page: 1,
          per_page: 10
        },
        headers
      });
      return response.data;
    } catch (error) {
      console.error('Failed to search patients:', error);
      throw error;
    }
  }

  async createPatient(patientData,providerid) {
    const headers = await this.getAuthHeaders();
    try {
      const response = await axios.post(
        `${NEXHEALTH_BASE_URL}/patients`,
        {
          ...patientData,
          provider: {
            provider_id: providerid
          }
        },
        {
          params: {
            subdomain: SUBDOMAIN,
            location_id: LOCATION_ID
          },
          headers
        }
      );
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to create patient:', error);
      throw error;
    }
  }

}

export default new NexHealthService();