import React, { useEffect, useState } from "react";
import { fetchPatients } from "../services/getPatientManagers";
import { FaUserCircle } from "react-icons/fa";
import { Loader } from "lucide-react";
import Update from "./Update";

const ChartUpdate = () => {
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [showUpdates, setShowUpdates] = useState(false);
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

  const handleUpdateClick = (patientId) => {
    setSelectedPatientId(patientId);
  };

  const closeUpdateModal = () => {
    setShowUpdates(false);
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
          {patients.map((patient) => (
            <div key={patient.patientId} className="bg-gray-800 p-4 rounded-lg shadow-lg text-left">
              <FaUserCircle size={50} className="mx-auto text-blue-400 mb-3" />
              <h3 className="text-lg font-bold">{patient.firstName} {patient.lastName}</h3>
              <p className="text-sm font-bold text-gray-400">DOB: {patient.dateOfBirth}</p>
              <p className="text-sm font-bold text-gray-400">Diagnosis: {patient.diagnosis}</p>
              <p className="text-sm font-bold text-gray-400">Physician: {patient.physicianName}</p>
              
              <div className="flex justify-center mt-4">
                <button
                  className="px-4 py-2 border border-green-500 text-green-600 rounded-md hover:bg-green-100"
                  onClick={() => {
                    handleUpdateClick(patient.patientId);
                    setShowUpdates(true);
                  }}
                >
                  Updates
                </button>
              </div>
            </div>
          ))}

        </div>
      )}

    {showUpdates && (
      <div
        className="fixed inset-0 bg-opacity-50 flex justify-center items-center"
        onClick={closeUpdateModal}
      >
        <div
          className="bg-gray-800 p-6 rounded-lg shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <Update patientId={selectedPatientId} />
          <button
            className="mt-4 bg-gray-500 text-white px-4 py-2 rounded w-full hover:bg-gray-600"
            onClick={closeUpdateModal}
          >
            ✖
          </button>
        </div>
      </div>
    )}
      
    </div>
  );
};

export default ChartUpdate;
