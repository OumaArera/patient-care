import React, { useState } from "react";

const Appointment = ({ patientId }) => {
  const [dateTaken, setDateTaken] = useState("");
  const [nextAppointmentDate, setNextAppointmentDate] = useState("");
  const [details, setDetails] = useState("");
  const [type, setType] = useState("");
  const [error, setError] = useState("");

  const appointmentTypes = [
    "Primary Care Provider (PCP)",
    "Mental Health Provider / Physician/ Prescriber",
    "Clinician",
    "Peer Support Counsellor",
    "Counsellor",
    "Dentist",
    "Specialist",
    "Other",
  ];

  const validateAndSubmit = () => {
    if (!dateTaken || !nextAppointmentDate || !type) {
      setError("Please fill in all required fields.");
      return;
    }
    if (new Date(nextAppointmentDate) <= new Date(dateTaken)) {
      setError("Next appointment date must be later than the selected date.");
      return;
    }

    setError(""); // Clear errors if valid

    const payload = {
      patientId,
      dateTaken,
      nextAppointmentDate,
      details,
      type,
    };

    console.log("Payload:", payload);
  };

  return (
    <div className="p-6 bg-gray-900 text-white rounded-lg shadow-lg max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">Schedule Appointment</h2>

      {/* Date Taken */}
      <label className="block mb-2">Date of Appointment:</label>
      <input
        type="date"
        value={dateTaken}
        onChange={(e) => setDateTaken(e.target.value)}
        className="mb-4 p-2 border border-gray-700 rounded bg-gray-800 text-white w-full"
      />

      {/* Next Appointment Date */}
      <label className="block mb-2">Next Appointment Date:</label>
      <input
        type="date"
        value={nextAppointmentDate}
        onChange={(e) => setNextAppointmentDate(e.target.value)}
        className="mb-4 p-2 border border-gray-700 rounded bg-gray-800 text-white w-full"
      />

      {/* Type Selection */}
      <label className="block mb-2">Appointment Type:</label>
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="mb-4 p-2 bg-gray-950 text-white border border-gray-700 rounded w-full"
      >
        <option value="">Select Type</option>
        {appointmentTypes.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>

      {/* Optional Details */}
      <label className="block mb-2">Additional Details (Optional):</label>
      <textarea
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        placeholder="Enter any additional details..."
        className="mb-4 p-2 border border-gray-700 rounded bg-gray-800 text-white w-full"
      />

      {/* Error Message */}
      {error && <p className="text-red-500 mb-2">{error}</p>}

      {/* Submit Button */}
      <button
        onClick={validateAndSubmit}
        className="w-full px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 transition disabled:bg-gray-500"
        disabled={!dateTaken || !nextAppointmentDate || !type}
      >
        Submit
      </button>
    </div>
  );
};

export default Appointment;
