import React from "react";
import { FaUserCircle } from "react-icons/fa";

const PatientCard = ({ patient }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg text-white flex flex-col items-center space-y-4 transition-transform transform hover:scale-105">
      <div className="w-20 h-20 flex items-center justify-center rounded-full bg-gray-700">
        <FaUserCircle className="w-16 h-16 text-gray-500" />
      </div>

      <div className="text-center">
        <h3 className="font-bold text-xl text-blue-400">{patient.firstName} {patient.middleNames && patient.middleNames} {patient.lastName}</h3>
        <p className="text-gray-400 text-sm">DOB: {patient.dateOfBirth}</p>
      </div>

      {/* <div className="w-full bg-gray-700 p-4 rounded-lg text-sm grid gap-2"> */}
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
  );
};

export default PatientCard;
