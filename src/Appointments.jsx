import { fromJSON } from "postcss";
import React, { useState } from "react";

const Appointments = ({ appointments }) => {
  if (!appointments || appointments.length === 0)
    return <p className="text-gray-400">No appointments available.</p>;

  // Get the latest appointment based on `createdAt`
  const latestAppointment = appointments.reduce(
    (latest, current) =>
      new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest,
    appointments[0]
  );

  const {
    appointmentId,
    patientId,
    patientName,
    weeklyAppointments,
    fortnightAppointments,
    monthlyAppointments,
  } = latestAppointment;

  // Helper function to check if an appointment can be updated
  const canUpdate = (date) => {
    const today = new Date();
    const appointmentDate = new Date(date);
    const diffInDays = (today - appointmentDate) / (1000 * 60 * 60 * 24);
    return diffInDays >= -2 && diffInDays <= 0; // Allow updates if today or past 2 days
  };

  // Initialize form state with original values
  const [formData, setFormData] = useState({
    weeklyAppointments: [...weeklyAppointments],
    fortnightAppointments: [...fortnightAppointments],
    monthlyAppointments: [...monthlyAppointments],
    patient: patientId,
  });

  const [attendedTo, setAttendedTo] = useState([]);

  // Handle date changes
  const handleDateChange = (type, index, newDate) => {
    setFormData((prevData) => {
      const updatedAppointments = [...prevData[type]];
      updatedAppointments[index] = { ...updatedAppointments[index], date: newDate };

      return { ...prevData, [type]: updatedAppointments };
    });

    setAttendedTo((prevAttended) => [
      ...prevAttended,
      { type, dateTaken: newDate, appointmentId, patientId },
    ]);
  };

  // Log the data when button is clicked
  const handleSubmit = () => {
    const payload ={
        weeklyAppointments: formData.monthlyAppointments,
        fortnightAppointments: formData.fortnightAppointments,
        monthlyAppointments: formData.monthlyAppointments,
        attendedTo: attendedTo
    }
    console.log("Payload: ", payload);
    console.log("Appointment ID:", appointmentId);
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
              value={formData.weeklyAppointments[index].date}
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
              value={formData.fortnightAppointments[index].date}
              disabled={!canUpdate(appt.date)}
              onChange={(e) => handleDateChange("fortnightAppointments", index, e.target.value)}
              className="bg-gray-700 text-white rounded p-2 w-full"
            />
            <p className="text-sm text-gray-400">Physician: {appt.physician}</p>
          </div>
        ))}
      </div>

      {/* Monthly Appointments */}
      <div className="mb-4 p-4 bg-gray-800 rounded-lg shadow-lg">
        <h3 className="text-lg font-bold">Monthly Appointments</h3>
        {monthlyAppointments.map((appt, index) => (
          <div key={index} className="mb-2">
            <input
              type="date"
              value={formData.monthlyAppointments[index].date}
              disabled={!canUpdate(appt.date)}
              onChange={(e) => handleDateChange("monthlyAppointments", index, e.target.value)}
              className="bg-gray-700 text-white rounded p-2 w-full"
            />
            <p className="text-sm text-gray-400">Physician: {appt.physician}</p>
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700"
      >
        Log Data
      </button>
    </div>
  );
};

export default Appointments;
