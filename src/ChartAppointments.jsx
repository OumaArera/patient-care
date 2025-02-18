import React, { useEffect, useState } from "react";
import { getAppointments } from "../services/getAppointments";
import { getpatientManagers } from "../services/getPatientManagers";
import { FaUserCircle } from "react-icons/fa";
import { Loader } from "lucide-react";
import Appointments from "./Appointments";

const ChartAppointments = () => {
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [patientManagers, setPatientManagers] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [viewAppointments, setViewAppointments] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    setLoadingPatients(true);
    getpatientManagers(userId)
      .then((data) => {
        setPatientManagers(data?.responseObject || []);
      })
      .catch(() => {})
      .finally(() => setLoadingPatients(false));
  }, []);

  const fetchAppointments = async (patientId) => {
    if (!patientId) return;
    setLoadingAppointments(true);
    setSelectedPatientId(patientId);
    setViewAppointments(false);
    setAppointments([]);

    try {
      const data = await getAppointments(patientId);
      setAppointments(data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const handleCloseModal = () => {
    setViewAppointments(false);
  };

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Residents</h2>
      {loadingPatients ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="animate-spin" size={32} />
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {patientManagers.map(({ patient }) => (
            <div key={patient.patientId} className="bg-gray-800 p-4 rounded-lg shadow-lg text-left">
              <FaUserCircle size={50} className="mx-auto text-blue-400 mb-3" />
              <h3 className="text-lg font-bold">{patient.firstName} {patient.lastName}</h3>
              <p className="text-sm font-bold text-gray-400">DOB: {patient.dateOfBirth}</p>
              <p className="text-sm font-bold text-gray-400">Diagnosis: {patient.diagnosis}</p>
              <p className="text-sm font-bold text-gray-400">Physician: {patient.physicianName}</p>

              <div className="flex justify-between mt-4">
                {loadingAppointments && selectedPatientId === patient.patientId ? (
                  <p className="text-sm text-gray-300">Loading appointments...</p>
                ) : appointments.length > 0 && selectedPatientId === patient.patientId ? (
                  <button
                    className="px-4 py-2 border border-blue-500 text-blue-600 rounded-md hover:bg-blue-100"
                    onClick={() => setViewAppointments(true)}
                  >
                    View Appointments
                  </button>
                ) : (
                  <button
                    className="px-4 py-2 border border-blue-500 text-blue-600 rounded-md hover:bg-blue-100"
                    onClick={() => fetchAppointments(patient.patientId)}
                  >
                    Appointments
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Overlay Modal */}
      {viewAppointments && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={handleCloseModal} 
        >
          <div
            className="relative bg-gray-900 p-6 rounded-lg shadow-lg w-[70vw] h-[80vh] overflow-y-auto border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-white hover:text-gray-400 text-xl"
              onClick={() => setViewAppointments(false)}
            >
              ✖
            </button>
            <Appointments appointments={appointments} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartAppointments;
