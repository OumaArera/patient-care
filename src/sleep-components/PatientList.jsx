// sleep-components/PatientList.jsx
import React from "react";
import { FaUserCircle } from "react-icons/fa";

const PatientList = ({ patients, selectedPatientId, onPatientSelect }) => {
  return (
    <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto pr-1">
      {patients.length === 0 ? (
        <div className="p-4 bg-gray-700 rounded-lg text-center">
          <p>No residents found for this branch</p>
        </div>
      ) : (
        patients.map((patient) => (
          <div
            key={patient.patientId}
            className={`p-3 rounded-lg shadow cursor-pointer transition-colors ${
              selectedPatientId === patient.patientId
                ? "bg-green-800"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
            onClick={() => onPatientSelect(patient.patientId)}
          >
            <div className="flex items-center">
              <FaUserCircle size={36} className="text-blue-400 mr-3" />
              <div>
                <h3 className="font-bold">
                  {patient.firstName} {patient.lastName}
                </h3>
                <p className="text-xs text-gray-400">ID: {patient.patientId}</p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default PatientList;