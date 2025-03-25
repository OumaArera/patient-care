import React, { useState, useEffect } from "react";
import { 
  FaChartBar, 
  FaPills, 
  FaUserInjured, 
  FaCalendarAlt, 
  FaBell,
  FaUsers,
  FaHospital
} from "react-icons/fa";

const QuickAccessCard = ({ icon, title, count, onClick }) => (
  <div 
    onClick={onClick}
    className="bg-gray-800 p-4 rounded-lg shadow-md hover:bg-gray-700 cursor-pointer transition-all duration-300 transform hover:scale-105"
  >
    <div className="flex justify-between items-center">
      <div className="flex items-center space-x-3">
        {icon}
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      <span className="text-2xl font-bold text-blue-400">{count}</span>
    </div>
  </div>
);

const PendingNotification = ({ icon, title, description, time }) => (
  <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-blue-500 mb-2">
    <div className="flex items-center space-x-3 mb-2">
      {icon}
      <h4 className="text-md font-semibold text-white">{title}</h4>
      <span className="text-sm text-gray-400">{time}</span>
    </div>
    <p className="text-gray-300">{description}</p>
  </div>
);

const LandingPage = ({ onTabChange }) => {
  const [pendingNotifications, setPendingNotifications] = useState([
    {
      id: 1,
      icon: <FaUserInjured className="text-blue-400" />,
      title: "New Resident Admission",
      description: "John Doe needs initial assessment",
      time: "2 hours ago"
    },
    {
      id: 2,
      icon: <FaPills className="text-green-400" />,
      title: "Medication Review",
      description: "Medication inventory requires update",
      time: "4 hours ago"
    },
    {
      id: 3,
      icon: <FaCalendarAlt className="text-purple-400" />,
      title: "Pending Appointments",
      description: "3 appointments need scheduling",
      time: "1 day ago"
    }
  ]);

  const quickAccessItems = [
    {
      icon: <FaUserInjured className="text-3xl text-blue-400" />,
      title: "Manage Residents",
      count: 42,
      tab: "patients"
    },
    {
      icon: <FaCalendarAlt className="text-3xl text-green-400" />,
      title: "Appointments",
      count: 15,
      tab: "appointments"
    },
    {
      icon: <FaPills className="text-3xl text-purple-400" />,
      title: "Medication Admin",
      count: 23,
      tab: "medications"
    },
    {
      icon: <FaChartBar className="text-3xl text-yellow-400" />,
      title: "Charts",
      count: 8,
      tab: "charts"
    },
    {
      icon: <FaUsers className="text-3xl text-pink-400" />,
      title: "Staff Management",
      count: 35,
      tab: "manageUser"
    },
    {
      icon: <FaHospital className="text-3xl text-red-400" />,
      title: "Facilities",
      count: 6,
      tab: "facilities"
    }
  ];

  return (
    <div className="bg-black text-white min-h-screen p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Access Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <FaBell className="mr-3 text-blue-500" /> Quick Access
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {quickAccessItems.map((item) => (
              <QuickAccessCard 
                key={item.title}
                {...item}
                onClick={() => onTabChange(item.tab)}
              />
            ))}
          </div>
        </div>

        {/* Pending Notifications */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Pending Notifications</h2>
          {pendingNotifications.map((notification) => (
            <PendingNotification 
              key={notification.id} 
              {...notification} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;