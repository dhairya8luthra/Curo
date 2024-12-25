import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CuroLandingPage from "./pages/landing";
import AuthPage from "./pages/signin";

function App() {
  

  return (
    <>
    <Router>
    <Routes>
      <Route path="/" element={<CuroLandingPage />} />
      <Route path="/auth" element={<AuthPage />} />


    </Routes>
    </Router>
      
    </>
  )
}

export default App
