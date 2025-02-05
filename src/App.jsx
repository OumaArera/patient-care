import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Login from "./Login";
import CareGiverDashboard from "./CareGiverDashboard";
import SuperUserDashboard from "./SuperUserDashboard";
import ManagerDashboard from "./ManagerDashboard";
import ProtectedRoute from "./ProtectedRoute";
import CreateUser from "./CreateUser";

function App() {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (!storedRole) {
      setUserRole(null);
    } else {
      setUserRole(storedRole);
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Redirect to home (Login) if user reloads without a role */}
        {!userRole && <Route path="*" element={<Navigate to="/" />} />}

        <Route element={<ProtectedRoute allowedRoles={["care giver"]} />}>
          <Route path="/care-giver" element={<CareGiverDashboard role="care giver" />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["superuser"]} />}>
          <Route path="/createUser" element={<CreateUser role="superuser" />} />
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
