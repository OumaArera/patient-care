import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaChartBar, FaPills, FaNewspaper, FaUser, FaSignOutAlt, FaUsers, FaUserPlus, FaUserTimes, FaUndo, FaChartPie } from "react-icons/fa";
import PendingCharts from "./PendingCharts";
import ApprovedCharts from "./ApprovedCharts";
import PendingMedications from "./PendingMedications";
import ApprovedMedications from "./ApprovedMedications";
import Updates from "./Updates";
import Statistics from "./Statistics";
import UserManagement from "./UserManagement";
import handleLogout from "./Logout";

const SuperUserDashboard = () => {
  const [activeTab, setActiveTab] = useState("pendingCharts");
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Retrieve logged-in user info
  const fullName = localStorage.getItem("fullName") || "Super User";

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 p-5 flex flex-col">
        <h1 className="text-xl font-bold text-blue-500 mb-6">Workflow</h1>
        
        <button className={`p-3 flex items-center gap-2 ${activeTab === "pendingCharts" ? "text-blue-500" : "text-gray-400"} hover:text-blue-500`} onClick={() => setActiveTab("pendingCharts")}>
          <FaChartBar /> Pending Charts
        </button>
        <button className={`p-3 flex items-center gap-2 ${activeTab === "approvedCharts" ? "text-blue-500" : "text-gray-400"} hover:text-blue-500`} onClick={() => setActiveTab("approvedCharts")}>
          <FaChartBar /> Approved Charts
        </button>
        <button className={`p-3 flex items-center gap-2 ${activeTab === "pendingMedications" ? "text-blue-500" : "text-gray-400"} hover:text-blue-500`} onClick={() => setActiveTab("pendingMedications")}>
          <FaPills /> Pending Medications
        </button>
        <button className={`p-3 flex items-center gap-2 ${activeTab === "approvedMedications" ? "text-blue-500" : "text-gray-400"} hover:text-blue-500`} onClick={() => setActiveTab("approvedMedications")}>
          <FaPills /> Approved Medications
        </button>
        <button className={`p-3 flex items-center gap-2 ${activeTab === "updates" ? "text-blue-500" : "text-gray-400"} hover:text-blue-500`} onClick={() => setActiveTab("updates")}>
          <FaNewspaper /> Updates
        </button>
        <button className={`p-3 flex items-center gap-2 ${activeTab === "statistics" ? "text-blue-500" : "text-gray-400"} hover:text-blue-500`} onClick={() => setActiveTab("statistics")}>
          <FaChartPie /> Statistics
        </button>

        {/* User Management Dropdown */}
        <div>
          <button className="p-3 flex items-center gap-2 text-gray-400 hover:text-blue-500 w-full text-left" onClick={() => setUserMenuOpen(!userMenuOpen)}>
            <FaUsers /> User Management
          </button>
          {userMenuOpen && (
            <div className="ml-5 flex flex-col text-gray-300">
              <button className="p-2 hover:text-blue-500" onClick={() => setActiveTab("createUser")}><FaUserPlus /> Create User</button>
              <button className="p-2 hover:text-blue-500" onClick={() => setActiveTab("resetUser")}><FaUndo /> Reset User</button>
              <button className="p-2 hover:text-blue-500" onClick={() => setActiveTab("blockUser")}><FaUserTimes /> Block User</button>
              <button className="p-2 hover:text-blue-500" onClick={() => setActiveTab("unblockUser")}><FaUser /> Unblock User</button>
              <button className="p-2 hover:text-blue-500" onClick={() => setActiveTab("users")}><FaUsers /> Users</button>
            </div>
          )}
        </div>
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
                <button onClick={() => handleLogout(navigate)} className="flex w-full px-4 py-2 text-red-500 hover:bg-gray-700">
                  <FaSignOutAlt className="mr-2" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Render Selected Component */}
        <div className="mt-6">
          {activeTab === "pendingCharts" && <PendingCharts />}
          {activeTab === "approvedCharts" && <ApprovedCharts />}
          {activeTab === "pendingMedications" && <PendingMedications />}
          {activeTab === "approvedMedications" && <ApprovedMedications />}
          {activeTab === "updates" && <Updates />}
          {activeTab === "statistics" && <Statistics />}
          {activeTab === "createUser" && <UserManagement action="create" />}
          {activeTab === "resetUser" && <UserManagement action="reset" />}
          {activeTab === "blockUser" && <UserManagement action="block" />}
          {activeTab === "unblockUser" && <UserManagement action="unblock" />}
          {activeTab === "users" && <UserManagement action="view" />}
        </div>
      </div>
    </div>
  );
};

export default SuperUserDashboard;
