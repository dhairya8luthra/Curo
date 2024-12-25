import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CuroLandingPage from "./pages/landing";
import AuthPage from "./pages/signin";
import UserDashboard from "./pages/userdashboard";
import Dashboard from "./pages/Dashboard";
function App() {
  

  return (
    <>
    <Router>
    <Routes>
      <Route path="/" element={<CuroLandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/userdashboard/:uid" element={<Dashboard />} />



    </Routes>
    </Router>
      
    </>
  )
}

export default App
