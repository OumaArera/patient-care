import React, { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { fetchPatients } from "../services/getPatientManagers";
import { Loader } from "lucide-react";
import Appointment from "./Appointment";

const ChartAppointments = () => {
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [showAppointment, setShowAppointment] = useState(false);
  const [patients, setPatients] = useState([]);
  
  useEffect(() => {
    const branch = localStorage.getItem("branch");
    if (!branch) return;
    setLoadingPatients(true);
    fetchPatients(branch)
      .then((data) => {
        setPatients(data?.responseObject || []);
      })
      .catch(() => {})
      .finally(() => setLoadingPatients(false));
  }, []);
  
  const closeAppointmentModal = () => {
    setShowAppointment(false);
    setSelectedPatientId(null);
  };
  
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Residents</h2>
      
      {loadingPatients ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="animate-spin text-blue-400" size={36} />
          <p className="ml-2 text-gray-400">Loading residents...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patients.map((patient) => (
            <div 
              key={patient.patientId}
              className="bg-gray-800 p-4 rounded-lg shadow-lg hover:bg-gray-700 transition cursor-pointer"
            >
              <div className="flex items-center mb-3">
                <FaUserCircle className="text-blue-400 text-3xl mr-3" />
                <h3 className="text-xl font-semibold">{patient.firstName} {patient.lastName}</h3>
              </div>
              
              <div className="text-sm text-gray-300 mb-1">
                DOB: {new Date(patient.dateOfBirth + "T00:00:00").toLocaleDateString("en-US")}
              </div>
              
              <div className="text-sm text-gray-300 mb-1">
                Diagnosis: {patient.diagnosis}
              </div>
              
              <div className="text-sm text-gray-300 mb-4">
                Physician: {patient.physicianName}
              </div>
              
              <button
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                onClick={() => {
                  setSelectedPatientId(patient.patientId);
                  setShowAppointment(true);
                }}
              >
                Appointments
              </button>
            </div>
          ))}
        </div>
      )}
      
      {showAppointment && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50"
          onClick={closeAppointmentModal}
        >
          <div
            className="bg-gray-900 p-6 rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Appointment patientId={selectedPatientId} />
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
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