// pages/Dashboard.js
import React from "react";
import Sidebar from "../components/ui/Layout/SideBar";
import { Input } from "@/components/ui/input";
import DashboardMap from "../components/dashboard/DashboardMap";
import UpcomingAppointments from "../components/dashboard/UpcomingAppointments";
import HealthMetrics from "../components/dashboard/HealthMetrics";
import RecentRecords from "../components/dashboard/RecentRecords";
import { useParams } from "react-router-dom";
import { Bell, Search, User, Clock, Activity, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Dashboard() {
  const [activeTab, setActiveTab] = React.useState("overview");
  const { uid } = useParams();

  const sessionUser = sessionStorage.getItem("authUser");
  const user = sessionUser ? JSON.parse(sessionUser) : null;

  return (
    <div className="flex min-h-screen w-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 ">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">
              Welcome back, {user && <span className="ml-1 font-semibold">{user.name}</span>}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input
                type="search"
                placeholder="Search..."
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

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ">
          {/* Small Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Next Appointment</p>
                  <p className="font-semibold">Today, 2:00 PM</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Heart className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Health Score</p>
                  <p className="font-semibold">92/100</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Map */}
          <Card className="col-span-2">
            <DashboardMap />
          </Card>

          {/* Appointments & Metrics */}
          <Card className="p-6">
            <UpcomingAppointments />
          </Card>
          <Card className="p-6">
            <HealthMetrics />
          </Card>

          {/* Recent Records */}
          <Card className="col-span-2 p-6">
            <RecentRecords />
          </Card>
        </div>
      </main>
    </div>
  );
}
