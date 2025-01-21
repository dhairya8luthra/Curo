import React, { useEffect, useState } from "react";
import Sidebar from "../components/ui/Layout/SideBar";
import { useParams } from "react-router-dom";
import { MedicineCard } from "@/components/MedicineReminder/MedicineCard";
import { AddMedicineDialog } from "@/components/MedicineReminder/AddMedicineDialog";
import { Bell } from "lucide-react";
import type { Medicine } from "../types/Medicine";
import { EditMedicineDialog } from "@/components/MedicineReminder/EditMedicineDialog";
import { getAuth } from "firebase/auth";
 
// 1) Import the Firebase objects needed for Cloud Messaging
import { messaging } from "@/lib/firebase"; // from your firebase.ts
import { getToken } from "firebase/messaging";
 
export default function MedicineReminderPage() {
  const [activeTab, setActiveTab] = useState("Medicine Reminder");
  const { uid } = useParams();
 
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [authToken, setAuthToken] = useState<string>("");
 
  /**
   * On mount, get the current user's Firebase ID token for requests
   */
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      console.error("No logged-in user. Please sign in first.");
      return;
    }
 
    user
      .getIdToken()
      .then((token) => {
        setAuthToken(token);
      })
      .catch((err) => {
        console.error("Error getting user token:", err);
      });
  }, []);
 
  /**
   * Fetch the list of reminders from your backend
   */
  const fetchReminders = async () => {
    if (!authToken) return;
 
    try {
      const res = await fetch("http://localhost:3000/api/medicine-reminder", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });
      const data = await res.json();
 
      if (data.reminders) {
        const fetchedReminders = data.reminders.map((r: any) => ({
          id: r.id,
          name: r.name,
          dosage: r.dosage,
          time: r.time,
          days: r.days,
        })) as Medicine[];
        setMedicines(fetchedReminders);
      } else if (data.error) {
        console.error("Failed to fetch reminders:", data.error);
      }
    } catch (err) {
      console.error("Error fetching reminders:", err);
    }
  };
 
  /**
   * Once we have an auth token, load the reminders
   */
  useEffect(() => {
    if (authToken) {
      fetchReminders();
    }
  }, [authToken]);
 
  /**
   * Prompt for push notification permission and update the user's FCM token in your backend
   */
  const requestNotificationPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        // Obtain the FCM browser token
        const currentToken = await getToken(messaging, {
          vapidKey: "BHpwiaGustDMjbQDHATxieQc65Fp34jhEvyCCExYNHl-QxxzeAXa6DkTPR3r3W6unmcCaYRaRGUNl_864uY0TYY", // from Firebase Console
        });
        if (currentToken) {
          console.log("FCM Token:", currentToken);
          // Send this token to your backend to store in Supabase
          await fetch("http://localhost:3000/api/users/update-fcm-token", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ fcmToken: currentToken }),
          });
        } else {
          console.log("No registration token available. Request permission to generate one.");
        }
      } else {
        console.log("Notification permission denied.");
      }
    } catch (err) {
      console.error("Error requesting notification permission:", err);
    }
  };
 
  /**
   * Add a new medicine
   * After adding, we prompt for push notifications 
   * so the user can actually receive reminders.
   */
  const handleAddMedicine = async (medicine: Omit<Medicine, "id">) => {
    if (!authToken) {
      console.error("No auth token available. Please log in first.");
      return;
    }
 
    try {
      // 1) Prompt for push notifications (won't show if already granted/denied)
      await requestNotificationPermission();
 
      // 2) Optimistic UI update
      const tempId = Date.now();
      const tempMedicine = { ...medicine, id: tempId };
      setMedicines((prev) => [...prev, tempMedicine]);
 
      // 3) POST to create the medicine in your backend
      const res = await fetch("http://localhost:3000/api/medicine-reminder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(medicine),
      });
      const data = await res.json();
 
      if (data.reminder) {
        // Replace the temporary item with the real one from the server
        setMedicines((prev) =>
          prev.map((m) => (m.id === tempId ? { ...data.reminder } : m))
        );
      } else if (data.error) {
        // If there's an error, remove the temporary item
        setMedicines((prev) => prev.filter((m) => m.id !== tempId));
        console.error("Error creating reminder:", data.error);
      }
    } catch (err) {
      console.error("Error creating reminder:", err);
    }
  };
 
  /**
   * Edit an existing medicine
   */
  const handleEditMedicine = async (id: number, updated: Omit<Medicine, "id">) => {
    if (!authToken) {
      console.error("No auth token available.");
      return;
    }
 
    try {
      // Optimistically update
      setMedicines((prev) =>
        prev.map((medicine) =>
          medicine.id === id ? { ...medicine, ...updated } : medicine
        )
      );
 
      const res = await fetch(`http://localhost:3000/api/medicine-reminder/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
 
      if (data.error) {
        console.error("Error updating reminder:", data.error);
        // revert by re-fetching
        fetchReminders();
      }
    } catch (err) {
      console.error("Error updating reminder:", err);
      fetchReminders();
    }
  };
 
  /**
   * Delete an existing medicine
   */
  const handleDeleteMedicine = async (id: number) => {
    if (!authToken) {
      console.error("No auth token available.");
      return;
    }
 
    try {
      // Optimistic removal
      setMedicines((prev) => prev.filter((medicine) => medicine.id !== id));
 
      const res = await fetch(`http://localhost:3000/api/medicine-reminder/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const data = await res.json();
 
      if (data.error) {
        console.error("Error deleting reminder:", data.error);
        // revert if needed
        fetchReminders();
      }
    } catch (err) {
      console.error("Error deleting reminder:", err);
      fetchReminders();
    }
  };
 
  return (
    <div className="flex h-screen w-screen bg-gradient-to-br from-blue-50 to-white">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Medicine Reminder</h1>
              <p className="text-gray-600 mt-2">Keep track of your daily medications</p>
            </div>
            <AddMedicineDialog onAdd={handleAddMedicine} />
          </div>
 
          {/* List of medicines */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {medicines.map((medicine) => (
              <MedicineCard
                key={medicine.id}
                {...medicine}
                onEdit={() => setEditingMedicine(medicine)}
                onDelete={() => handleDeleteMedicine(medicine.id)}
              />
            ))}
          </div>
 
          {medicines.length === 0 && (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No medicines added yet</h3>
              <p className="text-gray-600 mt-2">Add your first medicine to get started</p>
            </div>
          )}
 
          {editingMedicine && (
            <EditMedicineDialog
              medicine={editingMedicine}
              open={!!editingMedicine}
              onOpenChange={(open) => !open && setEditingMedicine(null)}
              onEdit={handleEditMedicine}
            />
          )}
        </div>
      </main>
    </div>
  );
}
