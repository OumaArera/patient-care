import React, { useEffect, useState } from "react";
import { getpatientManagers } from "../services/getPatientManagers";
import { FaUserCircle } from "react-icons/fa";
import { Loader } from "lucide-react";
import Appointment from "./Appointment";

const ChartAppointments = () => {
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [patientManagers, setPatientManagers] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [showAppointment, setShowAppointment] = useState(false);

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

  const closeAppointmentModal = () => {
    setShowAppointment(false);
    setSelectedPatientId(null);
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
              <h3 className="text-lg font-bold">
                {patient.firstName} {patient.lastName}
              </h3>
              <p className="text-sm font-bold text-gray-400">DOB: {patient.dateOfBirth}</p>
              <p className="text-sm font-bold text-gray-400">Diagnosis: {patient.diagnosis}</p>
              <p className="text-sm font-bold text-gray-400">Physician: {patient.physicianName}</p>

              <div className="flex justify-between mt-4">
                <button
                  className="px-4 py-2 border border-blue-500 text-blue-600 rounded-md hover:bg-blue-100"
                  onClick={() => {
                    setSelectedPatientId(patient.patientId);
                    setShowAppointment(true);
                  }}
                >
                  Appointments
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAppointment && (
        <div
          className="fixed inset-0 bg-opacity-50 flex justify-center items-center"
          onClick={closeAppointmentModal}
        >
          <div
            className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-[60vw] max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Appointment patientId={selectedPatientId} />
            <button
              className="mt-4 bg-gray-500 text-white px-4 py-2 rounded w-full hover:bg-gray-600"
              onClick={closeAppointmentModal}
            >
              ✖
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default ChartAppointments;
