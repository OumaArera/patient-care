import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaChartBar, FaPills, FaNewspaper, FaUser, FaSignOutAlt, FaUsers,
  FaUserPlus, FaUserTimes, FaUndo, FaChartPie, FaLock, FaHospital,
  FaUserInjured, FaMapMarkerAlt, FaDatabase, FaUserCheck, FaCalendarAlt
} from "react-icons/fa";
import Updates from "./Updates";
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
import Charts from "./Charts";
import AllCharts from "./AllCharts";
import PatientManager from "./PatientManagers";
import ChangePassword from "./ChangePassword";
import LandingPage from "./LandingPage";
import MedAdministration from "./MedAdministration";
import Appointments from "./Appointments";
import Vitals from "./Vitals";
import logo1 from "./assets/1ST EDMONDS_LOGO.png";
import logo2 from './assets/BSC-LOGO.png';
import LeaveManagement from "./LeaveManagement";

const SuperUserDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showLeaves, setShowLeaves] = useState(false);
  const [showUtilities, setShowUtilities] = useState(false);
  const navigate = useNavigate();

  const menuRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current && !menuRef.current.contains(event.target) &&
        modalRef.current && !modalRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
        
        // Only close the ChangePassword modal if it's open and the click is outside it
        if (showChangePassword) {
          setShowChangePassword(false);
        }
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showChangePassword]); // Add showChangePassword as a dependency
  

  // Retrieve logged-in user info
  const fullName = localStorage.getItem("fullName") || "Super User";

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 p-5 flex flex-col">
      <div className="flex justify-evenly items-start space-x-4">
        <img src={logo1} alt="Logo 1" className="h-24 object-contain" />
        <img src={logo2} alt="Logo 2" className="h-24 object-contain" />
      </div>
        <h1 className="text-xl font-bold text-blue-500 mb-2">Workflow</h1>

        {/* Sidebar Buttons */}
        <button className={`p-3 flex items-center gap-2 ${activeTab === "dashboard" ? "text-blue-500" : "text-gray-400"} hover:text-blue-500`} onClick={() => setActiveTab("dashboard")}>
          <FaUser /> Dashboard
        </button>
        <button className={`p-3 flex items-center gap-2 ${activeTab === "charts" ? "text-blue-500" : "text-gray-400"} hover:text-blue-500`} onClick={() => setActiveTab("charts")}>
          <FaChartBar /> Charts
        </button>
        <button className={`p-3 flex items-center gap-2 ${activeTab === "allCharts" ? "text-blue-500" : "text-gray-400"} hover:text-blue-500`} onClick={() => setActiveTab("allCharts")}>
          <FaChartBar /> All Charts
        </button>
        <button className={`p-3 flex items-center gap-2 ${activeTab === "medications" ? "text-blue-500" : "text-gray-400"} hover:text-blue-500`} onClick={() => setActiveTab("medications")}>
          <FaPills /> Medications
        </button>
        <button className={`p-3 flex items-center gap-2 ${activeTab === "updates" ? "text-blue-500" : "text-gray-400"} hover:text-blue-500`} onClick={() => setActiveTab("updates")}>
          <FaNewspaper /> Updates
        </button>
        <button className={`p-3 flex items-center gap-2 ${activeTab === "vitals" ? "text-blue-500" : "text-gray-400"} hover:text-blue-500`} onClick={() => setActiveTab("vitals")}>
          <FaUserTimes /> Vitals
        </button>
        <button className={`p-3 flex items-center gap-2 ${activeTab === "appointments" ? "text-blue-500" : "text-gray-400"} hover:text-blue-500`} onClick={() => setActiveTab("appointments")}>
          <FaCalendarAlt /> Appointments
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
              {/* <button className="p-2 flex items-center gap-2 hover:text-blue-500" onClick={() => setActiveTab("users")}>
                <FaUsers /> Users
              </button> */}
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
                <FaUserInjured /> Residents
              </button>
              <button className="p-2 flex items-center gap-2 hover:text-blue-500" onClick={() => setActiveTab("branches")}>
                <FaMapMarkerAlt /> Branches
              </button>
              <button className="p-2 flex items-center gap-2 hover:text-blue-500" onClick={() => setActiveTab("chartData")}>
                <FaChartPie /> Chart Data
              </button>
              {/* <button className="p-2 flex items-center gap-2 hover:text-blue-500" onClick={() => setActiveTab("chartDataUpdate")}>
                <FaUserTimes /> Chart Data Update
              </button> */}
              <button className="p-2 flex items-center gap-2 hover:text-blue-500" onClick={() => setActiveTab("medicationsAdmin")}>
                <FaPills /> Create Medication
              </button>
              {/* <button className="p-2 flex items-center gap-2 hover:text-blue-500" onClick={() => setActiveTab("appointments")}>
                <FaCalendarAlt /> Appointments
              </button> */}
              <button className="p-2 flex items-center gap-2 hover:text-blue-500" onClick={() => setActiveTab("assignPatient")}>
                <FaUserCheck /> Assign Resident
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
          <div className="flex items-center space-x-6">
            {/* Staff Icon */}
            <button 
              className="flex flex-col items-center cursor-pointer"
              onClick={() => setShowStaff(true)}
            >
              <FaUser className="text-blue-400 text-xl" />
              <span className="text-sm text-gray-400">Staff</span>
            </button>

            {/* Utilities Icon */}
            <button 
              className="flex flex-col items-center cursor-pointer"
              onClick={() => setShowUtilities(true)}
            >
              <FaNewspaper className="text-blue-400 text-xl" />
              <span className="text-sm text-gray-400">Utilities</span>
            </button>

            {/* User Dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-lg hover:bg-gray-700"
              >
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
        </div>

        {activeTab === "assignPatient" && <PatientManager />}
        {activeTab === "updates" && <Updates />}
        {activeTab === "appointments" && <Appointments />}
        {activeTab === "createUser" && <CreateUser />}
        {activeTab === "manageUser" && <ManageUser />}
        {activeTab === "users" && <Users />}
        {activeTab === "facilities" && <Facilities />}
        {activeTab === "branches" && <Branches />}    
        {activeTab === "patients" && <Patients />}
        {activeTab === "medicationsAdmin" && <Medication />}
        {activeTab === "chartData" && <ChartData />}
        {activeTab === "chartDataUpdate" && <ChartDataCard />}  
        {activeTab === "charts" && <Charts />}  
        {activeTab === "allCharts" && <AllCharts />}  
        {activeTab === "medications" && <MedAdministration />}  
        {activeTab === "dashboard" && <LandingPage />}
        {activeTab === "vitals" && <Vitals />}

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
        {showLeaves &&(
          <div
              className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50"
              onClick={() => setShowLeaves(false)}
          >
              <div
              className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-[60vw] max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              >
              <LeaveManagement  />
              <button
                  className="absolute top-2 right-2 text-white hover:text-gray-400"
                  onClick={() => setShowLeaves(false)}
              >
                  ✖
              </button>
              </div>
          </div>
          )}
      </div>
    </div>
  );
};

export default SuperUserDashboard;
