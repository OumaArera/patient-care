import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Login from "./Login";
import CareGiverDashboard from "./CareGiverDashboard";
import SuperUserDashboard from "./SuperUserDashboard";
import ManagerDashboard from "./ManagerDashboard";
import ProtectedRoute from "./ProtectedRoute";
import CreateUser from "./CreateUser";
import ManageUser from "./ManageUser";
import Users from "./Users";

function App() {
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (!storedRole) {
      setUserRole(null);
    } else {
      setUserRole(storedRole);
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Redirect to home (Login) if user reloads without a role */}
        <Route path="*" element={userRole ? <Navigate to={`/${userRole}`} /> : <Navigate to="/" />} />

        <Route element={<ProtectedRoute allowedRoles={["care giver"]} />}>
          <Route path="/care giver" element={<CareGiverDashboard role="care giver" />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["superuser"]} />}>
          <Route path="/createUser" element={<CreateUser role="superuser" />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["superuser"]} />}>
          <Route path="/manageUser" element={<ManageUser role="superuser" />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["superuser"]} />}>
          <Route path="/users" element={<Users role="superuser" />} />
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
