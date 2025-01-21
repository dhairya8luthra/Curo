import { useState, useEffect } from "react";
import { Calendar, Clock } from "lucide-react";
import { getAuth } from "firebase/auth";
import { format } from "date-fns";

export default function UpcomingAppointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentAppointments = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 1) Get current user + Firebase token
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
          setError("No authenticated user found");
          return;
        }

        const token = await user.getIdToken();

        // 2) Call your backend route
        const response = await fetch("https://curo-156q.onrender.com/api/appointments/recent", {
          headers: {
            // Pass the Firebase token in the Authorization header
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error("Failed to fetch recent appointments");
        }

        // 3) Parse the response
        const data = await response.json();
        // Expect data to look like:
        // {
        //   message: "Fetched 3 most recent appointments",
        //   data: [ { id, user_id, provider_id, start_time, notes, ... }, ...]
        // }
        
        setAppointments(data.data || []);
        console.log(data.data);
      } catch (err: any) {
        setError(err.message || "Error fetching appointments");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentAppointments();
  }, []);

  // Loading or error states
  if (isLoading) {
    return <p className="text-gray-600">Loading recent appointments...</p>;
  }

  if (error) {
    return <p className="text-red-600">Error: {error}</p>;
  }

  // If no appointments, show a simple message
  if (appointments.length === 0) {
    return <p className="text-gray-600">No recent appointments found.</p>;
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Upcoming Appointments</h2>
      <div className="space-y-4">
        {appointments.map((appointment) => {
          // Convert start_time to a readable date/time
          const dateObj = new Date(appointment.start_time);
          const dateString = format(dateObj, "MMMM d, yyyy");
          const timeString = format(dateObj, "h:mm a");

          return (
            <div key={appointment.id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                {/* Replace these with your own fields (e.g. doctor name) if you have them */}
                <div>
                  <p className="font-medium">Dr. {appointment.provider_name}</p>
                  <p className="text-sm text-gray-500">User ID: {appointment.user_id}</p>
                </div>
                {/* If you store an appointment 'type' or 'notes', you can display it here */}
                <span className="text-sm text-blue-500">{appointment.notes ?? 'No notes'}</span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {dateString}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {timeString}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
