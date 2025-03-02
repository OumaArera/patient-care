import React, { useState } from "react";
import { FaUserCircle } from "react-icons/fa";

const PatientCard = ({ patients }) => {
  console.log("Patients: ", patients);
  const [currentPage, setCurrentPage] = useState(0);
  const patientsPerPage = 3;

  // Pagination logic
  const startIndex = currentPage * patientsPerPage;
  const paginatedPatients = patients.slice(startIndex, startIndex + patientsPerPage);

  const nextPage = () => {
    if (startIndex + patientsPerPage < patients.length) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid gap-6">
        {paginatedPatients.map((patient, index) => (
          <div key={index} className="bg-gray-800 p-6 rounded-2xl shadow-lg text-white flex flex-col items-center space-y-4 transition-transform transform hover:scale-105">
            {/* Avatar */}
            <div className="w-20 h-20 flex items-center justify-center rounded-full bg-gray-700">
              <FaUserCircle className="w-16 h-16 text-gray-500" />
            </div>

            {/* Patient Info */}
            <div className="text-center">
              <h3 className="font-bold text-xl text-blue-400">{patient.firstName} {patient.middleNames && patient.middleNames} {patient.lastName}</h3>
              <p className="text-gray-400 text-sm">DOB: {patient.dateOfBirth}</p>
            </div>

            {/* Medical Info */}
            <div className="w-full bg-gray-700 p-4 rounded-lg text-sm space-y-2">
              <div>
                <span className="text-gray-400 font-semibold">Diagnosis:</span>
                <p className="text-blue-300 text-right">{patient.diagnosis}</p>
              </div>
              <div>
                <span className="text-gray-400 font-semibold">Physician:</span>
                <p className="text-blue-300 text-right">{patient.physicianName}</p>
              </div>
              <div>
                <span className="text-gray-400 font-semibold">PCP/Doctor:</span>
                <p className="text-blue-300 text-right">{patient.pcpOrDoctor}</p>
              </div>
              <div>
                <span className="text-gray-400 font-semibold">Branch:</span>
                <p className="text-blue-300 text-right">{patient.branchName}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between mt-6">
        <button
          onClick={prevPage}
          disabled={currentPage === 0}
          className={`px-4 py-2 rounded bg-gray-600 text-white ${currentPage === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-500"}`}
        >
          Previous
        </button>
        <button
          onClick={nextPage}
          disabled={startIndex + patientsPerPage >= patients.length}
          className={`px-4 py-2 rounded bg-blue-500 text-white ${startIndex + patientsPerPage >= patients.length ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"}`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PatientCard;
