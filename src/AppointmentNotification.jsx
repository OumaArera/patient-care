// components/AppointmentNotification.js
import React, { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { getUpcomingAppointments } from "../services/appointmentServices";

const AppointmentNotification = () => {
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(false);
  const notificationRef = useRef(null);

  useEffect(() => {
    fetchUpcomingAppointments();
    
    // Set up an interval to check for upcoming appointments every 30 minutes
    const intervalId = setInterval(fetchUpcomingAppointments, 30 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    // Add event listener to close notifications when clicking outside
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchUpcomingAppointments = async () => {
    setLoading(true);
    try {
      const appointments = await getUpcomingAppointments(10);
      setUpcomingAppointments(appointments);
    } catch (error) {
      console.error("Error fetching upcoming appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate days until appointment
  const getDaysUntil = (dateString) => {
    const today = new Date();
    const appointmentDate = new Date(dateString);
    
    // Reset time part to compare just the dates
    today.setHours(0, 0, 0, 0);
    appointmentDate.setHours(0, 0, 0, 0);
    
    const diffTime = appointmentDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  // Get appropriate color based on urgency
  const getUrgencyColor = (days) => {
    if (days <= 2) return "text-red-500";
    if (days <= 5) return "text-yellow-500";
    return "text-blue-400";
  };

  return (
    <div className="relative" ref={notificationRef}>
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative flex flex-col items-center"
      >
        <Bell className="text-blue-400 text-xl" />
        {upcomingAppointments.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs flex items-center justify-center w-4 h-4">
            {upcomingAppointments.length}
          </span>
        )}
        <span className="text-sm text-gray-400">Notifications</span>
      </button>

      {showNotifications && (
        <div className="absolute z-50 right-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          <div className="p-3 border-b border-gray-700 font-bold">
            Upcoming Appointments ({upcomingAppointments.length})
          </div>
          
          {loading ? (
            <div className="p-4 text-center text-gray-400">Loading...</div>
          ) : upcomingAppointments.length > 0 ? (
            <div className="max-h-64 overflow-y-auto">
              {upcomingAppointments.map((appointment) => {
                const daysUntil = getDaysUntil(appointment.nextAppointmentDate);
                const urgencyClass = getUrgencyColor(daysUntil);
                
                return (
                  <div 
                    key={appointment.appointmentId}
                    className="p-3 border-b border-gray-700 hover:bg-gray-700"
                  >
                    <div className="font-semibold">{appointment.patientName}</div>
                    <div className="text-sm">
                      <span className={urgencyClass}>
                        {daysUntil === 0 
                          ? "Today" 
                          : daysUntil === 1 
                          ? "Tomorrow" 
                          : `In ${daysUntil} days`}
                      </span>
                      {" - "}
                      {formatDate(appointment.nextAppointmentDate)}
                    </div>
                    <div className="text-sm text-gray-400">{appointment.type}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-400">
              No upcoming appointments in the next 10 days
            </div>
          )}
          
          <div className="p-2 border-t border-gray-700">
            <button 
              onClick={fetchUpcomingAppointments}
              className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
            >
              Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentNotification;