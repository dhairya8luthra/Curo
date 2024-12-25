import { Calendar, Clock, User } from 'lucide-react';

export default function UpcomingAppointments() {
  const appointments = [
    {
      doctor: "Dr. Sarah Johnson",
      specialty: "Cardiologist",
      date: "Today",
      time: "2:00 PM",
      type: "Check-up"
    },
    {
      doctor: "Dr. Michael Chen",
      specialty: "Dentist",
      date: "Tomorrow",
      time: "10:30 AM",
      type: "Regular Cleaning"
    }
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Upcoming Appointments</h2>
      <div className="space-y-4">
        {appointments.map((appointment, index) => (
          <div key={index} className="p-4 border rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-medium">{appointment.doctor}</p>
                <p className="text-sm text-gray-500">{appointment.specialty}</p>
              </div>
              <span className="text-sm text-blue-500">{appointment.type}</span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {appointment.date}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {appointment.time}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}