import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import CareGiverDashboard from "./CareGiverDashboard";
import SuperUserDashboard from "./SuperUserDashboard";
import ManagerDashboard from "./ManagerDashboard";
import ProtectedRoute from "./ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route element={<ProtectedRoute allowedRoles={["care giver"]} />}>
          <Route path="/care giver" element={<CareGiverDashboard role="care giver" />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["manager"]} />}>
          <Route path="/manager" element={<ManagerDashboard role="manager" />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["superuser"]} />}>
          <Route path="/superuser" element={<SuperUserDashboard role="superuser" />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
