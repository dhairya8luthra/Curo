import React from "react";
import {
  MapPin, FileText, Calendar, User, Bell, Settings,
  LogOut, Search, Clock, Activity, Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import DashboardMap from "../components/dashboard/DashboardMap";
import UpcomingAppointments from "../components/dashboard/UpcomingAppointments";
import HealthMetrics from "../components/dashboard/HealthMetrics";
import RecentRecords from "../components/dashboard/RecentRecords";
import { useParams } from "react-router-dom";

export default function Dashboard() {
  const [activeTab, setActiveTab] = React.useState("overview");
  const { uid } = useParams();

  const sessionUser = sessionStorage.getItem("authUser");
  const user = sessionUser ? JSON.parse(sessionUser) : null;

  return (
    <div className="flex min-h-screen w-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col">
        <div className="flex items-center space-x-2 mb-8">
          <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
          <span className="text-2xl font-bold text-blue-800">Curo</span>
        </div>

        <nav className="space-y-2 flex-1">
          <Button
            variant={activeTab === "overview" ? "default" : "ghost"}
            className={
              "w-full justify-start " +
              (activeTab === "overview"
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "text-gray-600 hover:text-blue-500 hover:bg-blue-50")
            }
            onClick={() => setActiveTab("overview")}
          >
            <Activity className="mr-2 h-4 w-4" />
            Overview
          </Button>
          <Button
            variant={activeTab === "hospitals" ? "default" : "ghost"}
            className={
              "w-full justify-start " +
              (activeTab === "hospitals"
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "text-gray-600 hover:text-blue-500 hover:bg-blue-50")
            }
            onClick={() => setActiveTab("hospitals")}
          >
            <MapPin className="mr-2 h-4 w-4" />
            Find Hospitals
          </Button>
          <Button
            variant={activeTab === "records" ? "default" : "ghost"}
            className={
              "w-full justify-start " +
              (activeTab === "records"
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "text-gray-600 hover:text-blue-500 hover:bg-blue-50")
            }
            onClick={() => setActiveTab("records")}
          >
            <FileText className="mr-2 h-4 w-4" />
            Health Records
          </Button>
          <Button
            variant={activeTab === "appointments" ? "default" : "ghost"}
            className={
              "w-full justify-start " +
              (activeTab === "appointments"
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "text-gray-600 hover:text-blue-500 hover:bg-blue-50")
            }
            onClick={() => setActiveTab("appointments")}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Appointments
          </Button>
        </nav>

        <div className="space-y-2 pt-4 border-t border-gray-200">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-600 hover:text-blue-500 hover:bg-blue-50"
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">
              Welcome back,{user && <span className="ml-1 font-semibold">{user.name}</span>}
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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