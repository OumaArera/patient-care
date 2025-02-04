import { useState } from "react";
import { FaChartBar, FaPills, FaNewspaper, FaUser } from "react-icons/fa";
import ApprovedCharts from "./ApprovedCharts";
import ApprovedMedications from "./ApprovedMedications";
import Updates from "./Updates";
import Statistics from "./Statistics";

const ManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState("charts");
  const [menuOpen, setMenuOpen] = useState(false);
  const fullName = localStorage.getItem("fullName") || "Manager";

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 p-5 flex flex-col">
        <h1 className="text-xl font-bold text-blue-500 mb-6">Manager Panel</h1>

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
          <FaChartBar /> Statistics
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
          </div>
        </div>

        {/* Render Selected Component */}
        <div className="mt-6">
          {activeTab === "charts" && <ApprovedCharts />}
          {activeTab === "medications" && <ApprovedMedications />}
          {activeTab === "updates" && <Updates />}
          {activeTab === "statistics" && <Statistics />}
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;