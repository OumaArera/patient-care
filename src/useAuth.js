import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import handleLogout from "./Logout";

const INACTIVITY_TIMEOUT = 2 * 60 * 1000;

const useAuth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleActivity = () => {
      localStorage.setItem("lastActivity", Date.now());
    };

    // Check for session expiration on page load
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const role = decoded.role;
        const lastActivity = localStorage.getItem("lastActivity");

        if (!lastActivity || Date.now() - lastActivity > INACTIVITY_TIMEOUT) {
            handleLogout();
        } else {
          localStorage.setItem("lastActivity", Date.now());
        }

        // Add event listeners to track activity
        window.addEventListener("mousemove", handleActivity);
        window.addEventListener("keydown", handleActivity);
      } catch (error) {
        handleLogout();
      }
    } else {
        handleLogout();
    }

    const checkInactivity = setInterval(() => {
      const lastActivity = localStorage.getItem("lastActivity");
      if (lastActivity && Date.now() - lastActivity > INACTIVITY_TIMEOUT) {
        handleLogout();
      }
    }, 60000);

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      clearInterval(checkInactivity);
    };
  }, [navigate]);
};

export default useAuth;
