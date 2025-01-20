import React, { useState, useEffect } from "react";
import Sidebar from "../components/ui/Layout/SideBar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getAuth } from "firebase/auth";
import { User, Settings, Heart, Ruler, Weight, Calendar, AlertCircle, Activity } from 'lucide-react';

export default function UserProfile() {
  const [activeTab, setActiveTab] = useState("profile");
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    bloodGroup: "",
    allergies: "",
    heartRate: "",
    bloodPressure: "",
    height: "",
    weight: "",
    dob: "",
  });

  const [isEditing, setIsEditing] = useState(false);

  const fetchUserData = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      const response = await fetch("http://localhost:3000/api/user-profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (response.ok) {
        setUserData(result.user);
      } else {
        console.error("Error fetching user data:", result.error);
      }
    } else {
      console.error("No user is signed in.");
    }
  };

  const updateUserData = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      const response = await fetch("http://localhost:3000/api/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });
      const result = await response.json();
      if (response.ok) {
        alert("Profile updated successfully!");
        setIsEditing(false);
      } else {
        console.error("Error updating profile:", result.error);
      }
    } else {
      console.error("No user is signed in.");
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const getFieldIcon = (key) => {
    const icons = {
      name: <User className="w-5 h-5 text-blue-500" />,
      email: <Settings className="w-5 h-5 text-purple-500" />,
      bloodGroup: <Activity className="w-5 h-5 text-red-500" />,
      allergies: <AlertCircle className="w-5 h-5 text-yellow-500" />,
      heartRate: <Heart className="w-5 h-5 text-red-500" />,
      bloodPressure: <Activity className="w-5 h-5 text-green-500" />,
      height: <Ruler className="w-5 h-5 text-indigo-500" />,
      weight: <Weight className="w-5 h-5 text-blue-500" />,
      dob: <Calendar className="w-5 h-5 text-purple-500" />,
    };
    return icons[key] || null;
  };

  return (
    <div className="flex h-screen w-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 flex items-center justify-center p-0">
        <div className="max-w-4xl mx-auto">
          <header className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              User Profile
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Manage your personal information and health data in one secure place.
            </p>
          </header>

          <Card className="p-8 shadow-lg bg-white/80 backdrop-blur-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.keys(userData).map((key) => (
                <div key={key} className="relative group">
                  <div className="flex items-center space-x-2 mb-1.5">
                    {getFieldIcon(key)}
                    <label className="block text-sm font-medium text-gray-700 capitalize">
                      {key.replace(/([A-Z])/g, " $1")}
                    </label>
                  </div>
                  <Input
                    type={key === "dob" ? "date" : "text"}
                    value={userData[key]}
                    disabled={!isEditing}
                    className={`mt-1 transition-all duration-200 ${
                      isEditing
                        ? "border-blue-300 hover:border-blue-400 focus:border-blue-500 focus:ring-blue-500"
                        : "bg-gray-50"
                    } ${
                      !isEditing && "cursor-not-allowed opacity-75"
                    }`}
                    onChange={(e) =>
                      setUserData({ ...userData, [key]: e.target.value })
                    }
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-8 space-x-4">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    className="px-6 hover:bg-gray-100 transition-colors duration-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={updateUserData}
                    className="px-6 bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
                  >
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="px-6 bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}