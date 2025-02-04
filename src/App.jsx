// import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from "./Login";
import Dashboard from "./Dashboard";
import CareGiverDashboard from './CareGiverDashboard';
import SuperUserDashboard from './SuperUserDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/care giver" element={<CareGiverDashboard role="Caregiver" />} />
        <Route path="/manager" element={<Dashboard role="Manager" />} />
        <Route path="/superuser" element={<SuperUserDashboard role="Superuser" />} />
      </Routes>
    </Router>
  );
}

export default App;