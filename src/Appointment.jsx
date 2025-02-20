import React, { useState } from "react";
import { errorHandler } from "../services/errorHandler";
import { postAppointments } from "../services/postAppointments";

const Appointment = ({ patientId }) => {
  const [dateTaken, setDateTaken] = useState("");
  const [nextAppointmentDate, setNextAppointmentDate] = useState("");
  const [details, setDetails] = useState("");
  const [type, setType] = useState("");
  const [errors, setErrors] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

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

  const validateAndSubmit = async () => {
    if (!dateTaken || !nextAppointmentDate || !type) {
        setErrors(["Please fill in all required fields."]);
      return;
    }
    if (new Date(nextAppointmentDate) <= new Date(dateTaken)) {
        setErrors(["Next appointment date must be later than the selected date."]);
      return;
    }

    const payload = {
      patientId,
      dateTaken,
      nextAppointmentDate,
      details,
      type,
    };
    try {
        const response = await postAppointments(payload);
        if (response?.error){
            setErrors(errorHandler(response.error));
            setTimeout(() => setErrors([]), 5000);
        }else{
            setMessage(["Appointment marked successfully."]);
            setTimeout(() => setMessage(""), 5000);
        }
    } catch (error) {
        setErrors([`Errors: ${error}`]);
        setTimeout(() => setErrors([]), 5000);
    } finally{
        setLoading(false);
    }
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

        {message && <p className="text-green-600">{message}</p>}
        {errors.length > 0 && (
          <div className="mb-4 p-3 bg-red-800 rounded">
            {errors.map((error, index) => (
              <p key={index} className="text-sm text-white">{error}</p>
            ))}
          </div>
        )}
      {/* Submit Button */}
      <button
        onClick={validateAndSubmit}
        className="w-full px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 transition disabled:bg-gray-500"
        disabled={!dateTaken || !nextAppointmentDate || !type}
      >
        {loading ? "Submitting...": "Submit"}
      </button>
    </div>
  );
};

export default Appointment;
