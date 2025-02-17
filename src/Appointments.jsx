import React, { useState, useEffect } from "react";

const Appointments = ({ appointments }) => {
  if (!appointments || appointments.length === 0) return <p className="text-gray-400">No appointments available.</p>;

  // Get the latest appointment based on `createdAt`
  const latestAppointment = appointments.reduce((latest, current) => 
    new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest, 
    appointments[0]
  );

  const { appointmentId, patientId, patientName, weeklyAppointments, fortnightAppointments, monthlyAppointments } = latestAppointment;

  // Helper function to check if an appointment can be updated
  const canUpdate = (date) => {
    const today = new Date();
    const appointmentDate = new Date(date);
    const diffInDays = (today - appointmentDate) / (1000 * 60 * 60 * 24);
    return diffInDays >= -2 && diffInDays <= 0; // Allow updates if today or past 2 days
  };

  // Initialize form state
  const [formData, setFormData] = useState({});
  const [attendedTo, setAttendedTo] = useState([]);

  // Handle date changes
  const handleDateChange = (type, index, newDate) => {
    setFormData((prevData) => {
      const updatedAppointments = prevData[type] ? [...prevData[type]] : [...latestAppointment[type]];
      updatedAppointments[index] = { ...updatedAppointments[index], date: newDate };

      return { ...prevData, [type]: updatedAppointments, patient: patientId };
    });

    setAttendedTo((prevAttended) => [
      ...prevAttended,
      { type, dateTaken: newDate, appointmentId },
    ]);
  };

  // Log the data when button is clicked
  const handleSubmit = () => {
    console.log("Form Data:", formData);
    console.log("Attended To:", attendedTo);
  };

  return (
    <div className="text-white">
      <h2 className="text-xl font-bold mb-4">Appointments for {patientName}</h2>

      {/* Weekly Appointments */}
      <div className="mb-4 p-4 bg-gray-800 rounded-lg shadow-lg">
        <h3 className="text-lg font-bold">Weekly Appointments</h3>
        {weeklyAppointments.map((appt, index) => (
          <div key={index} className="mb-2">
            <input
              type="date"
              value={appt.date}
              disabled={!canUpdate(appt.date)}
              onChange={(e) => handleDateChange("weeklyAppointments", index, e.target.value)}
              className="bg-gray-700 text-white rounded p-2 w-full"
            />
            <p className="text-sm text-gray-400">Physician: {appt.physician}</p>
          </div>
        ))}
      </div>

      {/* Fortnight Appointments */}
      <div className="mb-4 p-4 bg-gray-800 rounded-lg shadow-lg">
        <h3 className="text-lg font-bold">Fortnight Appointments</h3>
        {fortnightAppointments.map((appt, index) => (
          <div key={index} className="mb-2">
            <input
              type="date"
              value={appt.date}
              disabled={!canUpdate(appt.date)}
              onChange={(e) => handleDateChange("fortnightAppointments", index, e.target.value)}
              className="bg-gray-700 text-white rounded p-2 w-full"
            />
            <p className="text-sm text-gray-400">Physician: {appt.physician}</p>
          </div>
        ))}
      </div>

      {/* Monthly Appointments (View Only) */}
      <div className="mb-4 p-4 bg-gray-800 rounded-lg shadow-lg">
        <h3 className="text-lg font-bold">Monthly Appointments</h3>
        {monthlyAppointments.map((appt, index) => (
          <div key={index} className="mb-2">
            <input
              type="date"
              value={appt.date}
              disabled={true} // Monthly appointments are not editable
              className="bg-gray-700 text-gray-400 rounded p-2 w-full cursor-not-allowed"
            />
            <p className="text-sm text-gray-400">Physician: {appt.physician}</p>
          </div>
        ))}
      </div>

      {/* Submit Button */}
      {Object.keys(formData).length > 1 && (
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Log Data
        </button>
      )}
    </div>
  );
};

export default Appointments;
