// services/appointmentServices.js

export const getAppointments = async (patientId) => {
    try {
      const response = await fetch(
        patientId
          ? `https://patient-care-server.onrender.com/api/v1/appointments?patient=${patientId}`
          : `https://patient-care-server.onrender.com/api/v1/appointments`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return await response.json();
    } catch (error) {
      console.error("Error fetching appointments:", error);
      throw error;
    }
  };
  
  export const getAllAppointments = async () => {
    try {
      const response = await fetch(
        `https://patient-care-server.onrender.com/api/v1/appointments`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return await response.json();
    } catch (error) {
      console.error("Error fetching all appointments:", error);
      throw error;
    }
  };
  
  export const postAppointments = async (payload) => {
    try {
      const response = await fetch(
        "https://patient-care-server.onrender.com/api/v1/appointments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        }
      );
      return await response.json();
    } catch (error) {
      console.error("Error posting appointment:", error);
      throw error;
    }
  };
  
  export const updateAppointment = async (appointmentId, payload) => {
    try {
      const response = await fetch(
        `https://patient-care-server.onrender.com/api/v1/appointments/${appointmentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        }
      );
      return await response.json();
    } catch (error) {
      console.error("Error updating appointment:", error);
      throw error;
    }
  };
  
  export const getUpcomingAppointments = async (daysThreshold = 10) => {
    try {
      const allAppointments = await getAllAppointments();
      const now = new Date();
      const thresholdDate = new Date();
      thresholdDate.setDate(now.getDate() + daysThreshold);
      
      // Filter for appointments within the threshold that have nextAppointmentDate
      return allAppointments.filter(appointment => {
        if (!appointment.nextAppointmentDate) return false;
        
        const nextAppDate = new Date(appointment.nextAppointmentDate);
        return nextAppDate >= now && nextAppDate <= thresholdDate;
      });
    } catch (error) {
      console.error("Error getting upcoming appointments:", error);
      throw error;
    }
  };