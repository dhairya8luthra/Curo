import React from "react";
import Sidebar from "../components/ui/Layout/SideBar";
import { useParams } from "react-router-dom";
import FindServices from "@/components/dashboard/FindServices";
 
export default function NearbyServicesPage() {
    const [activeTab, setActiveTab] = React.useState("hospitals");
    const { uid } = useParams();
 
    const sessionUser = sessionStorage.getItem("authUser");
    const user = sessionUser ? JSON.parse(sessionUser) : null;
 
    return (
        <div className="flex h-screen w-screen bg-gradient-to-br from-blue-50 to-white">
            {/* Sidebar with full height */}
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
 
            {/* Main container allowing scroll if needed */}
            <main className="flex-1 p-0 overflow-auto">
                <FindServices />
            </main>
        </div>
    );
}
 
