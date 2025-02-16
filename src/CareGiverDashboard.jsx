import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaChartBar, FaPills, FaNewspaper, FaUser, FaSignOutAlt, FaLock, FaChevronDown, FaChevronUp
} from "react-icons/fa";
import Updates from "./Updates";
import handleLogout from "./Logout";
import ChangePassword from "./ChangePassword";
import ChartPatient from "./ChartPatient";
import ChartMedication from "./ChartMedication";
import LandingPage from "./LandingPage";

const CareGiverDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [updatesOpen, setUpdatesOpen] = useState(false); // State for opening submenu
  const navigate = useNavigate();

  // Ref for user menu and modal
  const menuRef = useRef(null);
  const modalRef = useRef(null);

  // Close menu and modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current && !menuRef.current.contains(event.target) &&
        modalRef.current && !modalRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
        setShowChangePassword(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Retrieve logged-in user info
  const fullName = localStorage.getItem("fullName") || "Caregiver";

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 p-5 flex flex-col">
        <h1 className="text-xl font-bold text-blue-500 mb-6">Workflow</h1>

        {/* Sidebar Buttons */}
        <button 
          className={`p-3 flex items-center gap-2 ${activeTab === "dashboard" ? "text-blue-500" : "text-gray-400"} hover:text-blue-500`} 
          onClick={() => setActiveTab("dashboard")}
        >
          <FaUser /> Dashboard
        </button>
        <button 
          className={`p-3 flex items-center gap-2 ${activeTab === "charts" ? "text-blue-500" : "text-gray-400"} hover:text-blue-500`} 
          onClick={() => setActiveTab("charts")}
        >
          <FaChartBar /> Charts
        </button>

        {/* Updates Button with Toggle */}
        <button
          className={`p-3 flex items-center justify-between gap-2 ${updatesOpen || activeTab.includes("updates") ? "text-blue-500" : "text-gray-400"} hover:text-blue-500`}
          onClick={() => setUpdatesOpen(!updatesOpen)}
        >
          <span className="flex items-center gap-2">
            <FaNewspaper /> Updates
          </span>
          {updatesOpen ? <FaChevronUp /> : <FaChevronDown />}
        </button>

        {/* Submenu for Updates */}
        {updatesOpen && (
          <div className="ml-6 flex flex-col">
            <button
              className={`p-2 pl-6 text-left ${activeTab === "weeklyUpdates" ? "text-blue-500" : "text-gray-400"} hover:text-blue-500`}
              onClick={() => {
                setActiveTab("weeklyUpdates");
                setUpdatesOpen(false);
              }}
            >
              Weekly Updates
            </button>
            <button
              className={`p-2 pl-6 text-left ${activeTab === "monthlyUpdates" ? "text-blue-500" : "text-gray-400"} hover:text-blue-500`}
              onClick={() => {
                setActiveTab("monthlyUpdates");
                setUpdatesOpen(false);
              }}
            >
              Monthly Updates
            </button>
          </div>
        )}

        <button 
          className={`p-3 flex items-center gap-2 ${activeTab === "medications" ? "text-blue-500" : "text-gray-400"} hover:text-blue-500`} 
          onClick={() => setActiveTab("medications")}
        >
          <FaPills /> Medications
        </button>
        <button 
          className={`p-3 flex items-center gap-2 ${activeTab === "medications" ? "text-blue-500" : "text-gray-400"} hover:text-blue-500`} 
          onClick={() => setActiveTab("appointments")}
        >
          <FaPills /> Appointments
        </button>
      </div>
      

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center border-b border-gray-700 pb-4">
          <h2 className="text-xl font-semibold">Dashboard</h2>

          {/* User Dropdown */}
          <div className="relative" ref={menuRef}>
            <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-lg hover:bg-gray-700">
              <FaUser className="text-blue-400" />
              <span>{fullName}</span>
            </button>

            {menuOpen && (
              <div className="absolute z-50 right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg">
                <p className="p-3 border-b border-gray-700">{fullName}</p>
                <button 
                  className="flex w-full px-4 py-2 text-yellow-400 hover:bg-gray-700" 
                  onClick={() => setShowChangePassword(true)}
                >
                  <FaLock className="mr-2" /> Change Password
                </button>
                <button 
                  onClick={() => handleLogout(navigate)} 
                  className="flex w-full px-4 py-2 text-red-500 hover:bg-gray-700"
                >
                  <FaSignOutAlt className="mr-2" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Content Rendering */}
        {activeTab === "weeklyUpdates" && <Updates type="weekly" />}
        {activeTab === "monthlyUpdates" && <Updates type="monthly" />}
        {activeTab === "charts" && <ChartPatient />}  
        {activeTab === "medications" && <ChartMedication />}  
        {activeTab === "dashboard" && <LandingPage />}  

        {/* Change Password Overlay (only inside user menu) */}
        {showChangePassword && (
          <div ref={modalRef} className="absolute right-0 mt-2 w-64 bg-gray-900 p-4 rounded-lg shadow-lg z-50 border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4">Change Password</h3>
            <ChangePassword onClose={() => setShowChangePassword(false)} />
            <button 
              onClick={() => setShowChangePassword(false)} 
              className="mt-4 w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CareGiverDashboard;
