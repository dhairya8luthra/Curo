import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CuroLandingPage from "./pages/landing";
import AuthPage from "./pages/signin";
import UserDashboard from "./pages/userdashboard";
import Dashboard from "./pages/Dashboard";
import HealthRecords from "./pages/HealthRecords";
import MediChatPage from "./pages/Medichat";
import MedicineReminderPage from "./pages/Reminder";
function App() {
  

  return (
    <>
    <Router>
    <Routes>
      <Route path="/" element={<CuroLandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/userdashboard/:uid" element={<Dashboard />} />
      <Route path="/healthrecords/:uid" element={<HealthRecords />} />
      <Route path="/medichat/:uid" element={<MediChatPage />} />
      <Route path="/reminder/:uid" element={<MedicineReminderPage />} />




    </Routes>
    </Router>
      
    </>
  )
}

export default App
