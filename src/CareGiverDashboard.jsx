import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaChartBar, FaPills, FaNewspaper, FaUser, FaSignOutAlt, FaLock
} from "react-icons/fa";
import Updates from "./Updates";
import handleLogout from "./Logout";
import ChangePassword from "./ChangePassword";
import Medication from "./Medication";
import ChartPatient from "./ChartPatient";

const CareGiverDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const navigate = useNavigate();

  // Retrieve logged-in user info
  const fullName = localStorage.getItem("fullName") || "Caregiver";

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 p-5 flex flex-col">
        <h1 className="text-xl font-bold text-blue-500 mb-6">Workflow</h1>

        {/* Sidebar Buttons */}
        <button className={`p-3 flex items-center gap-2 ${activeTab === "dashboard" ? "text-blue-500" : "text-gray-400"} hover:text-blue-500`} onClick={() => setActiveTab("dashboard")}>
          <FaUser /> Dashboard
        </button>
        <button className={`p-3 flex items-center gap-2 ${activeTab === "charts" ? "text-blue-500" : "text-gray-400"} hover:text-blue-500`} onClick={() => setActiveTab("charts")}>
          <FaChartBar /> Charts
        </button>
        <button className={`p-3 flex items-center gap-2 ${activeTab === "updates" ? "text-blue-500" : "text-gray-400"} hover:text-blue-500`} onClick={() => setActiveTab("updates")}>
          <FaNewspaper /> Updates
        </button>
        <button className={`p-3 flex items-center gap-2 ${activeTab === "medications" ? "text-blue-500" : "text-gray-400"} hover:text-blue-500`} onClick={() => setActiveTab("medications")}>
          <FaPills /> Medications
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center border-b border-gray-700 pb-4">
          <h2 className="text-xl font-semibold">Dashboard</h2>

          {/* User Dropdown */}
          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-lg hover:bg-gray-700">
              <FaUser className="text-blue-400" />
              <span>{fullName}</span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg">
                <p className="p-3 border-b border-gray-700">{fullName}</p>
                <button className="flex w-full px-4 py-2 text-yellow-400 hover:bg-gray-700" onClick={() => setShowChangePassword(true)}>
                  <FaLock className="mr-2" /> Change Password
                </button>
                {showChangePassword && <ChangePassword onClose={() => setShowChangePassword(false)} />}
                <button onClick={() => handleLogout(navigate)} className="flex w-full px-4 py-2 text-red-500 hover:bg-gray-700">
                  <FaSignOutAlt className="mr-2" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Content Rendering */}
        {activeTab === "updates" && <Updates />}
        {activeTab === "changePassword" && <ChangePassword />}
        {activeTab === "charts" && <ChartPatient />}  
        {activeTab === "medications" && <Medication />}  
      </div>
    </div>
  );
};

export default CareGiverDashboard;