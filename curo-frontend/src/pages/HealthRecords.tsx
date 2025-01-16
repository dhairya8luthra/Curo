import React, { useState,useEffect } from "react";
import Sidebar from "../components/ui/Layout/SideBar";
import { Input } from "@/components/ui/input";
import { useParams } from "react-router-dom";
import { Bell, Search, User, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import AddRecordModal from "../components/AddRecordModal";
import RecordsList from "../components/RecordsList";
import { getAuth } from "firebase/auth";
interface Record {
  id: string;
  type: string;
  details: any;
  uploaded_file_url?: string;
}
export default function HealthRecord() {
  const [activeTab, setActiveTab] = useState("records");
  const [records, setRecords] = useState<Record[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { uid } = useParams();

  const sessionUser = sessionStorage.getItem("authUser");
  const user = sessionUser ? JSON.parse(sessionUser) : null;

  const fetchRecords = async () => {  // Add this function
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      console.error("No logged-in user. Please sign in first.");
      return;
    }
    const token = await user.getIdToken();
    const response = await fetch("http://localhost:3000/api/health-records", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const result = await response.json();
    if (response.ok) {
      setRecords(result.records);
    } else {
      console.error("Error fetching records:", result.error);
    }
  };

  useEffect(() => {  // Add this effect
    fetchRecords();
  }, []);


  return (
    <div className="flex h-screen w-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 p-8 overflow-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Health Records</h1>
            <p className="text-gray-600">
              {user && <span className="ml-1 font-semibold">{user.name}'s Records</span>}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input
                type="search"
                placeholder="Search records..."
                className="pl-10 w-64"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600 hover:text-blue-500 hover:bg-blue-50"
            >
              <Bell className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600 hover:text-blue-500 hover:bg-blue-50"
            >
              <User className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Add New Record</CardTitle>
            <Button size="sm" onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Record
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Click the button above to add a new medical record to your profile.
            </p>
          </CardContent>
        </Card>

        <RecordsList records={records} setRecords={setRecords} />

        <AddRecordModal 
      isOpen={isModalOpen} 
      onClose={() => setIsModalOpen(false)}
      onRecordAdded={fetchRecords}/>
      </main>
    </div>
  );
}