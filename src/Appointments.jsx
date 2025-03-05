import React, { useEffect, useState } from "react";
import { getAppointments } from "../services/getAppointments";
import { fetchPatients } from "../services/fetchPatients";
import { Loader } from "lucide-react";

const Appointments = () => {
  const [residents, setResidents] = useState([]);
  const [loadingResidents, setLoadingResidents] = useState(false);
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [selectedResident, setSelectedResident] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBranch, setSelectedBranch] = useState("");
  const branchNames = [...new Set(residents.map((r) => r.branchName))];
  const appointmentsPerPage = 10;

  const indexOfLastAppointment = currentPage * appointmentsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
  const currentAppointments = appointments.slice(indexOfFirstAppointment, indexOfLastAppointment);

  const totalPages = Math.ceil(appointments.length / appointmentsPerPage);

  useEffect(() => {
    setLoadingResidents(true);
    fetchPatients()
      .then((data) => {
        setResidents(Array.isArray(data.responseObject) ? data.responseObject : []);
      })
      .catch(() => {})
      .finally(() => setLoadingResidents(false));
  }, []);

  const fetchAppointments = (patientId) => {
    if (!patientId) return;
    setLoading(true);
    getAppointments(patientId)
      .then((data) => {
        setAppointments(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleResidentChange = (event) => {
    const patientId = event.target.value;
    setSelectedResident(patientId);
    fetchAppointments(patientId);
  };

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <h2 className="text-2xl font-bold mb-4 text-blue-400">Resident Appointments</h2>

      {/* Resident selection dropdown */}
      <div className="mb-4">
        {loadingResidents ? (
          <div className="flex justify-center items-center space-x-2">
            <Loader className="animate-spin text-blue-400" size={24} />
            <p className="text-gray-400">Loading residents...</p>
          </div>
        ) : (
          <div className="flex flex-col space-y-3">
          {/* Branch selection */}
          <select
            className="p-2 bg-gray-800 text-white border border-gray-700 rounded"
            onChange={(e) => setSelectedBranch(e.target.value)}
            value={selectedBranch}
          >
            <option value="">All Branches</option>
            {branchNames.map((branch, index) => (
              <option key={index} value={branch}>
                {branch}
              </option>
            ))}
          </select>

          {/* Resident selection */}
          <select
            className="p-2 bg-gray-800 text-white border border-gray-700 rounded"
            onChange={handleResidentChange}
            value={selectedResident || ""}
          >
            <option value="">Select a Resident</option>
            {residents
              .filter((r) => !selectedBranch || r.branchName === selectedBranch)
              .sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`))
              .map((r) => (
                <option key={r.patientId} value={r.patientId}>
                  {r.firstName} {r.lastName}
                </option>
              ))}
          </select>
        </div>
        )}
      </div>

      {/* Loader for appointments */}
      {loading && (
        <div className="flex justify-center items-center space-x-2 mt-4">
          <Loader className="animate-spin text-blue-400" size={24} />
          <p className="text-gray-400">Loading appointments...</p>
        </div>
      )}

      {/* Show table only when appointments are loaded */}
      {!loading && appointments.length > 0 && (
        <div className="mt-6">
          <table className="w-full border-collapse border border-gray-700 text-white">
            <thead>
              <tr className="bg-gray-800 text-blue-400">
                <th className="border border-gray-700 p-2">Resident Name</th>
                <th className="border border-gray-700 p-2">Date Taken</th>
                <th className="border border-gray-700 p-2">Type</th>
                <th className="border border-gray-700 p-2">Other Details</th>
                <th className="border border-gray-700 p-2">Next Appointment Date</th>
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
                        {new Date(new Date(curr.nextAppointmentDate + "T00:00:00Z").setDate(new Date(curr.nextAppointmentDate + "T00:00:00Z").getDate() ))
                        .toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          timeZone: "UTC",
                        })}
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
      {!loading && selectedResident && appointments.length === 0 && (
        <p className="text-gray-400 text-center mt-4">No appointments found for this resident.</p>
      )}
    </div>
  );
};

export default Appointments;
