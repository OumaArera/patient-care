import React, { useState } from "react";
import { Search } from "lucide-react";

const PatientList = ({ patients, selectedPatientId, onPatientSelect }) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter patients based on search term
  const filteredPatients = patients.filter(patient => {
    const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  return (
    <div>
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search size={16} className="text-gray-400" />
        </div>
        <input
          type="search"
          placeholder="Search residents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-gray-700 border border-gray-600 text-white rounded-lg pl-10 p-2.5 w-full"
        />
      </div>

      {filteredPatients.length === 0 ? (
        <div className="text-gray-400 text-center p-4">
          No residents found
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {filteredPatients.map((patient) => (
            <div
              key={patient.patientId}
              onClick={() => onPatientSelect(patient.patientId)}
              className={`p-3 rounded-lg cursor-pointer ${
                parseInt(selectedPatientId) === parseInt(patient.patientId)
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 hover:bg-gray-600 text-gray-200"
              }`}
            >
              <div className="font-medium">
                {patient.firstName} {patient.lastName}
              </div>
              <div className="text-sm opacity-80">
                {patient.roomName || "No room assigned"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientList;