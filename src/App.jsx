// import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Login from "./Login";
import Dashboard from "./Dashboard";
import CareGiverDashboard from './CareGiverDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/caregiver" element={<CareGiverDashboard role="Caregiver" />} />
        <Route path="/manager" element={<Dashboard role="Manager" />} />
        <Route path="/superuser" element={<Dashboard role="Superuser" />} />
      </Routes>
    </Router>
  );
}

export default App;