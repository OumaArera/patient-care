import React, { useState, useEffect } from "react";
import { errorHandler } from "../services/errorHandler";
import { postAppointments } from "../services/postAppointments";
import { getAppointments } from "../services/getAppointments";
import { Loader } from "lucide-react";

const Appointment = ({ patientId }) => {
  const [dateTaken, setDateTaken] = useState("");
  const [nextAppointmentDate, setNextAppointmentDate] = useState("");
  const [details, setDetails] = useState("");
  const [type, setType] = useState("");
  const [errors, setErrors] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const appointmentsPerPage = 10;

  const indexOfLastAppointment = currentPage * appointmentsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
  const currentAppointments = appointments.slice(indexOfFirstAppointment, indexOfLastAppointment);

  const totalPages = Math.ceil(appointments.length / appointmentsPerPage);

  

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

  
  const fetchAppointments = () =>{
    setLoadingAppointments(true);
    getAppointments(patientId)
      .then((data) => {
        setAppointments(data);
      })
      .catch(() => {})
      .finally(() => setLoadingAppointments(false));
  }
  useEffect(() => {
    fetchAppointments();
  }, []);


  const validateAndSubmit = async () => {
    let validationErrors = [];

    if (!dateTaken || !type) {
      validationErrors.push("Please fill in all required fields.");
    }

    if (nextAppointmentDate) {
      if (new Date(nextAppointmentDate) <= new Date(dateTaken)) {
        validationErrors.push("Next appointment date must be later than the selected date.");
      }
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    const payload = {
      patient: patientId,
      dateTaken,
      type,
      ...(nextAppointmentDate && { nextAppointmentDate }),
      ...(details && { details }),
    };

    try {
      const response = await postAppointments(payload);
      if (response?.error) {
        setErrors(errorHandler(response.error));
        setTimeout(() => setErrors([]), 5000);
      } else {
        setMessage("Appointment marked successfully.");
        fetchAppointments();
        setDateTaken("");
        setDetails("");
        setNextAppointmentDate("");
        setTimeout(() => setMessage(""), 30000);
      }
    } catch (error) {
      setErrors([`Errors: ${error}`]);
      setTimeout(() => setErrors([]), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-900 text-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Schedule Appointment</h2>
  
      {/* Form Section */}
      <div className="mb-6">
        <label className="block mb-2">Date of Appointment:</label>
        <input
          type="date"
          value={dateTaken}
          onChange={(e) => setDateTaken(e.target.value)}
          className="mb-4 p-2 border border-gray-700 rounded bg-gray-800 text-white w-full"
        />
  
        <label className="block mb-2">Next Appointment Date (Optional):</label>
        <input
          type="date"
          value={nextAppointmentDate}
          onChange={(e) => setNextAppointmentDate(e.target.value)}
          className="mb-4 p-2 border border-gray-700 rounded bg-gray-800 text-white w-full"
        />
  
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
  
        <button
          onClick={validateAndSubmit}
          className="w-full px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 transition disabled:bg-gray-500"
          disabled={!dateTaken || !type}
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </div>
  
      {/* Table Section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Appointment History</h2>
  
        {loadingAppointments ? (
          <div className="flex justify-center items-center space-x-2">
            <Loader className="animate-spin text-blue-400" size={24} />
            <p className="text-gray-400">Loading appointments...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-700">
              <thead>
                <tr className="bg-gray-800">
                  <th className="border border-gray-700 p-2 text-left">Resident Name</th>
                  <th className="border border-gray-700 p-2 text-left">Date Taken</th>
                  <th className="border border-gray-700 p-2 text-left">Type</th>
                  <th className="border border-gray-700 p-2 text-left">Other Details</th>
                  <th className="border border-gray-700 p-2 text-left">Next Appointment Date</th>
                </tr>
              </thead>
              <tbody>
                {currentAppointments.length > 0 ? (
                  currentAppointments.reduce((acc, curr, index, array) => {
                    const prev = array[index - 1];
                    const showName = !prev || prev.patientName !== curr.patientName;
                    acc.push(
                      <tr key={curr.appointmentId} className="border border-gray-700">
                        {showName ? (
                          <td
                            className="border border-gray-700 p-2 font-semibold align-middle"
                            rowSpan={array.filter((appt) => appt.patientName === curr.patientName).length}
                          >
                            {curr.patientName}
                          </td>
                        ) : null}
                        <td className="border border-gray-700 p-2">
                          {new Date(new Date(curr.dateTaken + "T00:00:00Z").setDate(new Date(curr.dateTaken + "T00:00:00Z").getDate() ))
                            .toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              timeZone: "UTC", 
                            })}
                          
                          </td>
                        <td className="border border-gray-700 p-2">{curr.type}</td>
                        <td className="border border-gray-700 p-2">{curr.details || ""}</td>
                        <td className="border border-gray-700 p-2">
                        {curr.nextAppointmentDate ?
                          new Date(new Date(curr.nextAppointmentDate + "T00:00:00Z").setDate(new Date(curr.nextAppointmentDate + "T00:00:00Z").getDate() ))
                            .toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              timeZone: "UTC",
                            }): "No appointment scheduled"}
                        </td>
                      </tr>
                    );
                    return acc;
                  }, [])
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center p-4">No appointments available.</td>
                  </tr>
                )}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="flex justify-center mt-4 space-x-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 bg-gray-800 text-white rounded">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
  
};

export default Appointment;
