import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CuroLandingPage from "./pages/landing";
import AuthPage from "./pages/signin";
import UserDashboard from "./pages/userdashboard";
import Dashboard from "./pages/Dashboard";
import HealthRecords from "./pages/HealthRecords";
function App() {
  

  return (
    <>
    <Router>
    <Routes>
      <Route path="/" element={<CuroLandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/userdashboard/:uid" element={<Dashboard />} />
      <Route path="/healthrecords/:uid" element={<HealthRecords />} />
      



    </Routes>
    </Router>
      
    </>
  )
}

export default App
