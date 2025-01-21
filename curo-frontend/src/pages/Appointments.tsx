import  { useState, useRef, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { Bell,  User, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Sidebar from '../components/ui/Layout/SideBar';
import AppointmentForm from '../components/appointments/AppointmentForm';
import DoctorsList from '@/components/appointments/DoctorsList';
import AppointmentsList from '@/components/appointments/AppointmentsList';
import { useLocation } from 'react-router-dom';
 
interface LocalAppointment {
  id: number;
  provider: { name: string };
  date: string;
  time: string;
}
 
interface Doctor {
  id: number;
  name: string;
}
 
export default function Appointments() {
  const [activeTab, setActiveTab] = useState("appointments");
  const [view, setView] = useState<'list' | 'book' | 'edit'>('list');
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<LocalAppointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
 
  const sessionUser = sessionStorage.getItem('authUser');
  const user = sessionUser ? JSON.parse(sessionUser) : null;
 
 
  const buttonRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const handleProfileSelect = () => setShowOverlay((prev) => !prev);
 
 
  const handleClickOutside = (event: MouseEvent) => {
    if (
      overlayRef.current &&
      !overlayRef.current.contains(event.target as Node) &&
      buttonRef.current &&
      !buttonRef.current.contains(event.target as Node)
    ) {
      setShowOverlay(false);
    }
  };
 
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  // Reset state when location changes
 
  useEffect(() => {
    fetchDoctors();
    fetchAppointments();
 
  }, [location.pathname]);
 
  const fetchDoctors = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        console.error("No logged-in user");
        return;
      }
      const token = await user.getIdToken();
      const response = await fetch('https://curo-156q.onrender.com/api/appointments/providers', {
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
      if (!user || !user.email) {
        console.error("No logged-in user or email");
        return;
      }
      const token = await user.getIdToken();
      const response = await fetch(`https://curo-156q.onrender.com/api/appointments?email=${encodeURIComponent(user.email)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      const data = await response.json();
      setAppointments(data.data || []);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    }
  };
 
  const handleBookAppointment = async (appointmentData: any) => {
    try {
      setIsLoading(true);
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        console.error("No logged-in user");
        return;
      }
      if (!user || !user.email) {
        console.error("No logged-in user or email");
        return;
      }
      const token = await user.getIdToken();
      const response = await fetch(`https://curo-156q.onrender.com/api/appointments/book?email=${encodeURIComponent(user.email)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(appointmentData),
      });
 
      const data = await response.json();
 
      if (response.ok) {
        await fetchAppointments();
        setView('list');
      } else {
        console.error('Failed to book appointment:', data.message);
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
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
      const response = await fetch(`https://curo-156q.onrender.com/api/appointments/${appointmentData.id}`, {
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
 
  return (
    <div className="flex h-screen w-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
 
      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 bg-white border-b shadow-sm p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
              {user && (
                <p className="text-gray-600 mt-1">
                  Welcome back, <span className="font-semibold">{user.name}</span>
                </p>
              )}
            </div>
 
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="bg-blue-500 !text-white hover:bg-blue-600"
              >
                <Bell className="h-5 w-5" />
              </Button>
 
              {/* User Icon */}
              <Button
                ref={buttonRef}
                variant="ghost"
                size="icon"
                className="bg-blue-500 !text-white hover:bg-blue-600"
                onClick={handleProfileSelect}
              >
                <User className="h-5 w-5" />
              </Button>
            </div>
            {/* Overlay */}
            {showOverlay && (
              <div
                ref={overlayRef}
                className="absolute left-0 top-full mt-2 w-64 bg-white border border-gray-300 shadow-lg rounded-md p-4 z-10"
              >
                <p className="text-gray-700 font-medium">Name: {user.name}</p>
                <p className="text-gray-700 font-medium">Email: {user.email}</p>
              </div>
            )}
          </div>
      </header>
 
      <div className="max-w-7xl mx-auto p-6">
        {view === 'list' ? (
          <>
            <div className="flex justify-between items-center mb-8">
              <Button
                onClick={() => setView('book')}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105"
              >
                <Plus className="mr-2 h-4 w-4" /> Book Appointment
              </Button>
            </div>
 
            <AppointmentsList
              appointments={appointments}
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
            selectedDoctor={selectedAppointment ? selectedAppointment.provider : null}
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
    </div >
  );
}