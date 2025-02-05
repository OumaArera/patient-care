import React from "react";
import { FaUserCircle } from "react-icons/fa";

const PatientCard = ({ patient }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg text-white flex flex-col items-center space-y-4 transition-transform transform hover:scale-105">
      <div className="w-20 h-20 flex items-center justify-center rounded-full bg-gray-700">
        {patient.avatar ? (
          <img src={patient.avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />
        ) : (
          <FaUserCircle className="w-16 h-16 text-gray-500" />
        )}
      </div>

      <div className="text-center">
        <h3 className="font-bold text-xl text-blue-400">{patient.firstName} {patient.middleNames && patient.middleNames} {patient.lastName}</h3>
        <p className="text-gray-400 text-sm">DOB: {patient.dateOfBirth}</p>
      </div>

      <div className="w-full bg-gray-700 p-4 rounded-lg text-sm grid gap-2">
        <p className="flex justify-between">
          <span className="text-gray-400">Diagnosis:</span>
          <span className="text-blue-300">{patient.diagnosis}</span>
        </p>
        <p className="flex justify-between">
          <span className="text-gray-400">Physician:</span>
          <span className="text-blue-300">{patient.physicianName}</span>
        </p>
        <p className="flex justify-between">
          <span className="text-gray-400">PCP/Doctor:</span>
          <span className="text-blue-300">{patient.pcpOrDoctor}</span>
        </p>
        <p className="flex justify-between">
          <span className="text-gray-400">Branch:</span>
          <span className="text-blue-300">{patient.branchName}</span>
        </p>
        <p className="flex justify-between">
          <span className="text-gray-400">Room:</span>
          <span className="text-blue-300">{patient.room}</span>
        </p>
        <p className="flex justify-between">
          <span className="text-gray-400">Cart:</span>
          <span className="text-blue-300">{patient.cart}</span>
        </p>
      </div>
    </div>
  );
};

export default PatientCard;
