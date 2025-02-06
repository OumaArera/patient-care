import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaChartBar, FaPills, FaNewspaper, FaUser, FaSignOutAlt, FaUsers,
  FaUserPlus, FaUserTimes, FaUndo, FaChartPie, FaLock, FaHospital,
  FaUserInjured, FaMapMarkerAlt, FaDatabase
} from "react-icons/fa";
import PendingCharts from "./PendingCharts";
import PendingMedications from "./PendingMedications";
import Updates from "./Updates";
import Statistics from "./Statistics";
import handleLogout from "./Logout";
import CreateUser from "./CreateUser";
import ManageUser from "./ManageUser";
import Users from "./Users";
import Facilities from "./Facilities";
import Branches from "./Branches";
import Patients from "./Patients";
import Medication from "./Medication";
import ChartData from "./ChartData";
import ChartDataCard from "./ChartDataCard";

const SuperUserDashboard = () => {
  const [activeTab, setActiveTab] = useState("charts");
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Retrieve logged-in user info
  const fullName = localStorage.getItem("fullName") || "Super User";

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 p-5 flex flex-col">
        <h1 className="text-xl font-bold text-blue-500 mb-6">Workflow</h1>

        {/* Sidebar Buttons */}
        <button className={`p-3 flex items-center gap-2 ${activeTab === "charts" ? "text-blue-500" : "text-gray-400"} hover:text-blue-500`} onClick={() => setActiveTab("charts")}>
          <FaChartBar /> Charts
        </button>
        <button className={`p-3 flex items-center gap-2 ${activeTab === "medications" ? "text-blue-500" : "text-gray-400"} hover:text-blue-500`} onClick={() => setActiveTab("medications")}>
          <FaPills /> Medications
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
              <button className="p-2 flex items-center gap-2 hover:text-blue-500" onClick={() => setActiveTab("createUser")}>
                <FaUserPlus /> Create User
              </button>
              <button className="p-2 flex items-center gap-2 hover:text-blue-500" onClick={() => setActiveTab("manageUser")}>
                <FaUndo /> Manage Users
              </button>
              <button className="p-2 flex items-center gap-2 hover:text-blue-500" onClick={() => setActiveTab("users")}>
                <FaUsers /> Users
              </button>
            </div>
          )}
        </div>

        {/* Administration Dropdown */}
        <div>
          <button className="p-3 flex items-center gap-2 text-gray-400 hover:text-blue-500 w-full text-left" onClick={() => setAdminMenuOpen(!adminMenuOpen)}>
            <FaDatabase /> Administration
          </button>
          {adminMenuOpen && (
            <div className="ml-5 flex flex-col text-gray-300">
              <button className="p-2 flex items-center gap-2 hover:text-blue-500" onClick={() => setActiveTab("facilities")}>
                <FaHospital /> Facilities
              </button>
              <button className="p-2 flex items-center gap-2 hover:text-blue-500" onClick={() => setActiveTab("patients")}>
                <FaUserInjured /> Patients
              </button>
              <button className="p-2 flex items-center gap-2 hover:text-blue-500" onClick={() => setActiveTab("branches")}>
                <FaMapMarkerAlt /> Branches
              </button>
              <button className="p-2 flex items-center gap-2 hover:text-blue-500" onClick={() => setActiveTab("chartData")}>
                <FaChartPie /> Chart Data
              </button>
              <button className="p-2 flex items-center gap-2 hover:text-blue-500" onClick={() => setActiveTab("chartDataUpdate")}>
                <FaUserTimes /> Chart Data Update
              </button>
              <button className="p-2 flex items-center gap-2 hover:text-blue-500" onClick={() => setActiveTab("medicationsAdmin")}>
                <FaPills /> Medications
              </button>
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
                <button className="flex w-full px-4 py-2 text-yellow-400 hover:bg-gray-700" onClick={() => setActiveTab("changePassword")}>
                  <FaLock className="mr-2" /> Change Password
                </button>
                <button onClick={() => handleLogout(navigate)} className="flex w-full px-4 py-2 text-red-500 hover:bg-gray-700">
                  <FaSignOutAlt className="mr-2" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Content Rendering */}
        {activeTab === "charts" && <PendingCharts />}
        {activeTab === "medications" && <PendingMedications />}
        {activeTab === "updates" && <Updates />}
        {activeTab === "statistics" && <Statistics />}
        {activeTab === "createUser" && <CreateUser />}
        {activeTab === "manageUser" && <ManageUser />}
        {activeTab === "users" && <Users />}
        {activeTab === "facilities" && <Facilities />}
        {activeTab === "branches" && <Branches />}    
        {activeTab === "patients" && <Patients />}
        {activeTab === "medicationsAdmin" && <Medication />}
        {activeTab === "chartData" && <ChartData />}
        {activeTab === "chartDataUpdate" && <ChartDataCard />}  
        
      </div>
    </div>
  );
};

export default SuperUserDashboard;
