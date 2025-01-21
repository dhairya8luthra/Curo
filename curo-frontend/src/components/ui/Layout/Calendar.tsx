import  { useState, useEffect } from 'react';
import Modal from './Modal';
import './Calendar.css';
import { useParams } from 'react-router-dom';


interface Appointment {
    day_of_week: number; // Index of the day in the week (0-6)
    time: string; // Time as a string, e.g., "14:30"
    title: string; // Title of the appointment
    user_id: string; // Unique identifier for the user
}

export default function CustomCalendar() {
    const [appointments, setAppointments] = useState<Appointment[]>([]); // Explicitly type appointments
    const [modalVisible, setModalVisible] = useState(false);
    const [currentSlot, setCurrentSlot] = useState<Appointment | null>(null); // Explicitly type currentSlot

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentWeek = Array.from({ length: 7 }, (_, i) => new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + i)));
    const { uid } = useParams();
    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        console.log(uid); // Replace with the actual user ID
        const url = `https://curo-156q.onrender.com/api/appointments-fetch?user_id=${uid}`;

        try {
            console.log("Fetching appointments from the API...");

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch appointments: ${response.statusText}`);
            }

            const data = await response.json();
            console.log("Fetched appointments:", data);

            if (Array.isArray(data)) {
                setAppointments(data);
                console.log("Appointments state updated successfully:", data);
            } else {
                throw new Error("Invalid data format from API");
            }
        } catch (error) {
            console.error("Error fetching appointments:", error);
            setAppointments([]); // Ensure the app doesn't break
        }
    };

    const handleSlotClick = (day: number, time: string) => {
        console.log(`Slot clicked - Day: ${day}, Time: ${time}`);

        // Include `user_id` when setting the current slot
        setCurrentSlot({ day_of_week: day, time, title: '', user_id: uid || '' });

        console.log("Current slot set:", { day_of_week: day, time, title: '', user_id: uid });
        setModalVisible(true);
        console.log("Modal visibility set to true.");
    };

    const handleSaveAppointment = async (title: string) => {
        if (!currentSlot) {
            console.warn("No current slot selected. Cannot save appointment.");
            return;
        }

        const { day_of_week, time, user_id } = currentSlot;

        // Validate required fields
        if ((!day_of_week && day_of_week !== 0) || !time || !user_id) {
            console.error("Missing required fields in currentSlot:", { day_of_week, time, user_id });
            return;
        }

        const newAppointment: Appointment = { ...currentSlot, title };
        console.log("Saving new appointment:", newAppointment);

        try {
            const response = await fetch("https://curo-156q.onrender.com/api/appointments-save", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newAppointment),
            });
            console.log(response.ok);

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Error saving appointment:", errorData);
                return;
            }

            const savedAppointment = await response.json();
            console.log("Appointment saved successfully:", savedAppointment);

            setAppointments((prevAppointments) => [...prevAppointments, savedAppointment]);
            console.log("Appointments state updated with the new appointment:", savedAppointment);
        } catch (error) {
            console.error("Error saving appointment:", error);
        } finally {
            setModalVisible(false);
            console.log("Modal visibility set to false in finally block.");
            fetchAppointments();
        }

    };

    return (
        <div className="calendar">
            <Modal
                show={modalVisible}
                onClose={() => setModalVisible(false)}
                onSave={handleSaveAppointment}
            />
            <div className="calendar-header">
                <div className="time-label-header"></div>
                {daysOfWeek.map((day, index) => (
                    <div key={index} className="calendar-day-header">
                        {day}
                    </div>
                ))}
            </div>
            <div className="calendar-body">
                <div className="time-label-column">
                    {Array.from({ length: 24 }, (_, hour) => (
                        <div key={hour} className="time-label-hour">
                            {hour}:00
                        </div>
                    ))}
                </div>
                {currentWeek.map((_, dayIndex) => (
                    <div key={dayIndex} className="calendar-day">
                        {Array.from({ length: 24 }, (_, hour) => (
                            <div key={hour} className="calendar-hour">
                                {Array.from({ length: 4 }, (_, quarter) => (
                                    <div
                                        key={quarter}
                                        className="calendar-quarter"
                                        onClick={(e) => {
                                            const cellHeight = e.currentTarget.clientHeight;
                                            const offsetY = e.nativeEvent.offsetY;
                                            const nearestMinutes = Math.round(offsetY / (cellHeight / 4)) * 15;
                                            handleSlotClick(dayIndex, `${hour}:${nearestMinutes}`);
                                        }}
                                    >
                                        {appointments
                                            .filter((appt) => appt.day_of_week === dayIndex && appt.time === `${hour}:${quarter * 15}`)
                                            .map((appt, i) => (
                                                <div key={i} className="appointment">
                                                    {appt.title}
                                                </div>
                                            ))}

                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
