import { Navigate, Outlet } from "react-router-dom";
import handleLogout from "./Logout";

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || !role) {
    handleLogout();
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(role)) {
    handleLogout();
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
