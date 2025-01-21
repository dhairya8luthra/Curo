
import { MapPin, FileText, Calendar, Settings, LogOut, Activity, MessageSquare, AlarmClock, PillBottle, BadgePercentIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useNavigate } from 'react-router-dom';
 
interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}
 
export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const sessionUser = sessionStorage.getItem("authUser");
  const user = sessionUser ? JSON.parse(sessionUser) : null;
  const navigate = useNavigate();
 
  const handleLogout = () => {
    toast((t) => (
      <div className="flex flex-col space-y-2">
        <p className="text-sm">Are you sure you want to logout?</p>
        <div className="flex space-x-2">
          <Button
            onClick={() => {
              signOut(auth)
                .then(() => {
                  sessionStorage.removeItem("authUser");
                  window.location.href = "/";
                  toast.dismiss(t.id);
                })
                .catch((error) => {
                  console.error("Firebase sign-out error:", error);
                  toast.dismiss(t.id);
                });
            }}
          >
            Yes
          </Button>
          <Button variant="outline" onClick={() => toast.dismiss(t.id)}>
            No
          </Button>
        </div>
      </div>
    ), { duration: Infinity });
  };
 
  const getButtonClass = (tabName: string) => {
    const isActive = activeTab === tabName;
    return `w-full justify-start ${isActive
        ? "bg-blue-500 !text-white hover:bg-blue-600"
        : "bg-transparent !text-gray-600 hover:!text-blue-500 hover:bg-blue-50"
      }`;
  };
 
  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col">
      <div className="flex items-center space-x-2 mb-8">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full"></div>
        <span className="text-2xl font-bold text-blue-800">Curo</span>
      </div>
 
      <nav className="space-y-2 flex-1">
        <Button
          variant={activeTab === "overview" ? "default" : "ghost"}
          className={getButtonClass("overview")}
          onClick={() => {
            setActiveTab("overview");
            navigate(`/userdashboard/${user.uid}`);
          }}
        >
          <Activity className="mr-2 h-4 w-4" />
          Overview
        </Button>
        <Button
          variant={activeTab === "hospitals" ? "default" : "ghost"}
          className={getButtonClass("hospitals")}
          onClick={() => {
            setActiveTab("hospitals");
            navigate(`/nearby-services/${user.uid}`);
          }}
        >
          <MapPin className="mr-2 h-4 w-4" />
          Find HealthCare Services
        </Button>
        <Button
          variant={activeTab === "records" ? "default" : "ghost"}
          className={getButtonClass("records")}
          onClick={() => {
            setActiveTab("records");
            navigate(`/healthrecords/${user.uid}`);
          }}
        >
          <FileText className="mr-2 h-4 w-4" />
          Health Records
        </Button>
        <Button
          variant={activeTab === "appointments" ? "default" : "ghost"}
          className={getButtonClass("appointments")}
          onClick={() => {
            setActiveTab("appointments");
            navigate(`/appointments/${user.uid}`);
          }}
        >
          <Calendar className="mr-2 h-4 w-4" />
          Appointments
        </Button>
        <Button
          variant={activeTab === "medichat" ? "default" : "ghost"}
          className={getButtonClass("medichat")}
          onClick={() => {
            setActiveTab("medichat");
            navigate(`/medichat/${user.uid}`);
          }}
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          MediChat - AI Doctor
        </Button>
        <Button
          variant={activeTab === "Medicine Reminder" ? "default" : "ghost"}
          className={getButtonClass("Medicine Reminder")}
          onClick={() => {
            setActiveTab("Medicine Reminder");
            navigate(`/reminder/${user.uid}`);
          }}
        >
          <AlarmClock className="mr-2 h-4 w-4" />
          Medicine Reminder
        </Button>
        <Button
          variant={activeTab === "Compare Medicine Prices" ? "default" : "ghost"}
          className={getButtonClass("Compare Medicine Prices")}
          onClick={() => {
            setActiveTab("Compare Medicine Prices");
            navigate(`/medicineprice/${user.uid}`);
          }}
        >
          <PillBottle className="mr-2 h-4 w-4" />
          Compare Medicine Prices
        </Button>
        <Button
          variant={activeTab === "Insurance Premium Predictor" ? "default" : "ghost"}
          className={getButtonClass("Insurance Premium Predictor")}
          onClick={() => {
            setActiveTab("Insurance Premium Predictor");
            navigate(`/premium-predictor/${user.uid}`);
          }}
        >
          <BadgePercentIcon className="mr-2 h-4 w-4" />
          Premium Predictor
        </Button>
      </nav>
 
      <div className="space-y-2 pt-4 border-t border-gray-200">
        <Button
          variant="ghost"
          className="w-full justify-start bg-blue-500 !text-white hover:bg-blue-600"
          onClick={() => {
            setActiveTab("User Profile");
            navigate(`/user-profile/${user.uid}`);
          }}
        >
          <Settings className="mr-2 h-4 w-4" />
          Profile
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start bg-red-500 !text-white hover:bg-red-600"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}