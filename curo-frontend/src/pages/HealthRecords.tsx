import  { useState, useRef, useEffect } from "react";
import Sidebar from "../components/ui/Layout/SideBar";
import { Input } from "@/components/ui/input";

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
 
  const sessionUser = sessionStorage.getItem("authUser");
  const user = sessionUser ? JSON.parse(sessionUser) : null;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const handleProfileSelect = () => setShowOverlay((prev) => !prev);
 
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
      console.log("Records fetched successfully:", result.records);
    } else {
      console.error("Error fetching records:", result.error);
    }
  };
 
  useEffect(() => {  // Add this effect
    fetchRecords();
  }, []);
 
 
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
            {/* Bell Icon */}
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
      </header>
 
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Add New Record</CardTitle>
          <Button
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-500 text-white hover:bg-blue-600 flex items-center"
          >
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
        onRecordAdded={fetchRecords} />
    </main>
    </div >
  );
}