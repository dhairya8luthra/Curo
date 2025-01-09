import React, { useState } from "react";
import Sidebar from "../components/ui/Layout/SideBar";
import { Input } from "@/components/ui/input";
import { Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAuth } from "firebase/auth";
import CustomCalendar from "../components/ui/Layout/Calendar"; // Import your custom calendar component

export default function Appointments() {
    const [activeTab, setActiveTab] = useState("appointments");

    const sessionUser = sessionStorage.getItem("authUser");
    const user = sessionUser ? JSON.parse(sessionUser) : null;

    return (
        <div className="flex min-h-screen w-screen bg-gray-50">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            <main className="flex-1 flex flex-col">
                <header className="flex justify-between items-center p-4 md:p-6 bg-white border-b">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
                        {user && (
                            <p className="text-gray-600">
                                <span className="font-semibold">{user.name}'s Calendar</span>
                            </p>
                        )}
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <Input
                                type="search"
                                placeholder="Search appointments..."
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

                <div className="flex-1 p-4 md:p-6">
                    <div className="bg-white rounded-lg shadow h-full">
                        {/* Replace iframe with the custom calendar */}
                        <CustomCalendar />
                    </div>
                </div>
            </main>
        </div>
    );
}
