import React, { useState, useEffect } from 'react';
import { getAuth } from "firebase/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Search, User, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Sidebar from '../components/ui/Layout/SideBar';
import AppointmentForm from '../components/appointments/AppointmentForm';
import DoctorsList from '@/components/appointments/DoctorsList';
import AppointmentsList from '@/components/appointments/AppointmentsList';
import AvailableSlots from '@/components/appointments/AvailableSlots';

interface LocalAppointment {
  id: number;
  provider: { name: string };
  date: string;
  time: string;
  // Add other fields as necessary
}

export default function Appointments() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [view, setView] = useState<'list' | 'book' | 'edit'>('list');
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  interface Doctor {
    id: number;
    name: string;
    // Add other fields as necessary
  }
  
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<LocalAppointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const sessionUser = sessionStorage.getItem('authUser');
  const user = sessionUser ? JSON.parse(sessionUser) : null;

  useEffect(() => {
    fetchDoctors();
    fetchAppointments();
  }, []);

  const fetchDoctors = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        console.error("No logged-in user");
        return;
      }
      const token = await user.getIdToken();
      const response = await fetch('http://localhost:3000/api/appointments/providers', {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      const data = await response.json();
      setDoctors(data.data || []);
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        console.error("No logged-in user");
        return;
      }
      
      if (!user?.email) {
        console.log("Firebase didnt have email")
        return;
      }
      const token = await user.getIdToken();
      const response = await fetch(`http://localhost:3000/api/appointments?email=${encodeURIComponent(user.email)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      const data = await response.json();
      console.log(data.data);
      setAppointments(data.data || []);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    }
  };

  const handleBookAppointment = async (appointmentData: any) => {
    try {
      setIsLoading(true); // Add loading state
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        console.error("No logged-in user");
        return;
      }
      const token = await user.getIdToken();
      const response = await fetch('http://localhost:3000/api/appointments/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(appointmentData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        await fetchAppointments(); // Wait for appointments to be fetched
        setView('list'); // Only change view after successful booking
      } else {
        // Handle error case
        console.error('Failed to book appointment:', data.message);
        // You might want to show an error message to the user here
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      // Handle error appropriately
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAppointment = async (appointmentData: any) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        console.error("No logged-in user");
        return;
      }
      const token = await user.getIdToken();
      const response = await fetch(`http://localhost:3000/api/appointments/${appointmentData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(appointmentData),
      });
      
      if (response.ok) {
        setView('list');
        fetchAppointments();
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        console.error("No logged-in user");
        return;
      }
      const token = await user.getIdToken();
      const response = await fetch(`http://localhost:3000/api/appointments/${appointmentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        fetchAppointments();
      }
    } catch (error) {
      console.error('Error canceling appointment:', error);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 bg-white border-b shadow-sm p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
              {user && (
                <p className="text-gray-600">
                  Welcome back, <span className="font-semibold">{user.name}</span>
                </p>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-600 hover:text-blue-500"
              >
                <Bell className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-600 hover:text-blue-500"
              >
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto p-6">
          {view === 'list' ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <Tabs defaultValue="upcoming" className="w-[400px]">
                  <TabsList>
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="past">Past</TabsTrigger>
                  </TabsList>
                </Tabs>
                <Button
                  onClick={() => setView('book')}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <Plus className="mr-2 h-4 w-4" /> Book Appointment
                </Button>
              </div>

              <AppointmentsList
                appointments={appointments}
                onEdit={(appointment) => {
                  setSelectedAppointment(appointment);
                  setView('edit');
                }}
                onCancel={handleCancelAppointment}
                isLoading={isLoading}
              />
            </>
          ) : view === 'book' ? (
            selectedDoctor ? (
              <AppointmentForm
                selectedDoctor={selectedDoctor}
                onSubmit={handleBookAppointment}
                onBack={() => {
                  setSelectedDoctor(null);
                  setView('list');
                  
                }}
                isSubmitting={isLoading}
              />
            ) : (
              <DoctorsList
                doctors={doctors}
                onSelectDoctor={(doctor) => setSelectedDoctor(doctor)}
                isLoading={isLoading}
              />
            )
          ) : (
            <AppointmentForm
              selectedDoctor={selectedAppointment.provider}
              onSubmit={handleEditAppointment}
              onBack={() => {
                setSelectedAppointment(null);
                setView('list');
              }}
              isEditing
              appointmentData={selectedAppointment}
            />
          )}
        </div>
      </main>
    </div>
  );
}