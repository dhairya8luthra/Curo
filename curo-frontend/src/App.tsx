import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CuroLandingPage from "./pages/landing";
import AuthPage from "./pages/signin";
import Dashboard from "./pages/Dashboard";
import HealthRecords from "./pages/HealthRecords";
import MediChatPage from "./pages/Medichat";
import MedicineReminderPage from "./pages/Reminder";
import MedicinePricePage from "./pages/MedicinePrice";
import NearbyServicesPage from "./pages/Findservices";
import Appointments from "./pages/Appointments";
import PremiumPredictor from "./pages/PremiumPredictor";
import UserProfilePage from "./pages/UserProfile";

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
          <Route path="/medicineprice/:uid" element={<MedicinePricePage />} />
          <Route path="/nearby-services/:uid" element={<NearbyServicesPage />} />
          <Route path="/appointments/:uid" element={<Appointments />} />
          <Route path="/premium-predictor/:uid" element={<PremiumPredictor />} />
          <Route path="/user-profile/:uid" element={<UserProfilePage />} />
        </Routes>
      </Router>

    </>
  )
}

export default App