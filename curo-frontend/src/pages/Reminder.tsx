import React from "react";
import Sidebar from "../components/ui/Layout/SideBar";
import { useParams } from "react-router-dom";
import { MedicineCard } from "@/components/MedicineReminder/MedicineCard";
import { AddMedicineDialog } from "@/components/MedicineReminder/AddMedicineDialog";
import { Bell } from "lucide-react";
import type { Medicine } from "../types/Medicine";
import { EditMedicineDialog } from "@/components/MedicineReminder/EditMedicineDialog";


export default function MedicineReminderPage() {
    const [activeTab, setActiveTab] = React.useState("Medicine Reminder");
    const { uid } = useParams();
    const [medicines, setMedicines] = React.useState<Medicine[]>([
      { 
        id: 1, 
        name: "Aspirin", 
        dosage: "1 tablet", 
        time: "08:00",
        days: ["Monday", "Wednesday", "Friday"]
      },
      { 
        id: 2, 
        name: "Vitamin D", 
        dosage: "2 tablets", 
        time: "09:30",
        days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
      },
      { 
        id: 3, 
        name: "Omega-3", 
        dosage: "1 capsule", 
        time: "20:00",
        days: ["Saturday", "Sunday"]
      },
    ]);
  
    const [editingMedicine, setEditingMedicine] = React.useState<Medicine | null>(null);
  
    const handleAddMedicine = (medicine: Omit<Medicine, 'id'>) => {
      setMedicines([...medicines, { id: Date.now(), ...medicine }]);
    };
  
    const handleEditMedicine = (id: number, updatedMedicine: Omit<Medicine, 'id'>) => {
      setMedicines(medicines.map((medicine) => 
        medicine.id === id ? { ...medicine, ...updatedMedicine } : medicine
      ));
    };
  
    const handleDeleteMedicine = (id: number) => {
      setMedicines(medicines.filter((medicine) => medicine.id !== id));
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